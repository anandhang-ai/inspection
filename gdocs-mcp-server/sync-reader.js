const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const path = require('path');
require('dotenv').config();

async function readDoc() {
    try {
        const auth = new GoogleAuth({
            keyFile: path.join(__dirname, 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/documents.readonly'],
        });
        const client = await auth.getClient();
        const docs = google.docs({ version: 'v1', auth: client });

        const documentId = process.env.GOOGLE_DOC_ID || '1lCrzhhwBhhgRFXlEM_i_T8d4qS6zj-T0BRN8gKkXfzw';

        const res = await docs.documents.get({ documentId });
        console.log('--- CONTENT START ---');
        res.data.body.content.forEach(element => {
            if (element.paragraph) {
                element.paragraph.elements.forEach(part => {
                    if (part.textRun) process.stdout.write(part.textRun.content);
                });
            }
        });
        console.log('\n--- CONTENT END ---');
    } catch (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
}

readDoc();
