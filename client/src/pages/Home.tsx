import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import NavigationBar from '@/components/NavigationBar';
import TutorialCard from '@/components/TutorialCard';
import FloatingMusicNotes from '@/components/FloatingMusicNotes';
import AddNoteDialog from '@/components/AddNoteDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { TutorialWithTags } from '@/types';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useUser } from '@/context/UserContext';
import { User, Note, Tutorial } from '@shared/schema';
import { firebaseDB } from '@/lib/firebase';
import { formatTimeAgo } from '@/lib/utils';
import { Database, Music, BookOpen } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('notes-to-learn');

  const { data: tutorials, isLoading: tutorialsLoading } = useQuery<TutorialWithTags[]>({
    queryKey: ['/api/tutorials'],
    staleTime: 1000, // 1 second
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Refetch every 3 seconds
  });
  
  // Also fetch notes if a user is logged in
  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
    staleTime: 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 3000, // Refetch every 3 seconds
    enabled: !!user, // Only fetch if user is logged in
  });
  
  // Combine loading states
  const isLoading = tutorialsLoading || notesLoading;

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

  // Get notes and educational tutorials for "Notes to Learn" tab
  const getNotesAndTutorials = (): Array<Tutorial | Note> => {
    let items: Array<Tutorial | Note> = [];
    
    // Add all notes
    if (notes && notes.length > 0) {
      items = [...notes];
    }
    
    // Add tutorials that are not YouTube videos or are educational YouTube videos
    if (tutorials && tutorials.length > 0) {
      const educationalTutorials = tutorials.filter(tutorial => 
        tutorial.source !== 'youtube' || 
        (tutorial.source === 'youtube' && !tutorial.title.toLowerCase().includes('music'))
      );
      
      // Convert tutorials to the right structure for rendering
      items = [...items, ...educationalTutorials];
    }
    
    return items;
  };
  
  // Get music-related content for "Good Music to Hear" tab
  const getMusicContent = (): TutorialWithTags[] => {
    if (!tutorials) return [];
    
    // Filter for YouTube videos and specifically music content
    return tutorials.filter(tutorial => 
      tutorial.source === 'youtube'
    );
  };

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

        {/* Main Content Tabs */}
        <Tabs 
          defaultValue="notes-to-learn" 
          className="mb-6" 
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="notes-to-learn" 
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Notes to Learn</span>
            </TabsTrigger>
            <TabsTrigger 
              value="good-music" 
              className="flex items-center gap-2"
            >
              <Music className="h-4 w-4" />
              <span>Good Music to Hear</span>
            </TabsTrigger>
          </TabsList>

          {/* Notes to Learn Tab Content */}
          <TabsContent value="notes-to-learn" className="mt-2">
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
                {/* Render learning content (not music) */}
                {tutorials && tutorials
                  .filter(tutorial => tutorial.category === 'learning' || tutorial.category === undefined)
                  .map((tutorial) => (
                    <Link key={`tutorial-${tutorial.id}`} href={`/tutorials/${tutorial.id}`}
                         className="cursor-pointer transition-transform hover:scale-[1.01]">
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
                    </Link>
                ))}
                
                {/* Render notes */}
                {notes && notes.map((note) => (
                  <Link key={`note-${note.id}`} href={`/notes/${note.id}`}
                      className="cursor-pointer transition-transform hover:scale-[1.01]">
                    <div className="bg-white rounded-xl shadow-card overflow-hidden border-l-4 border-turmeric-yellow">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-turmeric-yellow/20 text-turmeric-yellow text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Personal Note
                          </span>
                          <div className="text-xs text-gray-500">
                            {note.createdAt ? formatTimeAgo(new Date(note.createdAt)) : 'Just now'}
                          </div>
                        </div>
                        <h3 className="font-poppins font-semibold text-lg text-dark-slate mb-2">{note.title}</h3>
                        <div className="text-dark-slate/70 text-sm mb-4 overflow-hidden h-24">
                          {note.content.split('\n').slice(0, 4).map((line, idx) => (
                            <p key={idx} className="mb-1">{line || ' '}</p>
                          ))}
                          {note.content.split('\n').length > 4 && (
                            <p className="text-royal-purple font-medium text-xs mt-1">+ {note.content.split('\n').length - 4} more lines</p>
                          )}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <div className="flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-royal-purple" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-500">Text Note</span>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              className="p-1 hover:bg-gray-100 rounded-full"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Share functionality for notes can be added here
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Empty state for Notes to Learn tab */}
                {(!notes || notes.length === 0) && 
                 (!tutorials || tutorials.filter(t => t.category === 'learning' || t.category === undefined).length === 0) && (
                  <div className="col-span-3 flex flex-col items-center justify-center bg-white/70 rounded-xl shadow-sm p-10 text-center mb-24">
                    <BookOpen className="h-16 w-16 text-royal-purple/30 mb-4" />
                    <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">No learning materials yet</h2>
                    <p className="text-dark-slate/70 mb-6 max-w-md">Start adding personal notes or save flute tutorials to build your learning library.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <AddNoteDialog initialCategory="learning">
                        <Button variant="default" className="bg-royal-purple text-ivory-white">
                          Add New Content
                        </Button>
                      </AddNoteDialog>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Good Music to Hear Tab Content */}
          <TabsContent value="good-music" className="mt-2">
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
                {/* Only render music content */}
                {tutorials && tutorials
                  .filter(tutorial => tutorial.category === 'music')
                  .map((tutorial) => (
                    <Link key={`tutorial-${tutorial.id}`} href={`/tutorials/${tutorial.id}`}
                         className="cursor-pointer transition-transform hover:scale-[1.01]">
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
                    </Link>
                ))}

                {/* Empty state for Good Music to Hear tab */}
                {(!tutorials || tutorials.filter(t => t.category === 'music').length === 0) && (
                  <div className="col-span-3 flex flex-col items-center justify-center bg-white/70 rounded-xl shadow-sm p-10 text-center mb-24">
                    <Music className="h-16 w-16 text-royal-purple/30 mb-4" />
                    <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">No music added yet</h2>
                    <p className="text-dark-slate/70 mb-6 max-w-md">Add YouTube links to your favorite flute music to build a collection of inspiring performances.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <AddNoteDialog initialCategory="music">
                        <Button variant="default" className="bg-royal-purple text-ivory-white">
                          Add YouTube Music
                        </Button>
                      </AddNoteDialog>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Floating Actions */}
        <div className="fixed bottom-24 right-6 z-20 md:bottom-8 flex flex-col gap-3">
          {/* Sync to Firebase Button - Only visible to instructors */}
          {user && user.isInstructor && (
            <Button
              variant="outline"
              className="rounded-full h-14 w-14 flex items-center justify-center bg-white hover:bg-royal-purple/10 border-royal-purple text-royal-purple shadow-lg"
              onClick={async () => {
                try {
                  // Fetch all data from memory storage
                  const tutorials = await apiRequest('GET', '/api/tutorials');
                  const tags = await apiRequest('GET', '/api/tags');
                  const notes = await apiRequest('GET', '/api/notes');
                  
                  // Sync to Firebase
                  await firebaseDB.syncMemoryToFirebase(
                    Array.isArray(tutorials) ? tutorials : [],
                    Array.isArray(tags) ? tags : [],
                    Array.isArray(notes) ? notes : []
                  );
                  
                  // Refresh data
                  await queryClient.invalidateQueries({ queryKey: ['/api/tutorials'] });
                  await queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
                  
                  toast({
                    title: "Sync Complete",
                    description: "Your data has been synced to Firebase",
                  });
                } catch (error) {
                  console.error('Sync error:', error);
                  toast({
                    title: "Sync Failed",
                    description: "Failed to sync data to Firebase",
                    variant: "destructive",
                  });
                }
              }}
              title="Sync to Firebase (Instructor Only)"
            >
              <Database className="h-6 w-6" />
            </Button>
          )}
          
          {/* Add Note Button - Visible to all users */}
          <AddNoteDialog initialCategory={activeTab === 'good-music' ? 'music' : 'learning'} />
        </div>
      </main>
    </>
  );
};

export default Home;