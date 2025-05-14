// Serverless function for tags API
const { tags } = require('./seed');

exports.handler = async function(event, context) {
  // Enable CORS for all requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request (for CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Parse query parameters
  const params = event.queryStringParameters || {};
  const category = params.category;
  
  // Handle GET request for all tags
  if (event.httpMethod === 'GET') {
    let filteredTags = [...tags];
    
    // Filter by category if provided
    if (category) {
      filteredTags = filteredTags.filter(tag => 
        tag.category.toLowerCase() === category.toLowerCase());
    }
    
    console.log(`Returning ${filteredTags.length} tags`);
    
    return {
      statusCode: 200,
      body: JSON.stringify(filteredTags),
      headers
    };
  }
  
  // Handle other HTTP methods
  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
    headers
  };
};
