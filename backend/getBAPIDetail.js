// getBAPIDetail.js
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

    const client = new Client({ name: "BAPIInspector", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    console.log("Searching for BAPI_CUSTOMER_CREATEFROMDATA1 details...");
    const result = await client.callTool({
        name: "search_sap",
        arguments: {
            name: "Customer Create BAPI",
            description: "Detailed structure for BAPI_CUSTOMER_CREATEFROMDATA1",
            apis: [{
                name: "Customer",
                description: "Customer Data",
                system_type: "SAP_ECC",
                functions: [
                    { name: "BAPI_CUSTOMER_CREATEFROMDATA1", description: "Create", rfc: true }
                ]
            }]
        }
    });

    // Attempt to drill down into the response
    if (result.content && result.content[0]) {
        console.log("FULL RESULT:", result.content[0].text);
    }
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
