// searchPRBAPIs.js
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

    const client = new Client({ name: "PRInspector", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    console.log("Searching for Purchase Requisition BAPIs...");
    const result = await client.callTool({
        name: "search_sap",
        arguments: {
            name: "Purchase Requisition Search",
            description: "Find PR BAPIs",
            apis: [{
                name: "PurchaseRequisition",
                description: "Purchase Requisitions",
                system_type: "SAP_ECC",
                functions: [
                    { name: "BAPI_PR_GETLIST", description: "Get PR List", rfc: true },
                    { name: "BAPI_PR_CREATE", description: "Create PR", rfc: true },
                    { name: "BAPI_REQUISITION_GETDETAIL", description: "Get PR Detail", rfc: true }
                ]
            }]
        }
    });
    console.log("RESULT:", JSON.stringify(result, null, 2));
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
