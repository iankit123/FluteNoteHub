import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Tutorial, User } from "@shared/schema";
import NavigationBar from "@/components/NavigationBar";
import TutorialCard from "@/components/TutorialCard";
import { useUser } from "@/context/UserContext";
import CategoryFilter from "@/components/CategoryFilter";
import AddNoteButton from "@/components/AddNoteButton";
import { BookOpen, Music, AlertCircle } from "lucide-react";
import logger, { isProduction, debugFetch } from "@/lib/debug";
import { apiRequest } from "@/lib/queryClient";

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("learning");
  const { user } = useUser();

  // Function to handle adding a tutorial to the user's personal collection
  const handleAddToMyNotes = (tutorial: Tutorial) => {
    if (!user) {
      alert("Please log in to add this to your notes");
      return;
    }

    // Create a copy of the tutorial with the current user as author
    const newTutorial = {
      ...tutorial,
      id: undefined, // Let the backend generate a new ID
      authorId: user.id,
      createdAt: new Date().toISOString(),
    };

    // Post to the API
    fetch("/api/tutorials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTutorial),
    })
      .then((response) => {
        if (response.ok) {
          alert("Added to your notes successfully!");
        } else {
          throw new Error("Failed to add to your notes");
        }
      })
      .catch((error) => {
        console.error("Error adding to notes:", error);
        alert("Failed to add to your notes. Please try again.");
      });
  };

  // Add detailed logging for the Explore component
  useEffect(() => {
    logger.info('Explore component mounted');
    logger.debug('Environment:', isProduction ? 'Production' : 'Development');
    logger.debug('Active category:', activeCategory);
    logger.debug('Active tab:', activeTab);
    
    // Direct API call to debug
    const debugApiCalls = async () => {
      try {
        logger.debug('Making direct API call to /api/tutorials for debugging');
        const tutorialsResponse = await debugFetch('/api/tutorials');
        const tutorialsData = await tutorialsResponse.json();
        logger.debug('Direct API call result for tutorials:', tutorialsData);
        
        logger.debug('Making direct API call to /api/explore for debugging');
        const exploreResponse = await debugFetch('/api/explore');
        const exploreData = await exploreResponse.json();
        logger.debug('Direct API call result for explore:', exploreData);
      } catch (error) {
        logger.error('Debug API call failed:', error);
      }
    };
    
    // Run the debug API calls
    debugApiCalls();
    
    return () => {
      logger.info('Explore component unmounted');
    };
  }, []);

  // Enhanced queries with error handling and logging
  const { 
    data: tutorials, 
    isLoading: tutorialsLoading,
    error: tutorialsError 
  } = useQuery<any[], Error>({
    queryKey: ["/api/tutorials"]
  });

  // Log tutorials data whenever it changes
  useEffect(() => {
    if (tutorials) {
      logger.info('Tutorials data loaded successfully');
      logger.debug('Tutorials data:', tutorials);
    }
    if (tutorialsError) {
      logger.error('Failed to load tutorials data:', tutorialsError);
    }
  }, [tutorials, tutorialsError]);

  const { 
    data: users, 
    isLoading: usersLoading,
    error: usersError 
  } = useQuery<any[], Error>({
    queryKey: ["/api/users"]
  });

  // Log users data whenever it changes
  useEffect(() => {
    if (users) {
      logger.info('Users data loaded successfully');
      logger.debug('Users data:', users);
    }
    if (usersError) {
      logger.error('Failed to load users data:', usersError);
    }
  }, [users, usersError]);
  
  // Additional query for explore-specific data
  const { 
    data: exploreData, 
    isLoading: exploreLoading,
    error: exploreError 
  } = useQuery<any, Error>({
    queryKey: ["/api/explore"]
  });

  // Log explore data whenever it changes
  useEffect(() => {
    if (exploreData) {
      logger.info('Explore data loaded successfully');
      logger.debug('Explore data:', exploreData);
    }
    if (exploreError) {
      logger.error('Failed to load explore data:', exploreError);
    }
  }, [exploreData, exploreError]);

  // Check if hash is present and use it to set active tab
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "learning" || hash === "music") {
      setActiveTab(hash);
    }
  }, []);

  // Update hash when tab changes
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  const getUserDisplayName = (userId: number | null) => {
    if (!userId || !users || !Array.isArray(users)) return "Unknown";
    const user = users.find((u: User) => u.id === userId);
    return user ? user.displayName : "Unknown";
  };

  // Filter tutorials by category
  const filteredTutorials =
    tutorials && Array.isArray(tutorials)
      ? tutorials.filter((tutorial: Tutorial) => {
          // Filter by content category (learning/music)
          const matchesTab = tutorial.category === activeTab;

          // Filter by user-selected category (all/youtube/website/text)
          const matchesCategory =
            activeCategory === "all" ||
            (activeCategory === "youtube" && tutorial.videoUrl) ||
            (activeCategory === "website" && tutorial.websiteUrl) ||
            (activeCategory === "text" &&
              !tutorial.videoUrl &&
              !tutorial.websiteUrl);

          return matchesTab && matchesCategory;
        })
      : [];

  const categories = [
    { id: "all", name: "All" },
    { id: "youtube", name: "YouTube" },
    { id: "website", name: "Websites" },
    { id: "text", name: "Text" },
  ];

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
        <NavigationBar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
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

  return (
    <>
      <NavigationBar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Explore Content</h1>
          {user && <AddNoteButton />}
        </div>

        <Tabs
          defaultValue="learning"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="learning"
              className="flex items-center gap-2 w-full justify-center h-12"
            >
              <BookOpen className="h-5 w-5" />
              <span>Notes to Learn</span>
            </TabsTrigger>
            <TabsTrigger
              value="music"
              className="flex items-center gap-2 w-full justify-center h-12"
            >
              <Music className="h-5 w-5" />
              <span>Hear Good Music </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learning" className="mt-4">
            <CategoryFilter
              categories={categories.map((c) => c.name)}
              activeCategory={activeCategory}
              onCategoryChange={(category) =>
                setActiveCategory(
                  categories.find((c) => c.name === category)?.id || "all",
                )
              }
            />

            {filteredTutorials?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 mb-32">
                {filteredTutorials.map((tutorial: Tutorial) => (
                  <div key={tutorial.id} className="flex flex-col">
                    <TutorialCard
                      tutorial={tutorial}
                      showAuthor={true}
                      currentUserName={user ? user.displayName : null}
                      onAddToMyNotes={user ? handleAddToMyNotes : undefined}
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
                  Try changing your filters or add some content.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="music" className="mt-4">
            <CategoryFilter
              categories={categories.map((c) => c.name)}
              activeCategory={activeCategory}
              onCategoryChange={(category) =>
                setActiveCategory(
                  categories.find((c) => c.name === category)?.id || "all",
                )
              }
            />

            {filteredTutorials?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 mb-32">
                {filteredTutorials.map((tutorial: Tutorial) => (
                  <div key={tutorial.id} className="flex flex-col">
                    <TutorialCard
                      tutorial={tutorial}
                      showAuthor={true}
                      currentUserName={user ? user.displayName : null}
                      onAddToMyNotes={user ? handleAddToMyNotes : undefined}
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
                  Try changing your filters or add some content.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
