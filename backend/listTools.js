// listTools.js
require('dotenv').config();
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");
const EventSource = require("eventsource");

async function main() {
    const transport = new SSEClientTransport(new URL("https://flow.pillir.ai/mcp/sse"), {
        eventSourceInitDict: {
            headers: {
                "X-FLOW-API-KEY": process.env.PILLIR_API_KEY,
                "mcp-protocol-version": "2024-11-05"
            }
        },
        eventSourceConstructor: EventSource
    });

    const client = new Client({ name: "ToolLister", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    const { tools } = await client.listTools();
    console.log("AVAILABLE TOOLS:");
    tools.forEach(t => {
        console.log(`- ${t.name}: ${t.description.split('\n')[0]}`);
    });
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
