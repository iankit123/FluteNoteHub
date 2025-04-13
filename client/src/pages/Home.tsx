import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import NavigationBar from '@/components/NavigationBar';
import TutorialCard from '@/components/TutorialCard';
import FloatingMusicNotes from '@/components/FloatingMusicNotes';
import AddNoteDialog from '@/components/AddNoteDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TutorialWithTags } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useUser } from '@/context/UserContext';
import { User } from '@shared/schema';

const Home: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<string>('Recent Notes');

  const { data: tutorials, isLoading } = useQuery<TutorialWithTags[]>({
    queryKey: ['/api/tutorials'],
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

  const filters = [
    'Recent Notes',
    'Favorites',
    'In Progress',
    'Technique',
    'Repertoire',
  ];

  return (
    <>
      <NavigationBar />
      <FloatingMusicNotes />
      
      <main className="container mx-auto px-4 py-6 wave-bg">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-3xl md:text-4xl text-dark-slate">
            Welcome back, <span className="text-royal-purple">{user?.displayName || 'Friend'}</span>!
          </h1>
          <p className="text-dark-slate/70 mt-2">Continue your flute journey with new tutorials and personal notes.</p>
        </div>

        {/* Quick Access Filters */}
        <div className="flex overflow-x-auto space-x-2 pb-4 mb-6 no-scrollbar">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              onClick={() => setActiveFilter(filter)}
              className={
                activeFilter === filter 
                  ? 'bg-royal-purple text-ivory-white flex-shrink-0' 
                  : 'bg-ivory-white hover:bg-royal-purple/10 text-dark-slate flex-shrink-0'
              }
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Tutorial Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {tutorials && tutorials.map((tutorial) => (
              <Link key={tutorial.id} href={`/tutorials/${tutorial.id}`}>
                <a className="cursor-pointer block transition-transform hover:scale-[1.01]">
                  <TutorialCard
                    tutorial={tutorial}
                    onBookmark={(e, tutorial) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleBookmark(tutorial);
                    }}
                    onShare={(e, tutorial) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleShare(tutorial);
                    }}
                  />
                </a>
              </Link>
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {tutorials && tutorials.length === 0 && (
          <div className="flex flex-col items-center justify-center bg-white/70 rounded-xl shadow-sm p-10 text-center mb-24">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-royal-purple/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">No tutorials yet</h2>
            <p className="text-dark-slate/70 mb-6 max-w-md">Start adding tutorials from YouTube or create your own notes to build your flute learning library.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/explore">
                <Button variant="default" className="bg-royal-purple text-ivory-white">
                  Explore Tutorials
                </Button>
              </Link>
              <AddNoteDialog>
                <Button variant="outline" className="border-royal-purple text-royal-purple hover:bg-royal-purple/10">
                  Create Note
                </Button>
              </AddNoteDialog>
            </div>
          </div>
        )}
        
        {/* Add New Button (Fixed) */}
        <div className="fixed bottom-24 right-6 z-20 md:bottom-8">
          <AddNoteDialog />
        </div>
      </main>
    </>
  );
};

export default Home;
