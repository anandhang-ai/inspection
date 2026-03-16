const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
require("dotenv").config();

/**
 * MCP Server that integrates with Google Docs API
 */
class GoogleDocsServer {
    constructor() {
        this.server = new Server(
            {
                name: "google-docs-mcp-server",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                },
            }
        );

        this.docs = google.docs("v1");
        this.setupHandlers();
    }

    /**
     * Initialize Google Auth
     */
    async getAuth() {
        // Automatically find credentials from GOOGLE_APPLICATION_CREDENTIALS env
        const auth = new GoogleAuth({
            scopes: ["https://www.googleapis.com/auth/documents.readonly"],
        });
        return await auth.getClient();
    }

    /**
     * Helper to extract text from a Google Doc
     */
    async getDocText(documentId) {
        const auth = await this.getAuth();
        const res = await this.docs.documents.get({
            auth,
            documentId,
        });

        let content = "";
        const body = res.data.body.content;

        for (const element of body) {
            if (element.paragraph) {
                for (const part of element.paragraph.elements) {
                    if (part.textRun && part.textRun.content) {
                        content += part.textRun.content;
                    }
                }
            }
        }
        return content;
    }

    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "read_google_doc",
                        description: "Read the text content of a Google Document",
                        inputSchema: {
                            type: "object",
                            properties: {
                                documentId: {
                                    type: "string",
                                    description: "The ID of the Google Document to read",
                                },
                            },
                            required: ["documentId"],
                        },
                    },
                ],
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name === "read_google_doc") {
                const { documentId } = request.params.arguments;
                try {
                    const text = await this.getDocText(documentId);
                    return {
                        content: [
                            {
                                type: "text",
                                text: text,
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error reading Google Doc: ${error.message}`,
                            },
                        ],
                        isError: true,
                    };
                }
            }
            throw new Error("Tool not found");
        });

        // List available resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: [
                    {
                        uri: "gdocs://current-doc",
                        name: "Current Google Document",
                        description: "The content of the Google Document specified in config",
                        mimeType: "text/plain",
                    },
                ],
            };
        });

        // Read a specific resource
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            if (request.params.uri === "gdocs://current-doc") {
                const documentId = process.env.GOOGLE_DOC_ID;
                if (!documentId) {
                    throw new Error("GOOGLE_DOC_ID not set in environment");
                }
                try {
                    const text = await this.getDocText(documentId);
                    return {
                        contents: [
                            {
                                uri: request.params.uri,
                                mimeType: "text/plain",
                                text: text,
                            },
                        ],
                    };
                } catch (error) {
                    throw new Error(`Error reading resource: ${error.message}`);
                }
            }
            throw new Error("Resource not found");
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Google Docs MCP server running on stdio");
    }
}

const server = new GoogleDocsServer();
server.run().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
