/**
 * Debug utility for FluteNoteHub
 * Provides extensive logging capabilities for troubleshooting
 */

// Environment detection
export const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
export const environment = isProduction ? 'production' : 'development';

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// Current log level - set to maximum in production for debugging
const currentLogLevel = isProduction ? LogLevel.TRACE : LogLevel.INFO;

// Styling for different log types
const logStyles = {
  error: 'background: #f44336; color: white; padding: 2px 4px; border-radius: 2px;',
  warn: 'background: #ff9800; color: white; padding: 2px 4px; border-radius: 2px;',
  info: 'background: #2196f3; color: white; padding: 2px 4px; border-radius: 2px;',
  debug: 'background: #9c27b0; color: white; padding: 2px 4px; border-radius: 2px;',
  trace: 'background: #607d8b; color: white; padding: 2px 4px; border-radius: 2px;',
  network: 'background: #4caf50; color: white; padding: 2px 4px; border-radius: 2px;',
  api: 'background: #e91e63; color: white; padding: 2px 4px; border-radius: 2px;',
};

// Logging functions
export const logger = {
  error: (message: string, ...args: any[]) => {
    if (currentLogLevel >= LogLevel.ERROR) {
      console.error(`%c ERROR `, logStyles.error, `[${environment}] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(`%c WARN `, logStyles.warn, `[${environment}] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (currentLogLevel >= LogLevel.INFO) {
      console.info(`%c INFO `, logStyles.info, `[${environment}] ${message}`, ...args);
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.debug(`%c DEBUG `, logStyles.debug, `[${environment}] ${message}`, ...args);
    }
  },
  
  trace: (message: string, ...args: any[]) => {
    if (currentLogLevel >= LogLevel.TRACE) {
      console.log(`%c TRACE `, logStyles.trace, `[${environment}] ${message}`, ...args);
    }
  },
  
  network: (message: string, ...args: any[]) => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.log(`%c NETWORK `, logStyles.network, `[${environment}] ${message}`, ...args);
    }
  },
  
  api: (message: string, ...args: any[]) => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.log(`%c API `, logStyles.api, `[${environment}] ${message}`, ...args);
    }
  }
};

// Network request debugging
export const debugFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const startTime = performance.now();
  const requestId = Math.random().toString(36).substring(2, 9);
  
  logger.network(`[${requestId}] Request: ${options?.method || 'GET'} ${url}`);
  if (options?.body) {
    try {
      const body = JSON.parse(options.body as string);
      logger.network(`[${requestId}] Request body:`, body);
    } catch (e) {
      logger.network(`[${requestId}] Request body: ${options.body}`);
    }
  }
  
  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    
    logger.network(`[${requestId}] Response: ${response.status} ${response.statusText} (${duration}ms)`);
    
    // Clone the response to log its content without consuming it
    const clonedResponse = response.clone();
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await clonedResponse.json();
        logger.network(`[${requestId}] Response data:`, data);
      } else {
        const text = await clonedResponse.text();
        logger.network(`[${requestId}] Response text: ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`);
      }
    } catch (e) {
      logger.network(`[${requestId}] Could not parse response: ${e}`);
    }
    
    return response;
  } catch (error) {
    logger.error(`[${requestId}] Fetch error:`, error);
    throw error;
  }
};

// Export default logger
export default logger;
