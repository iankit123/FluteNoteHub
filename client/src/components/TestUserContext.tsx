import React from 'react';
import { useUser } from '@/context/UserContext';

const TestUserContext: React.FC = () => {
  try {
    const userContext = useUser();
    return (
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold">User Context Test</h2>
        <pre className="mt-2 p-2 bg-gray-100 rounded">
          {JSON.stringify(userContext, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded shadow">
        <h2 className="text-xl font-bold">User Context Error</h2>
        <p className="mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
};

export default TestUserContext;