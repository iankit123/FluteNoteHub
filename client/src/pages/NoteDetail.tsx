import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Note } from '@shared/schema';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatTimeAgo } from '@/lib/utils';
import NavigationBar from '@/components/NavigationBar';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ArrowLeft, Share } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const NoteDetail: React.FC = () => {
  const [, params] = useRoute<{ id: string }>('/notes/:id');
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const noteId = params?.id ? parseInt(params.id) : 0;
  
  const { data: note, isLoading } = useQuery<Note>({
    queryKey: [`/api/notes/${noteId}`],
    enabled: noteId > 0,
  });
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: 'Note Deleted',
        description: 'Your note has been successfully deleted',
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete note: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleDelete = async () => {
    try {
      // First, delete from the server/in-memory storage through the mutation
      deleteMutation.mutate();
      
      // Also delete from Firebase
      const { firebaseDB } = await import('@/lib/firebase');
      const success = await firebaseDB.deleteNote(noteId);
      
      if (success) {
        console.log(`Note ${noteId} successfully deleted from Firebase`);
      } else {
        console.error(`Failed to delete note ${noteId} from Firebase`);
      }
    } catch (error) {
      console.error('Error during deletion process:', error);
    }
  };
  
  const handleEdit = () => {
    setLocation(`/notes/${noteId}/edit`);
  };
  
  const handleShare = () => {
    if (navigator.share && note) {
      navigator.share({
        title: note.title,
        text: `Check out my flute note: ${note.title}`,
        url: window.location.href,
      }).catch(error => {
        toast({
          title: 'Sharing failed',
          description: error.message,
          variant: 'destructive',
        });
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Note link copied to clipboard',
      });
    }
  };
  
  if (isLoading) {
    return (
      <>
        <NavigationBar />
        <main className="container mx-auto px-4 py-6">
          <div className="bg-white p-6 rounded-xl shadow-md animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </main>
      </>
    );
  }
  
  if (!note) {
    return (
      <>
        <NavigationBar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-10 text-center">
            <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">Note not found</h2>
            <p className="text-dark-slate/70 mb-6">The note you're looking for doesn't exist or has been deleted.</p>
            <Button 
              variant="default" 
              className="bg-royal-purple text-ivory-white"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back home
            </Button>
          </div>
        </main>
      </>
    );
  }
  
  const isOwner = user && note.userId === user.id;
  
  return (
    <>
      <NavigationBar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="text-dark-slate hover:text-royal-purple hover:bg-royal-purple/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-turmeric-yellow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="bg-turmeric-yellow/20 text-turmeric-yellow text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Personal Note
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {note.createdAt ? formatTimeAgo(new Date(note.createdAt)) : 'Just now'}
                </div>
              </div>
              
              {isOwner && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-royal-purple border-royal-purple hover:bg-royal-purple/10"
                    onClick={handleEdit}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Note</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this note? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setShowDeleteDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? 'Deleting...' : 'Delete Note'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
            
            <h1 className="font-poppins font-bold text-2xl md:text-3xl text-dark-slate mb-4">
              {note.title}
            </h1>
            
            <div className="prose max-w-none text-dark-slate/90 whitespace-pre-wrap">
              {note.content}
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-royal-purple" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-500">Text Note</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-dark-slate hover:text-royal-purple hover:bg-royal-purple/10"
                onClick={handleShare}
              >
                <Share className="h-4 w-4 mr-1" /> Share
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default NoteDetail;