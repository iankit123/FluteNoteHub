// Import seed data
const { users } = require('../seed/data');
const { debug } = require('../utils/debug');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Log request details
  debug.log(`[users] Received ${event.httpMethod} request`);
  debug.log(`[users] Query parameters:`, event.queryStringParameters);
  
  // Handle OPTIONS request (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    debug.log('[users] Handling OPTIONS request (CORS preflight)');
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    try {
      debug.log(`[users] Returning ${users.length} users`);
      
      // Return all users (in a real app, you'd want to filter sensitive info)
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
        bio: user.bio || '',
        // Don't include password or other sensitive fields
      }));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(sanitizedUsers)
      };
    } catch (error) {
      debug.error('[users] Error processing request:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Internal server error',
          message: error.message,
          source: 'netlify-function',
          timestamp: new Date().toISOString()
        })
      };
    }
  }

  // Handle unsupported methods
  debug.log(`[users] Unsupported method: ${event.httpMethod}`);
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ 
      error: 'Method not allowed',
      source: 'netlify-function',
      timestamp: new Date().toISOString()
    })
  };
};
