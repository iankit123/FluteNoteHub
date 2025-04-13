import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import NoteEditor from '@/components/NoteEditor';
import { useToast } from '@/hooks/use-toast';
import { Note } from '@shared/schema';
import { useUser } from '@/context/UserContext';
import { apiRequest, queryClient } from '@/lib/queryClient';

const EditNote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const isNewNote = !id || id === 'new';

  // Fetch note data if editing an existing note
  const { data: note, isLoading } = useQuery<Note>({
    queryKey: ['/api/notes', id],
    enabled: !isNewNote && !!id,
  });

  // Fetch tutorials to associate the note with (for new notes)
  const { data: tutorials } = useQuery({
    queryKey: ['/api/tutorials'],
    enabled: isNewNote,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !localStorage.getItem('fluteNotesUser')) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create or edit notes",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [user, navigate, toast]);

  // Create/Update note mutation
  const noteMutation = useMutation({
    mutationFn: async (noteData: { title: string, content: string, tutorialId?: number }) => {
      if (isNewNote) {
        // Create new note
        const res = await apiRequest('POST', '/api/notes', {
          ...noteData,
          userId: user?.id,
        });
        return res.json();
      } else {
        // Update existing note
        const res = await apiRequest('PUT', `/api/notes/${id}`, noteData);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: isNewNote ? "Note Created" : "Note Updated",
        description: isNewNote ? "Your note has been created successfully" : "Your note has been updated successfully",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'notes'] });
      
      // Navigate back to library
      navigate('/library');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isNewNote ? 'create' : 'update'} note: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSaveNote = (noteData: { title: string, content: string, tutorialId?: number }) => {
    noteMutation.mutate(noteData);
  };

  const handleCancel = () => {
    navigate('/library');
  };

  // Show loading state
  if (!isNewNote && isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-slate/80">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-royal-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-ivory-white font-medium">Loading note...</p>
        </div>
      </div>
    );
  }
  
  return (
    <NoteEditor
      note={note}
      onSave={handleSaveNote}
      onCancel={handleCancel}
    />
  );
};

export default EditNote;
