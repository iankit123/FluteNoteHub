import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "@/components/ui/toaster";

// Add global error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Add Firebase specific error logging
window.addEventListener('firebase-error', (event: any) => {
  console.error('Firebase error:', event.detail);
});

try {
  console.log('Attempting to render application...');
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('Root element not found!');
  } else {
    const root = createRoot(rootElement);
    root.render(
      <>
        <App />
        <Toaster />
      </>
    );
    console.log('Application rendered successfully.');
  }
} catch (error) {
  console.error('Error during application initialization:', error);
}
