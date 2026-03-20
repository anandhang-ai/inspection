require('dotenv').config();
const mcpClient = require('./mcpClient');

(async () => {
    try {
        const prNumber = '0010017370';
        console.log(`Starting detail search for PR: ${prNumber}`);
        const result = await mcpClient.getPRDetails(prNumber);
        console.log('--- Results ---');
        console.log(JSON.stringify(result, null, 2));

        if (result.type === 'error') {
            console.error('SAP Error:', result.result);
            return;
        }

        const items = result.result?.REQUISITION_ITEMS || [];
        if (items.length === 0) {
            console.error('No items found for this PR.');
            return;
        }

        const firstItem = items[0];
        console.log(`Creating PO for item ${firstItem.PREQ_ITEM}...`);

        const poResult = await mcpClient.createPOFromPR(prNumber, firstItem.PREQ_ITEM);
        console.log('--- PO Result ---');
        console.log(JSON.stringify(poResult, null, 2));

    } catch (err) {
        console.error('Fatal Error:', err);
        if (err.stack) console.error(err.stack);
    }
})();
