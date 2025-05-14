import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import TutorialCard from "@/components/TutorialCard";
import logger, { isProduction } from "@/lib/debug";
import { Link } from "wouter";

export default function DebugExplore() {
  // Fetch all data directly
  const { 
    data: tutorials, 
    isLoading: tutorialsLoading,
    error: tutorialsError 
  } = useQuery<any[], Error>({
    queryKey: ["/api/tutorials"]
  });

  const { 
    data: users, 
    isLoading: usersLoading,
    error: usersError 
  } = useQuery<any[], Error>({
    queryKey: ["/api/users"]
  });
  
  const { 
    data: exploreData, 
    isLoading: exploreLoading,
    error: exploreError 
  } = useQuery<any, Error>({
    queryKey: ["/api/explore"]
  });

  // Log all data for debugging
  useEffect(() => {
    logger.info('Debug Explore component mounted');
    logger.debug('Environment:', isProduction ? 'Production' : 'Development');
    
    if (tutorials) {
      logger.info('Tutorials data loaded successfully');
      logger.debug('Tutorials data:', tutorials);
    }
    
    if (users) {
      logger.info('Users data loaded successfully');
      logger.debug('Users data:', users);
    }
    
    if (exploreData) {
      logger.info('Explore data loaded successfully');
      logger.debug('Explore data:', exploreData);
    }
  }, [tutorials, users, exploreData]);

  // Display loading state
  if (tutorialsLoading || usersLoading || exploreLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <div className="animate-spin text-royal-purple h-12 w-12 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="w-full h-full"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="text-gray-600">Loading content...</p>
        <p className="text-xs text-gray-400 mt-2">{isProduction ? 'Production' : 'Development'} environment</p>
      </div>
    );
  }

  // Display errors if any
  if (tutorialsError || usersError || exploreError) {
    return (
      <>
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-royal-purple">FluteNoteHub</h1>
              <nav className="flex space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Home
                </Link>
                <Link to="/explore" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Explore
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading content</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>There was an error loading the content. Please try again later.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Debugging information */}
          <div className="bg-gray-100 p-4 rounded-md mt-6">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Debug Information</h3>
            <div className="text-xs font-mono bg-white p-3 rounded border overflow-auto max-h-[300px]">
              <p>Environment: {isProduction ? 'Production' : 'Development'}</p>
              <p>Tutorials Error: {tutorialsError?.message || 'None'}</p>
              <p>Users Error: {usersError?.message || 'None'}</p>
              <p>Explore Error: {exploreError?.message || 'None'}</p>
              <p className="mt-2">API Endpoints:</p>
              <ul className="list-disc pl-5">
                <li>/api/tutorials</li>
                <li>/api/users</li>
                <li>/api/explore</li>
              </ul>
              <p className="mt-2">Tutorials Data: {tutorials ? `${tutorials.length} items` : 'No data'}</p>
              <p>Users Data: {users ? `${users.length} items` : 'No data'}</p>
              <p>Explore Data: {exploreData ? 'Available' : 'No data'}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Get tutorials from both sources
  const tutorialsFromApi = tutorials || [];
  const tutorialsFromExplore = exploreData?.tutorials || [];
  
  // Combine all tutorials
  const allTutorials = [...tutorialsFromApi, ...tutorialsFromExplore];
  
  // Remove duplicates (if any)
  const uniqueTutorials = allTutorials.filter((tutorial, index, self) => 
    index === self.findIndex(t => t.id === tutorial.id)
  );

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-royal-purple">FluteNoteHub</h1>
            <nav className="flex space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                Home
              </Link>
              <Link to="/explore" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                Explore
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Debug Explore</h1>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Debug Mode</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>This page displays all available tutorials without filtering.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium">Tutorials API</h3>
              <p className="text-sm text-gray-600">{tutorialsFromApi.length} items</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium">Explore API</h3>
              <p className="text-sm text-gray-600">{tutorialsFromExplore.length} items</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium">Users API</h3>
              <p className="text-sm text-gray-600">{users?.length || 0} items</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">All Tutorials</h2>
        {uniqueTutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 mb-32">
            {uniqueTutorials.map((tutorial: any) => (
              <div key={tutorial.id || Math.random()} className="flex flex-col">
                <TutorialCard
                  tutorial={tutorial}
                  showAuthor={true}
                  currentUserName={null}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">
              No content found
            </h3>
            <p className="mt-1 text-gray-500">
              No tutorials available from any source.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
