import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import NavigationBar from '@/components/NavigationBar';
import TutorialCard from '@/components/TutorialCard';
import FloatingMusicNotes from '@/components/FloatingMusicNotes';
import MobileFooter from '@/components/MobileFooter';
import AddNoteButton from '@/components/AddNoteButton';
import CategoryFilter from '@/components/CategoryFilter';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { TutorialWithTags } from '@/types';
import { useUser } from '@/context/UserContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Search } from 'lucide-react';

const Explore: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTutorials, setFilteredTutorials] = useState<TutorialWithTags[]>([]);

  const { data: tutorials, isLoading } = useQuery<TutorialWithTags[]>({
    queryKey: ['/api/tutorials'],
  });

  const { data: tags } = useQuery({
    queryKey: ['/api/tags'],
  });

  // Update filtered tutorials when data changes or filters apply
  useEffect(() => {
    if (!tutorials) return;

    let filtered = [...tutorials];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        (t.description && t.description.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (activeCategory !== 'All') {
      filtered = filtered.filter(t => 
        t.tags && t.tags.some(tag => tag.name === activeCategory)
      );
    }
    
    setFilteredTutorials(filtered);
  }, [tutorials, searchQuery, activeCategory]);

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
      
      // Invalidate tutorials query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/tutorials'] });
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

  // Derive categories from tags
  const categories = tags 
    ? ['All', ...tags.map((tag: any) => tag.name)] 
    : ['All', 'Beginner', 'Intermediate', 'Advanced', 'Technique', 'Repertoire'];

  return (
    <>
      <NavigationBar />
      <FloatingMusicNotes />
      
      <main className="container mx-auto px-4 py-6 wave-bg pb-20">
        {/* Explore Header */}
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-3xl md:text-4xl text-dark-slate">
            Explore Tutorials
          </h1>
          <p className="text-dark-slate/70 mt-2">Discover flute tutorials and resources from our community</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 max-w-2xl">
          <Input
            type="text"
            placeholder="Search for tutorials, techniques, composers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-6 bg-white/80 border-0 focus-visible:ring-2 focus-visible:ring-royal-purple"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-slate/60" />
        </div>

        {/* Category filters */}
        <CategoryFilter 
          categories={categories} 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory}
        />

        {/* Tutorial Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
        ) : filteredTutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white/70 rounded-xl shadow-sm p-10 text-center mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-royal-purple/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">No tutorials found</h2>
            <p className="text-dark-slate/70 mb-6 max-w-md">
              {searchQuery 
                ? `No tutorials match your search for "${searchQuery}"`
                : "No tutorials found in this category"}
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="bg-royal-purple hover:bg-royal-purple/90 text-ivory-white px-4 py-2 rounded-full"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* Add New Button */}
        <AddNoteButton />
      </main>
      
      <MobileFooter />
    </>
  );
};

export default Explore;
