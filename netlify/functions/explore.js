// Serverless function for the Explore tab content
const { tutorials, tags, notes } = require('./seed');

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
  const category = params.category || 'all';
  const type = params.type || 'all'; // 'youtube', 'website', etc.
  
  // Handle GET request for explore content
  if (event.httpMethod === 'GET') {
    // Create a comprehensive dataset for the Explore tab
    const exploreData = {
      tutorials: tutorials.map(tutorial => ({
        ...tutorial,
        // Add some sample tags to each tutorial
        tags: tags.filter((_, index) => index % 3 === tutorial.id % 3),
        type: ['youtube', 'website', 'text'][tutorial.id % 3] // Assign different types for variety
      })),
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
      exploreData.tutorials = exploreData.tutorials.filter(
        item => item.category === category
      );
      exploreData.featuredContent = exploreData.featuredContent.filter(
        item => item.category === category
      );
    }

    // Filter content based on type if specified
    if (type !== 'all') {
      exploreData.tutorials = exploreData.tutorials.filter(
        item => item.type === type
      );
      exploreData.featuredContent = exploreData.featuredContent.filter(
        item => item.type === type
      );
    }

    console.log(`Returning explore data with ${exploreData.tutorials.length} tutorials and ${exploreData.featuredContent.length} featured items`);
    
    return {
      statusCode: 200,
      body: JSON.stringify(exploreData),
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
