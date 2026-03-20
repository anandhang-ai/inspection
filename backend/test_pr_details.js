require('dotenv').config();
const mcpClient = require('./mcpClient');

async function getDetails() {
    try {
        const prNumber = '0010017370';
        console.log(`Fetching details for PR: ${prNumber}`);
        const result = await mcpClient.getPRDetails(prNumber);
        console.log('PR Details Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error fetching PR details:', err);
    }
}

getDetails();
