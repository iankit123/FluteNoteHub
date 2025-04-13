import React, { useEffect, useState } from 'react';

const Test: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.log('Error captured:', event.error);
      setError(event.error?.message || 'Unknown error');
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.log('Promise rejection captured:', event.reason);
      setError(event.reason?.message || 'Promise rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnostic Test Page</h1>
      <p className="mb-4">This page shows any errors that might be occurring during rendering.</p>
      
      {error ? (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-4">
          <h2 className="text-xl font-bold">Error Detected</h2>
          <p className="mt-2">{error}</p>
        </div>
      ) : (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg mb-4">
          <h2 className="text-xl font-bold">No Errors Detected</h2>
          <p className="mt-2">The page is rendering correctly.</p>
        </div>
      )}
      
      <div className="p-4 bg-royal-purple/10 rounded-lg">
        <h2 className="text-xl font-bold text-royal-purple">Testing is complete</h2>
        <p className="mt-2">If you can see this, the page rendering is working.</p>
      </div>
    </div>
  );
};

export default Test;