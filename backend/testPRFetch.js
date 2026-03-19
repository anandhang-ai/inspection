// testPRFetch.js
require('dotenv').config();
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");
const EventSource = require("eventsource");

async function main() {
    const transport = new SSEClientTransport(new URL("https://flow.pillir.ai/mcp/sse"), {
        eventSourceInitDict: {
            headers: {
                "X-FLOW-API-KEY": process.env.PILLIR_API_KEY,
                "mcp-protocol-version": "2024-11-05",
                "X-PILLIR-PLUGIN-ID": "d39207a4-1d01-4aa9-ab18-89a7ea1cd9a7"
            }
        },
        requestInit: {
            headers: {
                "X-FLOW-API-KEY": process.env.PILLIR_API_KEY,
                "mcp-protocol-version": "2024-11-05",
                "X-PILLIR-PLUGIN-ID": "d39207a4-1d01-4aa9-ab18-89a7ea1cd9a7"
            }
        },
        eventSourceConstructor: EventSource
    });

    const client = new Client({ name: "PRTester", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    console.log("Fetching Purchase Requisition Items...");
    const result = await client.callTool({
        name: "execute_function",
        arguments: {
            function_module_name: "BAPI_REQUISITION_GETITEMSBYITEM",
            input_data: {
                MATERIAL: "100-100", // Using a material to find related PRs
                // Or leave empty if listing all
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
                RETURN: {
                    TYPE: "string",
                    MESSAGE: "string"
                }
            }
        }
    });
    console.log("RESULT:", JSON.stringify(result, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
