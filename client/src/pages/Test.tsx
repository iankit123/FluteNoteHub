import React from 'react';

const Test: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
      <p className="mb-4">This is a simple test page without any context or complex components.</p>
      <div className="p-4 bg-royal-purple/10 rounded-lg">
        <h2 className="text-xl font-bold text-royal-purple">Testing is complete</h2>
        <p className="mt-2">If you can see this, the page rendering is working.</p>
      </div>
    </div>
  );
};

export default Test;