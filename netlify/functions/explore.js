// Serverless function for the Explore tab content
const { tutorials, tags, notes } = require('./seed');

// Debug helper function
const logDebug = (message, data) => {
  console.log(`EXPLORE API: ${message}`, data ? JSON.stringify(data).substring(0, 200) + '...' : '');
};

exports.handler = async function(event, context) {
  // Log request details for debugging
  logDebug('Request received', { 
    path: event.path,
    httpMethod: event.httpMethod,
    queryParams: event.queryStringParameters,
    headers: event.headers
  });
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
  const category = params.category || 'all';
  const type = params.type || 'all'; // 'youtube', 'website', etc.
  
  // Handle GET request for explore content
  if (event.httpMethod === 'GET') {
    logDebug('Processing GET request for explore data');
    
    // Create a comprehensive dataset for the Explore tab
    logDebug('Preparing tutorials data', { count: tutorials.length });
    const tutorialsWithTags = tutorials.map(tutorial => {
      const tutorialTags = tags.filter((_, index) => index % 3 === tutorial.id % 3);
      const type = ['youtube', 'website', 'text'][tutorial.id % 3];
      
      return {
        ...tutorial,
        tags: tutorialTags,
        type: type
      };
    });
    
    logDebug('Tutorials processed successfully', { count: tutorialsWithTags.length });
    
    const exploreData = {
      tutorials: tutorialsWithTags,
      featuredContent: [
        {
          id: 101,
          title: "Beginner Flute Lessons",
          description: "Start your flute journey with these beginner lessons",
          thumbnailUrl: "https://example.com/images/beginner-lessons.jpg",
          url: "https://www.youtube.com/watch?v=example1",
          type: "youtube",
          category: "learning"
        },
        {
          id: 102,
          title: "Flute Maintenance Guide",
          description: "Learn how to properly maintain your flute",
          thumbnailUrl: "https://example.com/images/maintenance.jpg",
          url: "https://www.flutemaintenance.com",
          type: "website",
          category: "maintenance"
        },
        {
          id: 103,
          title: "Advanced Flute Techniques",
          description: "Master advanced flute techniques with this comprehensive guide",
          thumbnailUrl: "https://example.com/images/advanced.jpg",
          url: "https://example.com/advanced-techniques",
          type: "text",
          category: "learning"
        }
      ],
      recentNotes: notes
    };

    // Filter content based on category if specified
    if (category !== 'all') {
      logDebug(`Filtering by category: ${category}`);
      exploreData.tutorials = exploreData.tutorials.filter(
        item => item.category === category
      );
      exploreData.featuredContent = exploreData.featuredContent.filter(
        item => item.category === category
      );
      logDebug('After category filtering', { 
        tutorialCount: exploreData.tutorials.length,
        featuredCount: exploreData.featuredContent.length 
      });
    }

    // Filter content based on type if specified
    if (type !== 'all') {
      logDebug(`Filtering by type: ${type}`);
      exploreData.tutorials = exploreData.tutorials.filter(
        item => item.type === type
      );
      exploreData.featuredContent = exploreData.featuredContent.filter(
        item => item.type === type
      );
      logDebug('After type filtering', { 
        tutorialCount: exploreData.tutorials.length,
        featuredCount: exploreData.featuredContent.length 
      });
    }

    // Add a special flag to help debug if the data is coming from Netlify functions
    exploreData.source = 'netlify-function';
    exploreData.timestamp = new Date().toISOString();
    
    logDebug(`Returning explore data with ${exploreData.tutorials.length} tutorials and ${exploreData.featuredContent.length} featured items`);
    
    // Return the response with detailed headers for debugging
    const responseHeaders = {
      ...headers,
      'X-Debug-Source': 'netlify-function',
      'X-Debug-Timestamp': new Date().toISOString(),
      'X-Debug-TutorialCount': exploreData.tutorials.length.toString(),
      'X-Debug-FeaturedCount': exploreData.featuredContent.length.toString()
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(exploreData),
      headers: responseHeaders
    };
  }
  
  // Handle other HTTP methods
  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
    headers
  };
};
