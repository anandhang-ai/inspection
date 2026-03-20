require('dotenv').config();
const mcpClient = require('./mcpClient');

async function checkPR() {
    try {
        const prNumber = '0010017371';
        console.log(`Step 1: Fetching PR details for ${prNumber}...`);

        const result = await mcpClient.callTool("execute_function", {
            function_module_name: "BAPI_REQUISITION_GETDETAIL",
            input_data: { NUMBER: prNumber.padStart(10, '0') },
            expected_output_structure: {
                REQUISITION_ITEMS: [{}],
                REQUISITION_ACCOUNT_ASSIGNMENT: [{}],
                REQUISITION_SERVICES: [{}],
                RETURN: [{}]
            }
        });

        console.log('--- SAP FULL PR DATA ---');
        console.log(JSON.stringify(result, null, 2));

    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

checkPR();
