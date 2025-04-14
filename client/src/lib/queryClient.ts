import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
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
  // Check if we can use cache for GET requests
  if (method.toUpperCase() === 'GET') {
    const cacheKey = url;
    const now = Date.now();
    const cached = cache[cacheKey];
    
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
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
  
  // Return empty object for success cases with no content
  return {};
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const cacheKey = url;
    const now = Date.now();
    const cached = cache[cacheKey];
    
    // Use cache if available and fresh
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    
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
      staleTime: 30000, // 30 seconds
      retry: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
    },
  },
});
