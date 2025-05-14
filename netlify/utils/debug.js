/**
 * Debug utility for Netlify Functions
 * Provides consistent logging and error handling
 */

const debug = {
  log: (...args) => {
    console.log('[netlify-function]', ...args);
  },
  
  error: (...args) => {
    console.error('[netlify-function]', ...args);
  },
  
  warn: (...args) => {
    console.warn('[netlify-function]', ...args);
  },
  
  info: (...args) => {
    console.info('[netlify-function]', ...args);
  },
  
  // Helper to create standardized error responses
  createErrorResponse: (statusCode, message, details = null) => {
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: message,
        details: details,
        source: 'netlify-function',
        timestamp: new Date().toISOString()
      })
    };
  }
};

module.exports = { debug };
