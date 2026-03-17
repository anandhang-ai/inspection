// searchCustomerBAPIs.js
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

    const client = new Client({ name: "BAPISearcher", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    console.log("Searching for Customer BAPIs...");
    const result = await client.callTool({
        name: "search_sap",
        arguments: {
            name: "Customer BAPIs",
            description: "BAPIs for Customer Get Detail, Create, Update, Delete",
            apis: [{
                name: "Customer",
                description: "Customer Master Data",
                system_type: "SAP_ECC",
                functions: []
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
