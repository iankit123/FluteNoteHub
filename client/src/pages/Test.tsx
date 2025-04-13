import React from 'react';
import TestUserContext from '@/components/TestUserContext';

const Test: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Context Test Page</h1>
      <TestUserContext />
    </div>
  );
};

export default Test;