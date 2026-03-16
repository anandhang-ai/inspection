# Google Docs MCP Server

This is a Model Context Protocol (MCP) server that allows an IDE (like Antigravity) to read content from Google Documents using the Google Docs API.

## Setup

### 1. Google API Credentials
You need to create a project in the [Google Cloud Console](https://console.cloud.google.com/) and enable the **Google Docs API**.

#### Option A: Service Account (Recommended for Server-to-Server)
1. Go to **Credentials** -> **Create Credentials** -> **Service Account**.
2. Create the account and go to the **Keys** tab.
3. Click **Add Key** -> **Create new key** -> **JSON**.
4. Download the JSON file and save it as `credentials.json` in this directory.
5. Set `GOOGLE_APPLICATION_CREDENTIALS=credentials.json` in your environment or `.env` file.
6. **Important**: You must share the Google Doc with the service account email address (found in the JSON file).

#### Option B: OAuth 2.0
1. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
2. Configure the consent screen.
3. Download the credentials and follow the standard Google Auth flow.

### 2. Environment Variables
Create a `.env` file in this directory:
```env
GOOGLE_APPLICATION_CREDENTIALS=credentials.json
GOOGLE_DOC_ID=your_default_document_id_here
```

### 3. Usage with Antigravity
To use this server with Antigravity, add it to your `mcp_servers` configuration:

```json
{
  "mcpServers": {
    "google-docs": {
      "command": "node",
      "args": ["c:/Users/aF/OneDrive/Desktop/Inspection/gdocs-mcp-server/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "c:/Users/aF/OneDrive/Desktop/Inspection/gdocs-mcp-server/credentials.json",
        "GOOGLE_DOC_ID": "your_default_document_id_here"
      }
    }
  }
}
```

## Tools & Resources

### `read_google_doc` (Tool)
- **Description**: Reads the full text content of a specified Google Document.
- **Arguments**:
  - `documentId`: The ID of the Google Document.

### `gdocs://current-doc` (Resource)
- **Description**: Exposes the document specified by `GOOGLE_DOC_ID` as a persistent resource that Antigravity can track and read automatically.
