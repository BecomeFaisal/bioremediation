const axios = require('axios');
const OPENROUTER_API_KEY = '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';

axios.post(
  'https://openrouter.ai/api/v1/chat/completions',
  {
    model: 'moonshotai/kimi-dev-72b:free',
    messages: [
      { role: 'system', content: 'You are an expert in bioremediation.' },
      { role: 'user', content: 'Test bioremediation scenario.' }
    ],
    max_tokens: 50
  },
  {
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
).then(res => {
  console.log(res.data);
}).catch(err => {
  console.error(err.response ? err.response.data : err.message);
});