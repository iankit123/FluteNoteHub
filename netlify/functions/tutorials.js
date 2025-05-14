// Serverless function for tutorials API
const { tutorials } = require('./seed');

exports.handler = async function(event, context) {
  // Handle GET request for all tutorials
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify(tutorials),
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
