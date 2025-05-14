// Serverless function for user login
const { users } = require('./seed');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { username, password } = data;

    // Validate input
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username and password are required' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Find user in seed data (in a real app, this would query a database)
    // This is a simplified version - in production you would use proper authentication
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid username or password' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      statusCode: 200,
      body: JSON.stringify(userWithoutPassword),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('Login error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
