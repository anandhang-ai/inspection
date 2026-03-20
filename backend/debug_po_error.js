require('dotenv').config();
const mcpClient = require('./mcpClient');

async function debugPO() {
    try {
        const prNumber = '0010017371';
        console.log(`Step 1: Fetching PR details for ${prNumber}...`);
        const prResult = await mcpClient.getPRDetails(prNumber);

        if (prResult.type === 'error') {
            console.error('PR Fetch Error:', prResult.result);
            return;
        }

        console.log('PR Details:', JSON.stringify(prResult.result, null, 2));

        const items = prResult.result?.REQUISITION_ITEMS || [];
        if (items.length === 0) {
            console.error('No items found in PR.');
            return;
        }

        const paddedPR = prNumber.padStart(10, '0');
        const paddedItem = items[0].PREQ_ITEM.padStart(5, '0');

        console.log(`Step 2: Attempting PO creation for PR ${paddedPR}, Item ${paddedItem}...`);

        // Manual BAPI call to see full details
        const payload = {
            POHEADER: {
                COMP_CODE: "1000",
                DOC_TYPE: "NB",
                VENDOR: "0000100000", // Default vendor
                PURCH_ORG: "1000",
                PUR_GROUP: "001",
                CURRENCY: "USD"
            },
            POHEADERX: {
                COMP_CODE: "X",
                DOC_TYPE: "X",
                VENDOR: "X",
                PURCH_ORG: "X",
                PUR_GROUP: "X",
                CURRENCY: "X"
            },
            POITEM: [
                {
                    PO_ITEM: "00010",
                    PREQ_NO: paddedPR,
                    PREQ_ITEM: paddedItem
                }
            ],
            POITEMX: [
                {
                    PO_ITEM: "00010",
                    PO_ITEMX: "X",
                    PREQ_NO: "X",
                    PREQ_ITEM: "X"
                }
            ],
            POSCHEDULE: [
                {
                    PO_ITEM: "00010",
                    SCHED_LINE: "0001",
                    PREQ_NO: paddedPR,
                    PREQ_ITEM: paddedItem
                }
            ],
            POSCHEDULEX: [
                {
                    PO_ITEM: "00010",
                    SCHED_LINE: "0001",
                    PO_ITEMX: "X",
                    SCHED_LINEX: "X",
                    PREQ_NO: "X",
                    PREQ_ITEM: "X"
                }
            ]
        };

        const result = await mcpClient.callTool("execute_function", {
            function_module_name: "BAPI_PO_CREATE1",
            input_data: payload,
            expected_output_structure: {
                EXPPURCHASEORDER: "string",
                RETURN: [
                    {
                        TYPE: "string",
                        MESSAGE: "string",
                        MESSAGE_V1: "string",
                        MESSAGE_V2: "string"
                    }
                ]
            }
        });

        console.log('--- SAP FULL RESPONSE ---');
        console.log(JSON.stringify(result, null, 2));

    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

debugPO();
