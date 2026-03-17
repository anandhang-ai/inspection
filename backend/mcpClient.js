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
                SALESORG: "1000",
                DISTR_CHAN: "10",
                DIVISION: "00"
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
}

module.exports = new PillirFlowClient();
