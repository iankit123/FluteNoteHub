import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import NavigationBar from '@/components/NavigationBar';
import FloatingMusicNotes from '@/components/FloatingMusicNotes';
import MobileFooter from '@/components/MobileFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { extractVideoId } from '@/lib/utils';
import { Music, Link as LinkIcon, Youtube } from 'lucide-react';

const NewTutorial: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [tutorialType, setTutorialType] = useState('youtube');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [currentTag, setCurrentTag] = useState('');

  // Add tag to the list
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // Remove tag from the list
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Create tutorial mutation
  const createTutorialMutation = useMutation({
    mutationFn: async () => {
      // Validate inputs
      if (!title.trim()) {
        throw new Error("Title is required");
      }

      if (tutorialType === 'youtube' && !videoUrl.trim()) {
        throw new Error("YouTube URL is required");
      }

      if (tutorialType === 'external' && !externalUrl.trim()) {
        throw new Error("External URL is required");
      }

      // For YouTube videos, extract video ID and generate thumbnail if not provided
      let finalThumbnailUrl = thumbnailUrl;
      if (tutorialType === 'youtube' && !thumbnailUrl) {
        const videoId = extractVideoId(videoUrl);
        if (videoId) {
          finalThumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }

      // Prepare tutorial data
      const tutorialData = {
        title,
        description,
        videoUrl: tutorialType === 'youtube' ? videoUrl : '',
        source: tutorialType,
        authorId: user?.id,
        thumbnailUrl: finalThumbnailUrl,
      };

      // Create the tutorial
      const res = await apiRequest('POST', '/api/tutorials', tutorialData);
      const newTutorial = await res.json();

      // Add tags if any
      if (tags.length > 0) {
        // This is simplified and would need proper tag creation/association logic
        for (const tagName of tags) {
          try {
            // First try to get or create the tag
            let tagRes = await apiRequest('GET', `/api/tags?name=${encodeURIComponent(tagName)}`);
            let tagData = await tagRes.json();
            
            if (!tagData || !tagData.id) {
              // Create the tag if it doesn't exist
              tagRes = await apiRequest('POST', '/api/tags', { 
                name: tagName,
                category: 'custom',
                color: '#6C3FC9'
              });
              tagData = await tagRes.json();
            }
            
            // Associate tag with tutorial
            await apiRequest('POST', `/api/tutorials/${newTutorial.id}/tags`, {
              tagId: tagData.id
            });
          } catch (error) {
            console.error("Error adding tag:", error);
          }
        }
      }

      return newTutorial;
    },
    onSuccess: () => {
      toast({
        title: "Tutorial Created",
        description: "Your tutorial has been created successfully!",
      });
      
      // Invalidate tutorials query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/tutorials'] });
      
      // Navigate back to library
      navigate('/library');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create tutorial: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTutorialMutation.mutate();
  };

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user && !localStorage.getItem('fluteNotesUser')) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create tutorials",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [user, navigate, toast]);

  return (
    <>
      <NavigationBar />
      <FloatingMusicNotes />
      
      <main className="container mx-auto px-4 py-6 wave-bg pb-20">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-poppins font-bold text-3xl text-dark-slate">
              Create New Tutorial
            </h1>
            <p className="text-dark-slate/70 mt-2">Share a tutorial with the community</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Tutorial Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tutorial Type Selection */}
                <Tabs value={tutorialType} onValueChange={setTutorialType} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="youtube" className="flex items-center gap-2">
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </TabsTrigger>
                    <TabsTrigger value="external" className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      External
                    </TabsTrigger>
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Personal
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="youtube" className="space-y-4 pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="youtube-url">YouTube URL</Label>
                      <Input
                        id="youtube-url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                      <p className="text-xs text-dark-slate/70">Paste the full YouTube video URL</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="external" className="space-y-4 pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="external-url">External URL</Label>
                      <Input
                        id="external-url"
                        placeholder="https://example.com/flute-tutorial"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                      />
                      <p className="text-xs text-dark-slate/70">Link to an external tutorial resource</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="personal" className="space-y-4 pt-4">
                    <div className="grid gap-2">
                      <p className="text-dark-slate/70">Create a personal tutorial with your own content and experiences</p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Title and Description */}
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Tutorial title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this tutorial covers..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                {/* Tags */}
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Add a tag (e.g., Beginner, Technique)"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addTag}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-royal-purple/10 text-royal-purple text-xs font-medium px-2 py-1 rounded-full flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            className="ml-1 text-royal-purple hover:text-royal-purple/80"
                            onClick={() => removeTag(tag)}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Optional Thumbnail */}
                {tutorialType !== 'youtube' && (
                  <div className="grid gap-2">
                    <Label htmlFor="thumbnail">Thumbnail URL (Optional)</Label>
                    <Input
                      id="thumbnail"
                      placeholder="https://example.com/image.jpg"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                    />
                    <p className="text-xs text-dark-slate/70">For YouTube videos, thumbnails are automatically generated if not provided</p>
                  </div>
                )}
                
                {/* Submit/Cancel Buttons */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/library')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-royal-purple hover:bg-royal-purple/90 text-ivory-white"
                    disabled={createTutorialMutation.isPending}
                  >
                    {createTutorialMutation.isPending ? "Creating..." : "Create Tutorial"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <MobileFooter />
    </>
  );
};

export default NewTutorial;
