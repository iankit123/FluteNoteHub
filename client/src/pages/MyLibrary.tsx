import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import NavigationBar from '@/components/NavigationBar';
import TutorialCard from '@/components/TutorialCard';
import FloatingMusicNotes from '@/components/FloatingMusicNotes';
import MobileFooter from '@/components/MobileFooter';
import AddNoteButton from '@/components/AddNoteButton';
import CategoryFilter from '@/components/CategoryFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { TutorialWithTags } from '@/types';
import { useUser } from '@/context/UserContext';
import { apiRequest, queryClient } from '@/lib/queryClient';

const MyLibrary: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const { data: bookmarks, isLoading: isLoadingBookmarks } = useQuery<any[]>({
    queryKey: ['/api/users', user?.id, 'bookmarks'],
    enabled: !!user,
  });

  const { data: notes, isLoading: isLoadingNotes } = useQuery<any[]>({
    queryKey: ['/api/users', user?.id, 'notes'],
    enabled: !!user,
  });

  const handleBookmark = async (tutorial: TutorialWithTags) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark this tutorial",
        variant: "destructive",
      });
      return;
    }

    try {
      if (tutorial.isBookmarked) {
        // Find bookmark ID and delete it
        const res = await apiRequest('DELETE', `/api/bookmarks/${tutorial.id}`);
        toast({
          title: "Bookmark Removed",
          description: "Tutorial removed from your bookmarks",
        });
      } else {
        // Create new bookmark
        await apiRequest('POST', '/api/bookmarks', {
          userId: user.id,
          tutorialId: tutorial.id,
        });
        toast({
          title: "Bookmark Added",
          description: "Tutorial added to your bookmarks",
        });
      }
      
      // Invalidate bookmarks query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/users', user.id, 'bookmarks'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  const handleShare = (tutorial: TutorialWithTags) => {
    if (navigator.share) {
      navigator.share({
        title: tutorial.title,
        text: `Check out this flute tutorial: ${tutorial.title}`,
        url: window.location.href,
      }).catch(error => {
        toast({
          title: "Sharing failed",
          description: error.message,
          variant: "destructive",
        });
      });
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(`${tutorial.title}: ${window.location.href}`);
      toast({
        title: "Link Copied",
        description: "Tutorial link copied to clipboard",
      });
    }
  };

  const categories = [
    'All',
    'Favorites',
    'Technique',
    'Repertoire',
    'Performance',
    'Lessons',
  ];

  const isLoading = isLoadingBookmarks || isLoadingNotes;

  return (
    <>
      <NavigationBar />
      <FloatingMusicNotes />
      
      <main className="container mx-auto px-4 py-6 wave-bg pb-20">
        {/* Library Header */}
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-3xl md:text-4xl text-dark-slate">
            My Library
          </h1>
          <p className="text-dark-slate/70 mt-2">Your collection of saved tutorials and personal notes</p>
        </div>

        <Tabs defaultValue="tutorials" className="w-full">
          <TabsList className="w-full max-w-md mb-6 bg-ivory-white/50 p-1 rounded-full">
            <TabsTrigger 
              value="tutorials" 
              className="rounded-full data-[state=active]:bg-royal-purple data-[state=active]:text-ivory-white"
            >
              Saved Tutorials
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="rounded-full data-[state=active]:bg-royal-purple data-[state=active]:text-ivory-white"
            >
              My Notes
            </TabsTrigger>
            <TabsTrigger 
              value="collections" 
              className="rounded-full data-[state=active]:bg-royal-purple data-[state=active]:text-ivory-white"
            >
              Collections
            </TabsTrigger>
          </TabsList>

          {/* Category filters */}
          <CategoryFilter 
            categories={categories} 
            activeCategory={activeFilter} 
            onCategoryChange={setActiveFilter}
          />

          <TabsContent value="tutorials" className="focus-visible:outline-none focus-visible:ring-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-card h-80 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-t-xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex justify-between items-center pt-3">
                        <div className="h-8 bg-gray-200 rounded-full w-8"></div>
                        <div className="flex space-x-2">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="h-5 w-5 bg-gray-200 rounded-full"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bookmarks && bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bookmark) => (
                  <TutorialCard
                    key={bookmark.id}
                    tutorial={{
                      ...bookmark.tutorial,
                      isBookmarked: true,
                      tags: bookmark.tutorial.tags
                    }}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-white/70 rounded-xl shadow-sm p-10 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-royal-purple/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">No saved tutorials</h2>
                <p className="text-dark-slate/70 mb-6 max-w-md">You haven't saved any tutorials yet. Explore the library or search for tutorials to add to your collection.</p>
                <a href="/explore" className="bg-royal-purple hover:bg-royal-purple/90 text-ivory-white px-4 py-2 rounded-full">
                  Explore Tutorials
                </a>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="focus-visible:outline-none focus-visible:ring-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-card h-64 animate-pulse">
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="flex justify-between items-center pt-3">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="flex space-x-2">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="h-5 w-5 bg-gray-200 rounded-full"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <TutorialCard
                    key={note.id}
                    tutorial={{
                      ...note,
                      source: 'personal',
                      tags: note.tags || []
                    }}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-white/70 rounded-xl shadow-sm p-10 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-royal-purple/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">No personal notes</h2>
                <p className="text-dark-slate/70 mb-6 max-w-md">You haven't created any personal notes yet. Create a new note to keep track of your progress and thoughts.</p>
                <a href="/notes/new" className="bg-coral-pink hover:bg-coral-pink/90 text-ivory-white px-4 py-2 rounded-full">
                  Create New Note
                </a>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="flex flex-col items-center justify-center bg-white/70 rounded-xl shadow-sm p-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-royal-purple/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">Collections Coming Soon</h2>
              <p className="text-dark-slate/70 mb-6 max-w-md">We're working on the ability to organize your tutorials and notes into collections for easier browsing and sharing.</p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Add New Button */}
        <AddNoteButton />
      </main>
      
      <MobileFooter />
    </>
  );
};

export default MyLibrary;
