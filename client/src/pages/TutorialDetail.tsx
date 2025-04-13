import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import NavigationBar from '@/components/NavigationBar';
import TutorialCard from '@/components/TutorialCard';
import { apiRequest } from '@/lib/queryClient';
import { TutorialWithTags } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TutorialDetail: React.FC = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  
  const { data: tutorial, isLoading, error } = useQuery<TutorialWithTags>({
    queryKey: ['/api/tutorials', parseInt(id as string)],
    queryFn: async () => {
      const res = await fetch(`/api/tutorials/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tutorial');
      }
      return res.json();
    }
  });

  const handleBookmark = async (e: React.MouseEvent, tutorial: TutorialWithTags) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleShare = (e: React.MouseEvent, tutorial: TutorialWithTags) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleComment = (e: React.MouseEvent, tutorial: TutorialWithTags) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Comments",
      description: "Comment feature coming soon!",
    });
  };

  return (
    <>
      <NavigationBar />
      <main className="container mx-auto px-4 py-6 mb-24">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center text-royal-purple"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {isLoading ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-card h-80 animate-pulse">
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
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-card p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-red-500">Tutorial not found</h2>
            <p className="text-dark-slate/70 mt-2">
              Sorry, we couldn't find the tutorial you're looking for.
            </p>
            <Button 
              className="mt-4 bg-royal-purple"
              onClick={() => setLocation('/')}
            >
              Return to Home
            </Button>
          </div>
        ) : tutorial ? (
          <div className="max-w-2xl mx-auto">
            <TutorialCard 
              tutorial={tutorial} 
              onBookmark={handleBookmark}
              onComment={handleComment}
              onShare={handleShare}
            />
          </div>
        ) : null}
      </main>
    </>
  );
};

export default TutorialDetail;