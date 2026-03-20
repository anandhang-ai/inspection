const axios = require('axios');

async function checkPR() {
    try {
        console.log('Fetching detail from local API for PR 0010017371...');
        const response = await axios.get('http://localhost:5000/api/pr/0010017371', {
            headers: { 'Authorization': 'Bearer ' + 'dummy_test_not_really_authenticated_but_maybe_the_token_is_in_env' }
        });
        console.log('API Result:', JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('API Error:', err.response?.data?.message || err.message);
    }
}

checkPR();
