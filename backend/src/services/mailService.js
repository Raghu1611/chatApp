const axios = require('axios');
const config = require('../config/env');

async function sendEmail(to, subject, html) {
  const res = await axios.post(config.mailApiUrl, { to, subject, html }, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.mailApiKey,
    },
    timeout: 10000,
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error('Mail service failed');
  }
  return res.data;
}

module.exports = { sendEmail };
