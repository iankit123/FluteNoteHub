// Serverless function for tags API
const { tags } = require('./seed');

exports.handler = async function(event, context) {
  // Handle GET request for all tags
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify(tags),
      headers: { 'Content-Type': 'application/json' }
    };
  }
  
  // Handle other HTTP methods
  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
    headers: { 'Content-Type': 'application/json' }
  };
};
