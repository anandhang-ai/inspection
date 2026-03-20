require('dotenv').config();
const mcpClient = require('./mcpClient');

async function handlePR(prNumber) {
    try {
        console.log(`Step 1: Fetching details for PR ${prNumber}...`);
        const result = await mcpClient.getPRDetails(prNumber);

        if (result.type === 'error') {
            console.error('SAP Error while fetching details:', result.result);
            return;
        }

        const items = result.result?.REQUISITION_ITEMS || [];
        if (items.length === 0) {
            console.warn('No items found. Maybe the PR is already closed or inactive.');
            return;
        }

        console.log(`Found ${items.length} items. Processing first item: ${items[0].PREQ_ITEM}`);

        console.log('Step 2: Creating Purchase Order...');
        const poResult = await mcpClient.createPOFromPR(prNumber, items[0].PREQ_ITEM);

        if (poResult.type === 'error') {
            console.error('SAP Error during PO creation:', poResult.result);
            // logic to resolve common errors could go here
            if (poResult.result.includes('Vendor')) {
                console.log('Detected Vendor error. The PO creation might need a valid vendor in the payload.');
            }
        } else {
            const poNumber = poResult.result?.EXPPURCHASEORDER || poResult.result;
            console.log('Success! PO Created:', poNumber);
        }

    } catch (err) {
        console.error('Unexpected script error:', err);
    }
}

handlePR('0010017370');
