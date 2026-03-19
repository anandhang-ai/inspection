// mcpClient.js
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");
const EventSource = require("eventsource");

class PillirFlowClient {
    constructor() {
        this.client = null;
        this.transport = null;
        this.baseUrl = "https://flow.pillir.ai/mcp/sse";
        this.apiKey = process.env.PILLIR_API_KEY || "EZhw8daoU89JeIKZ2yGuuQt-ko8053Pb2a7IYDhu61k";
    }

    async connect() {
        if (this.client) return this.client;

        console.log("Connecting to Pillir Flow MCP Server via SSE...");

        this.transport = new SSEClientTransport(new URL(this.baseUrl), {
            eventSourceInitDict: {
                headers: {
                    "X-FLOW-API-KEY": this.apiKey,
                    "mcp-protocol-version": "2024-11-05",
                    "X-PILLIR-PLUGIN-ID": "d39207a4-1d01-4aa9-ab18-89a7ea1cd9a7"
                }
            },
            requestInit: {
                headers: {
                    "X-FLOW-API-KEY": this.apiKey,
                    "mcp-protocol-version": "2024-11-05",
                    "X-PILLIR-PLUGIN-ID": "d39207a4-1d01-4aa9-ab18-89a7ea1cd9a7"
                }
            },
            eventSourceConstructor: EventSource
        });

        this.client = new Client(
            {
                name: "InspectionBackend",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        await this.client.connect(this.transport);
        console.log("Successfully connected to Pillir Flow MCP Server");
        return this.client;
    }

    async callTool(name, args) {
        const client = await this.connect();
        const result = await client.callTool({
            name,
            arguments: args,
        });

        // Pillir Flow returns content[0].text as a JSON string
        if (result.content && result.content[0] && result.content[0].text) {
            console.log("MCP Raw Response Text:", result.content[0].text);
            try {
                const parsed = JSON.parse(result.content[0].text);
                console.log("MCP Parsed Response:", JSON.stringify(parsed, null, 2));
                return parsed;
            } catch (e) {
                console.error("Failed to parse MCP response:", e);
                return { type: "error", result: "Failed to parse SAP response: " + result.content[0].text };
            }
        }
        return { type: "error", result: "No response content from SAP" };
    }

    async getMaterialDetail(materialId, plantId = "1000") {
        const result = await this.callTool("execute_function", {
            function_module_name: "BAPI_MATERIAL_GET_DETAIL",
            input_data: {
                MATERIAL: materialId,
                PLANT: plantId
            },
            expected_output_structure: {
                MATERIAL_GENERAL_DATA: {
                    MATL_DESC: "string",
                    MATL_TYPE: "string",
                    BASE_UOM: "string"
                },
                MATERIALVALUATIONDATA: {
                    STD_PRICE: "string",
                    CURRENCY: "string"
                },
                RETURN: {
                    TYPE: "string",
                    MESSAGE: "string"
                }
            }
        });
        return result;
    }

    async saveMaterial(materialData) {
        // Simple mapping for BAPI_MATERIAL_SAVEDATA
        const result = await this.callTool("execute_function", {
            function_module_name: "BAPI_MATERIAL_SAVEDATA",
            input_data: {
                HEADDATA: {
                    MATERIAL: materialData.MATERIAL,
                    IND_SECTOR: "M", // Default to Mechanical Engineering
                    MATL_TYPE: materialData.MATL_TYPE || "HALB",
                    BASIC_VIEW: "X"
                },
                CLIENTDATA: {
                    BASE_UOM: materialData.BASE_UOM || "ST"
                },
                CLIENTDATAX: {
                    BASE_UOM: "X"
                },
                MATERIALDESCRIPTION: [
                    {
                        LANGU: "E",
                        MATL_DESC: materialData.MATL_DESC
                    }
                ]
            },
            expected_output_structure: {
                RETURN: {
                    TYPE: "string",
                    MESSAGE: "string"
                },
                MATERIAL: "string"
            }
        });
        return result;
    }

    async deleteMaterial(materialId) {
        // In SAP, we usually flag for deletion using BAPI_MATERIAL_SAVEDATA
        const result = await this.callTool("execute_function", {
            function_module_name: "BAPI_MATERIAL_SAVEDATA",
            input_data: {
                HEADDATA: {
                    MATERIAL: materialId,
                    DEL_FLAG: "X" // This flags the material for deletion
                }
            },
            expected_output_structure: {
                RETURN: {
                    TYPE: "string",
                    MESSAGE: "string"
                }
            }
        });
        return result;
    }

    // ---------- Customer Methods ----------

    async getCustomerDetail(customerId) {
        const result = await this.callTool("execute_function", {
            function_module_name: "BAPI_CUSTOMER_GETDETAIL2",
            input_data: {
                CUSTOMERNO: customerId
            },
            expected_output_structure: {
                CUSTOMERADDRESS: {
                    NAME: "string",
                    CITY: "string",
                    POSTL_CODE: "string",
                    STREET: "string",
                    COUNTRY: "string",
                    TELEPHONE: "string"
                },
                CUSTOMERGENERALDETAIL: {
                    LANGU: "string",
                    CURRENCY: "string"
                },
                RETURN: {
                    TYPE: "string",
                    MESSAGE: "string"
                }
            }
        });
        return result;
    }

    async saveCustomer(customerData) {
        const isUpdate = !!customerData.CUSTOMERNO && customerData.CUSTOMERNO !== "";
        const functionName = isUpdate ? "BAPI_CUSTOMER_CHANGEFROMDATA1" : "BAPI_CUSTOMER_CREATEFROMDATA1";

        const inputData = {
            CUSTOMERNO: customerData.CUSTOMERNO,
            PI_PERSONALDATA: {
                FIRSTNAME: customerData.FIRSTNAME,
                LASTNAME: customerData.LASTNAME,
                CITY: customerData.CITY,
                POSTL_CODE: customerData.POSTL_CODE,
                STREET: customerData.STREET,
                COUNTRY: customerData.COUNTRY || "US",
                LANGU: "E",
                LANGUAGE: "E",
                LANGU_P: "E",
                LANGU_ISO: "EN",
                LANG: "E",
                CURRENCY: "USD",
                CURRENCY_ISO: "USD"
            }
        };

        if (isUpdate) {
            // Update requires a corresponding "X" structure to tell SAP which fields have changed
            inputData.PI_PERSONALDATAX = {
                FIRSTNAME: "X",
                LASTNAME: "X",
                CITY: "X",
                POSTL_CODE: "X",
                STREET: "X",
                COUNTRY: "X",
                LANGU: "X",
                LANGUAGE: "X",
                LANGU_P: "X",
                LANGU_ISO: "X",
                LANG: "X",
                CURRENCY: "X",
                CURRENCY_ISO: "X"
            };
        } else {
            // Create requires reference data
            inputData.PI_COPYREFERENCE = {
                REF_CUSTMR: "0000000001", // Corrected field name
                SALESORG: customerData.SALESORG || "1000",
                DISTR_CHAN: customerData.DISTR_CHAN || "10",
                DIVISION: customerData.DIVISION || "00"
            };
        }

        const result = await this.callTool("execute_function", {
            function_module_name: functionName,
            input_data: inputData,
            expected_output_structure: {
                CUSTOMERNO: "string",
                RETURN: {
                    TYPE: "string",
                    MESSAGE: "string"
                }
            }
        });
        return result;
    }
    async getPRDetails(prNumber) {
        // Pad with leading zeros to 10 characters for SAP
        const paddedPR = prNumber.padStart(10, '0');

        const result = await this.callTool("execute_function", {
            function_module_name: "BAPI_REQUISITION_GETDETAIL",
            input_data: {
                NUMBER: paddedPR
            },
            expected_output_structure: {
                REQUISITION_ITEMS: [
                    {
                        PREQ_NO: "string",
                        PREQ_ITEM: "string",
                        MATERIAL: "string",
                        PLANT: "string",
                        QUANTITY: "string",
                        SHORT_TEXT: "string"
                    }
                ],
                RETURN: [
                    {
                        TYPE: "string",
                        MESSAGE: "string"
                    }
                ]
            }
        });

        // Check for SAP-level errors in the result
        if (result.type === "result" && result.result?.RETURN) {
            const returns = Array.isArray(result.result.RETURN) ? result.result.RETURN : [result.result.RETURN];
            const error = returns.find(r => r.TYPE === 'E' || r.TYPE === 'A');
            if (error) {
                return {
                    type: "error",
                    result: error.MESSAGE
                };
            }
        }

        return result;
    }

    async createPR(prData) {
        console.log("Creating PR with data:", JSON.stringify(prData, null, 2));
        const payload = {
            REQUISITION_ITEMS: prData.items.map((item, index) => ({
                PREQ_ITEM: "00010",
                DOC_TYPE: "NB",
                PUR_GROUP: "001",
                MATERIAL: item.MATERIAL || "",
                PLANT: item.PLANT || "",
                QUANTITY: (item.QUANTITY || 1).toString(),
                PREQ_PRICE: (item.PRICE || 0).toString(),
                CURRENCY: "USD",
                ACCTASSCAT: item.ACCTASSCAT || "",
                ITEM_CAT: "0", // Standard
                DELIV_DATE: item.DELIV_DATE ? item.DELIV_DATE.split('-').reverse().join('.') : "",
                PREQ_DATE: new Date().toLocaleDateString('de-DE'), // DD.MM.YYYY
                DEL_DATCAT: "1" // 1 = Day format
            })),
            REQUISITION_ACCOUNT_ASSIGNMENT: prData.items.filter(item => item.ACCTASSCAT).map((item, index) => ({
                PREQ_ITEM: "00010",
                SERIAL_NO: "01",
                COSTCENTER: item.COSTCENTER || ""
            }))
        };
        console.log("SAP Payload:", JSON.stringify(payload, null, 2));

        const result = await this.callTool("execute_function", {
            function_module_name: "BAPI_REQUISITION_CREATE",
            input_data: payload,
            expected_output_structure: {
                NUMBER: "string",
                RETURN: [
                    {
                        TYPE: "string",
                        MESSAGE: "string"
                    }
                ]
            }
        });

        // Check for SAP-level errors in the result
        if (result.type === "result" && result.result?.RETURN) {
            const returns = Array.isArray(result.result.RETURN) ? result.result.RETURN : [result.result.RETURN];
            const error = returns.find(r => r.TYPE === 'E' || r.TYPE === 'A');
            if (error) {
                return {
                    type: "error",
                    result: error.MESSAGE
                };
            }
        }

        return result;
    }

    async listPRsByPlant(plant) {
        console.log(`Listing PRs for plant: ${plant}`);
        const result = await this.callTool("execute_function", {
            function_module_name: "RFC_READ_TABLE",
            input_data: {
                QUERY_TABLE: "EBAN",
                DELIMITER: "|",
                OPTIONS: [
                    { TEXT: `WERKS = '${plant.toUpperCase().trim()}'` }
                ],
                FIELDS: [
                    { FIELDNAME: "BANFN" }, // PR Number
                    { FIELDNAME: "BNFPO" }, // Item Number
                    { FIELDNAME: "TXZ01" }, // Short Text
                    { FIELDNAME: "MATNR" }, // Material
                    { FIELDNAME: "MENGE" }, // Quantity
                    { FIELDNAME: "BADAT" }  // Requisition Date
                ]
            },
            expected_output_structure: {
                DATA: [
                    { WA: "string" }
                ]
            }
        });

        console.log("SAP List Result:", JSON.stringify(result, null, 2));

        if (result.type === "result" && result.result?.DATA) {
            result.result = result.result.DATA.map(row => {
                const parts = row.WA.split('|');
                return {
                    BANFN: parts[0]?.trim(),
                    BNFPO: parts[1]?.trim(),
                    TXZ01: parts[2]?.trim(),
                    MATNR: parts[3]?.trim(),
                    MENGE: parts[4]?.trim(),
                    BADAT: parts[5]?.trim()
                };
            }).filter(pr => pr.BANFN);
        }

        return result;
    }

    async createPOFromPR(prNumber, prItem) {
        // Pad with leading zeros
        const paddedPR = prNumber.padStart(10, '0');
        const paddedItem = prItem.padStart(5, '0');

        console.log(`Creating PO from PR: ${paddedPR}, Item: ${paddedItem}`);

        const payload = {
            POHEADER: {
                COMP_CODE: "1000",
                DOC_TYPE: "NB",
                VENDOR: "0000100000", // Default vendor
                PURCH_ORG: "1000",
                PUR_GROUP: "001",
                CURRENCY: "USD"
            },
            POHEADERX: {
                COMP_CODE: "X",
                DOC_TYPE: "X",
                VENDOR: "X",
                PURCH_ORG: "X",
                PUR_GROUP: "X",
                CURRENCY: "X"
            },
            POITEM: [
                {
                    PO_ITEM: "00010",
                    PREQ_NO: paddedPR,
                    PREQ_ITEM: paddedItem
                }
            ],
            POITEMX: [
                {
                    PO_ITEM: "00010",
                    PO_ITEMX: "X",
                    PREQ_NO: "X",
                    PREQ_ITEM: "X"
                }
            ],
            POSCHEDULE: [
                {
                    PO_ITEM: "00010",
                    SCHED_LINE: "0001",
                    PREQ_NO: paddedPR,
                    PREQ_ITEM: paddedItem
                }
            ],
            POSCHEDULEX: [
                {
                    PO_ITEM: "00010",
                    SCHED_LINE: "0001",
                    PO_ITEMX: "X",
                    SCHED_LINEX: "X",
                    PREQ_NO: "X",
                    PREQ_ITEM: "X"
                }
            ]
        };

        const result = await this.callTool("execute_function", {
            function_module_name: "BAPI_PO_CREATE1",
            input_data: payload,
            expected_output_structure: {
                EXPPURCHASEORDER: "string",
                RETURN: [
                    {
                        TYPE: "string",
                        MESSAGE: "string"
                    }
                ]
            }
        });

        if (result.type === "result" && result.result?.RETURN) {
            const returns = Array.isArray(result.result.RETURN) ? result.result.RETURN : [result.result.RETURN];
            const error = returns.find(r => r.TYPE === 'E' || r.TYPE === 'A');
            if (error) {
                return {
                    type: "error",
                    result: error.MESSAGE
                };
            }

            // Success - commit change
            await this.callTool("execute_function", {
                function_module_name: "BAPI_TRANSACTION_COMMIT",
                input_data: { WAIT: "X" },
                expected_output_structure: { RETURN: {} }
            });
        }

        return result;
    }
}

module.exports = new PillirFlowClient();
