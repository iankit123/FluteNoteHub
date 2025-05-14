// Serverless function for tutorials API
const { tutorials, tags } = require('./seed');

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
  const search = params.search;
  
  // Handle GET request for all tutorials
  if (event.httpMethod === 'GET') {
    let filteredTutorials = [...tutorials];
    
    // Filter by category if provided
    if (category && category !== 'all') {
      filteredTutorials = filteredTutorials.filter(tutorial => 
        tutorial.category.toLowerCase() === category.toLowerCase());
    }
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTutorials = filteredTutorials.filter(tutorial => 
        tutorial.title.toLowerCase().includes(searchLower) || 
        (tutorial.description && tutorial.description.toLowerCase().includes(searchLower)));
    }
    
    // Add tag information to each tutorial
    const tutorialsWithTags = filteredTutorials.map(tutorial => {
      // Simulate tutorial tags (in a real app, this would come from a database relation)
      const tutorialTags = tags.filter((_, index) => index % 3 === tutorial.id % 3);
      return {
        ...tutorial,
        tags: tutorialTags
      };
    });
    
    console.log(`Returning ${tutorialsWithTags.length} tutorials`);
    
    return {
      statusCode: 200,
      body: JSON.stringify(tutorialsWithTags),
      headers
    };
  }
  
  // Handle POST request to create a new tutorial
  if (event.httpMethod === 'POST') {
    try {
      // This is a mock implementation - in a real app, you would save to a database
      const newTutorial = JSON.parse(event.body);
      newTutorial.id = tutorials.length + 1;
      newTutorial.createdAt = new Date();
      
      // In a real implementation, we would add this to a database
      // For now, we'll just return the new tutorial as if it was saved
      
      return {
        statusCode: 201,
        body: JSON.stringify(newTutorial),
        headers
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid tutorial data' }),
        headers
      };
    }
  }
  
  // Handle other HTTP methods
  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
    headers
  };
};
