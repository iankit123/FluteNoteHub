import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertTutorialSchema, insertNoteSchema } from '@shared/schema';
import { useUser } from '@/context/UserContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { extractVideoId, getTimestampInSeconds } from '@/lib/utils';
import { firebaseDB } from '@/lib/firebase';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Video,
  Link as LinkIcon,
  FileText,
  Music
} from 'lucide-react';

const youtubeSchema = insertTutorialSchema.extend({
  videoUrl: z.string().url('Please enter a valid URL').refine(
    (url) => extractVideoId(url) !== null,
    { message: 'Please enter a valid YouTube URL' }
  ),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
});

const websiteSchema = insertTutorialSchema.extend({
  websiteUrl: z.string().url('Please enter a valid URL'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  source: z.literal('website'),
  description: z.string().optional(),
});

const textNoteSchema = insertNoteSchema.extend({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

type NoteType = 'youtube' | 'website' | 'text';

interface AddNoteDialogProps {
  children?: React.ReactNode;
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>('youtube');
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get the active tab from URL or default to 'learning'
  const activeTab = window.location.hash === '#good-music' ? 'music' : 'learning';

  const youtubeForm = useForm<z.infer<typeof youtubeSchema>>({
    resolver: zodResolver(youtubeSchema),
    defaultValues: {
      title: '',
      description: '',
      videoUrl: '',
      source: 'youtube',
      category: activeTab, // Set category based on active tab
      authorId: user?.id,
    },
  });

  const websiteForm = useForm<z.infer<typeof websiteSchema>>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      title: '',
      description: '',
      websiteUrl: '',
      source: 'website',
      authorId: user?.id,
    },
  });

  const textNoteForm = useForm<z.infer<typeof textNoteSchema>>({
    resolver: zodResolver(textNoteSchema),
    defaultValues: {
      title: '',
      content: '',
      userId: user?.id,
    },
  });

  const tutorialMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/tutorials', data);
    },
    onSuccess: async (newTutorial) => {
      console.log("Tutorial added successfully:", newTutorial);
      
      // First invalidate the tutorials query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/tutorials'] });
      
      // Immediately save this tutorial to Firebase
      try {
        await firebaseDB.createTutorial(newTutorial);
        console.log("New tutorial directly saved to Firebase");
      } catch (syncError) {
        console.error("Error saving new tutorial to Firebase:", syncError);
      }
      
      toast({
        title: 'Success',
        description: 'Your tutorial has been added!',
      });
      setOpen(false);
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add tutorial: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const noteMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/notes', data);
    },
    onSuccess: async (newNote) => {
      console.log("Note added successfully:", newNote);
      
      // First invalidate the notes query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      
      // Immediately save this note to Firebase
      try {
        await firebaseDB.createNote(newNote);
        console.log("New note directly saved to Firebase");
      } catch (syncError) {
        console.error("Error saving new note to Firebase:", syncError);
      }
      
      toast({
        title: 'Success',
        description: 'Your note has been added!',
      });
      setOpen(false);
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add note: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onYoutubeSubmit = (data: z.infer<typeof youtubeSchema>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add a tutorial',
        variant: 'destructive',
      });
      return;
    }

    const videoId = extractVideoId(data.videoUrl);
    // Get thumbnail from YouTube
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

    tutorialMutation.mutate({
      ...data,
      authorId: user.id,
      thumbnailUrl,
    });
  };

  const onWebsiteSubmit = (data: z.infer<typeof websiteSchema>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add a tutorial',
        variant: 'destructive',
      });
      return;
    }

    tutorialMutation.mutate({
      ...data,
      authorId: user.id,
    });
  };

  const onTextNoteSubmit = (data: z.infer<typeof textNoteSchema>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add a note',
        variant: 'destructive',
      });
      return;
    }

    noteMutation.mutate({
      ...data,
      userId: user.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            className="bg-coral-pink hover:bg-coral-pink/90 text-ivory-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center pulse-animation p-0"
            aria-label="Add new content"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Content</DialogTitle>
          <DialogDescription>
            Save tutorials, links, or create your own notes.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="youtube" className="mt-4" onValueChange={(v) => setNoteType(v as NoteType)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="youtube" className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span>YouTube</span>
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              <span>Website</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Text Note</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="youtube" className="mt-4">
            <Form {...youtubeForm}>
              <form onSubmit={youtubeForm.handleSubmit(onYoutubeSubmit)} className="space-y-4">
                <FormField
                  control={youtubeForm.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Paste a YouTube video URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={youtubeForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Tutorial title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={youtubeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add a description..." value={field.value || ''} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="bg-royal-purple text-white">
                    {tutorialMutation.isPending ? 'Adding...' : 'Add Tutorial'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="website" className="mt-4">
            <Form {...websiteForm}>
              <form onSubmit={websiteForm.handleSubmit(onWebsiteSubmit)} className="space-y-4">
                <FormField
                  control={websiteForm.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/tutorial" {...field} />
                      </FormControl>
                      <FormDescription>
                        Paste a link to an external tutorial or resource
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={websiteForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Resource title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={websiteForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add a description..." value={field.value || ''} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} name={field.name} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="bg-royal-purple text-white">
                    {tutorialMutation.isPending ? 'Adding...' : 'Add Link'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="text" className="mt-4">
            <Form {...textNoteForm}>
              <form onSubmit={textNoteForm.handleSubmit(onTextNoteSubmit)} className="space-y-4">
                <FormField
                  control={textNoteForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Note title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={textNoteForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your notes here..."
                          className="min-h-[150px]"
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="bg-royal-purple text-white">
                    {noteMutation.isPending ? 'Adding...' : 'Add Note'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteDialog;