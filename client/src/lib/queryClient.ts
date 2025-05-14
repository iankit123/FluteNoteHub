import { QueryClient, QueryFunction } from "@tanstack/react-query";
import logger, { debugFetch, isProduction } from "./debug";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    logger.error(`API Response Error: ${res.status}: ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

// Create a simple cache for GET requests
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 3000; // 3 seconds

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  logger.api(`Request: ${method} ${url}`, data);
  
  // Add debugging information to URL for production environment
  const requestUrl = isProduction ? 
    `${url}${url.includes('?') ? '&' : '?'}_debug=true&_env=prod&_ts=${Date.now()}` : 
    url;
  
  logger.api(`Full request URL: ${requestUrl}`);
  
  // Check if we can use cache for GET requests
  if (method.toUpperCase() === 'GET') {
    const cacheKey = url;
    const now = Date.now();
    const cached = cache[cacheKey];
    
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      logger.api(`Using cached data for ${url}`, cached.data);
      return cached.data;
    }
  }
  
  try {
    logger.api(`Sending ${method} request to ${requestUrl}`);
    
    // Use debugFetch instead of regular fetch
    const res = await debugFetch(requestUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      logger.error(`API error ${res.status}: ${res.statusText}`);
      const errorText = await res.text();
      logger.error(`Error details: ${errorText}`);
      throw new Error(`${res.status}: ${res.statusText} - ${errorText}`);
    }
    
    // For GET requests, automatically parse the JSON and cache it
    if (method.toUpperCase() === 'GET') {
      const responseData = await res.json();
      
      // Store in cache
      cache[url] = {
        data: responseData,
        timestamp: Date.now()
      };
      
      return responseData;
    }
    
    // For other methods, try to parse if content exists
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json') && res.status !== 204) {
      return res.json();
    }
    
    // Return the response for further processing
    return res;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    logger.api(`Query function called for key: ${url}`);
    
    // Add debugging information to URL for production environment
    const requestUrl = isProduction ? 
      `${url}${url.includes('?') ? '&' : '?'}_debug=true&_env=prod&_ts=${Date.now()}` : 
      url;
    
    logger.api(`Full request URL: ${requestUrl}`);
    
    const cacheKey = url;
    const now = Date.now();
    const cached = cache[cacheKey];
    
    // Use cache if available and fresh
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      logger.api(`Using cached data for ${url}`, cached.data);
      return cached.data;
    }
    
    logger.api(`Fetching data from ${requestUrl}`);
    
    // Use debugFetch instead of regular fetch
    const res = await debugFetch(requestUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      logger.warn(`Unauthorized (401) for ${url}, returning null as configured`);
      return null;
    }

    await throwIfResNotOk(res);
    logger.api(`Parsing JSON response from ${url}`);
    const data = await res.json();
    logger.api(`Received data from ${url}:`, data);
    
    // Store in cache
    cache[cacheKey] = {
      data,
      timestamp: Date.now()
    };
    
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 2000, // 2 seconds
      retry: false,
      refetchOnMount: "always",
      // Make cache invalidation more aggressive
      gcTime: 10000, // 10 seconds
    },
    mutations: {
      retry: false,
      // Automatically invalidate relevant queries after mutations
      onSuccess: (_, variables, context: any) => {
        // This will be overridden by specific mutation configs but provides a good default
        const url = context?.url || '';
        if (url) {
          const queryKey = url.split('?')[0]; // Remove query params
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      }
    },
  },
});
