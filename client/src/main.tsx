import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { UserProvider } from "@/context/UserContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Add global error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  console.log('Attempting to render application...');
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('Root element not found!');
  } else {
    const root = createRoot(rootElement);
    root.render(
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster />
        </QueryClientProvider>
      </UserProvider>
    );
    console.log('Application rendered successfully.');
  }
} catch (error) {
  console.error('Error during application initialization:', error);
}
