import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import NavigationBar from '@/components/NavigationBar';
import CommunityPost from '@/components/CommunityPost';
import FloatingMusicNotes from '@/components/FloatingMusicNotes';
import MobileFooter from '@/components/MobileFooter';
import CategoryFilter from '@/components/CategoryFilter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CommunityPostWithTags } from '@/types';
import { useUser } from '@/context/UserContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Filter, Plus } from 'lucide-react';

const Community: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('All Posts');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('question');

  const { data: posts, isLoading } = useQuery<CommunityPostWithTags[]>({
    queryKey: ['/api/community-posts'],
  });

  const { data: leaderboardUsers, isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['/api/users/leaderboard'],
    // Fallback if endpoint isn't implemented
    enabled: false,
  });

  const handleLike = async (post: CommunityPostWithTags) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like this post",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update like status
      await apiRequest('PUT', `/api/community-posts/${post.id}`, {
        likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
      });
      
      // Invalidate posts query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/community-posts'] });
      
      toast({
        title: post.isLiked ? "Removed Like" : "Added Like",
        description: post.isLiked ? "You've unliked this post" : "You've liked this post",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async (post: CommunityPostWithTags) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark this post",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coming Soon",
      description: "Bookmarking community posts will be available soon!",
    });
  };

  const handleShare = (post: CommunityPostWithTags) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: `Check out this community post: ${post.title}`,
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
      navigator.clipboard.writeText(`${post.title}: ${window.location.href}`);
      toast({
        title: "Link Copied",
        description: "Post link copied to clipboard",
      });
    }
  };

  const handleSubmitPost = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a post",
        variant: "destructive",
      });
      return;
    }

    if (!postTitle.trim() || !postContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for your post",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/community-posts', {
        title: postTitle,
        content: postContent,
        userId: user.id,
        category: postCategory,
      });
      
      toast({
        title: "Post Created",
        description: "Your post has been created successfully!",
      });
      
      setPostTitle('');
      setPostContent('');
      setIsNewPostOpen(false);
      
      // Invalidate posts query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/community-posts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const categories = ['All Posts', 'Questions', 'Tutorials', 'Performances', 'Resources'];

  // Sample top contributors for demonstration - would normally come from API
  const topContributors = [
    {
      id: 1,
      username: 'david_chen',
      displayName: 'David Chen',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
      points: 124,
    },
    {
      id: 2,
      username: 'michelle_taylor',
      displayName: 'Michelle Taylor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150',
      points: 98,
    },
    {
      id: 3,
      username: 'sarah_johnson',
      displayName: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&h=150',
      points: 87,
    },
  ];

  return (
    <>
      <NavigationBar />
      <FloatingMusicNotes />
      
      <div className="flex flex-1 overflow-hidden bg-ivory-white">
        {/* Main Feed */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 wave-bg">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Community Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="font-poppins font-bold text-3xl md:text-4xl text-dark-slate">
                  Community Hub
                </h1>
                <p className="text-dark-slate/70 mt-2">Learn, share, and connect with fellow flutists</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="hidden md:flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                
                <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-coral-pink hover:bg-coral-pink/90 text-ivory-white">
                      <Plus className="h-4 w-4 mr-1" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create a New Post</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="post-title">Title</Label>
                        <Input
                          id="post-title"
                          placeholder="What's your post about?"
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="post-content">Content</Label>
                        <Textarea
                          id="post-content"
                          placeholder="Share your thoughts, questions, or insights..."
                          rows={6}
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="post-category">Category</Label>
                        <select
                          id="post-category"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={postCategory}
                          onChange={(e) => setPostCategory(e.target.value)}
                        >
                          <option value="question">Question</option>
                          <option value="tutorial">Tutorial</option>
                          <option value="performance">Performance</option>
                          <option value="resource">Resource</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        className="bg-royal-purple hover:bg-royal-purple/90 text-ivory-white"
                        onClick={handleSubmitPost}
                      >
                        Post
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Community Filters */}
            <CategoryFilter 
              categories={categories} 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory}
            />

            {/* Posts List */}
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-card overflow-hidden animate-pulse">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="flex justify-between items-center pt-3">
                        <div className="flex space-x-4">
                          <div className="h-6 w-16 bg-gray-200 rounded"></div>
                          <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-6">
                {posts
                  .filter(post => 
                    activeCategory === 'All Posts' || 
                    activeCategory.toLowerCase() === post.category
                  )
                  .map((post) => (
                    <CommunityPost
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={() => {}}
                      onBookmark={handleBookmark}
                      onShare={handleShare}
                    />
                  ))
                }
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-white/70 rounded-xl shadow-sm p-10 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-royal-purple/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <h2 className="font-poppins font-semibold text-xl text-dark-slate mb-2">No posts yet</h2>
                <p className="text-dark-slate/70 mb-6 max-w-md">Be the first to start a conversation in the community!</p>
                <Button 
                  className="bg-coral-pink hover:bg-coral-pink/90 text-ivory-white"
                  onClick={() => setIsNewPostOpen(true)}
                >
                  Create New Post
                </Button>
              </div>
            )}
          </div>
        </main>
        
        {/* Sidebar: Trending & Community (Desktop Only) */}
        <div className="hidden lg:block w-80 bg-royal-purple/5 p-4 overflow-y-auto border-l border-royal-purple/10">
          <div className="space-y-6">
            {/* Community Stats */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-poppins font-semibold text-base mb-3">Community Stats</h3>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-dark-slate/70">Members</span>
                <span className="font-medium">5,243</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-dark-slate/70">Posts Today</span>
                <span className="font-medium">78</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-slate/70">Active Now</span>
                <span className="font-medium text-royal-purple">127</span>
              </div>
            </div>
            
            {/* Top Contributors */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-poppins font-semibold text-base mb-3">Top Contributors</h3>
              <div className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <div key={contributor.id} className="flex items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm text-ivory-white ${
                        index === 0 ? 'bg-royal-purple' : 
                        index === 1 ? 'bg-coral-pink' : 
                        'bg-turmeric-yellow text-dark-slate'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8 -ml-2 border-2 border-white">
                      <AvatarImage src={contributor.avatar} alt={contributor.displayName} />
                      <AvatarFallback>{contributor.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium">{contributor.displayName}</span>
                    <span className="ml-auto text-xs bg-deep-teal/10 text-deep-teal px-2 py-0.5 rounded-full">
                      {contributor.points} pts
                    </span>
                  </div>
                ))}
              </div>
              <button className="text-royal-purple text-sm hover:underline mt-3 block">
                View leaderboard
              </button>
            </div>
            
            {/* Trending Tags */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-poppins font-semibold text-base mb-3">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                <a href="#" className="inline-block bg-deep-teal/10 text-deep-teal text-xs font-medium px-2 py-1 rounded-full hover:bg-deep-teal hover:text-white transition-colors">
                  #ToneProduction
                </a>
                <a href="#" className="inline-block bg-royal-purple/10 text-royal-purple text-xs font-medium px-2 py-1 rounded-full hover:bg-royal-purple hover:text-white transition-colors">
                  #FluteCare
                </a>
                <a href="#" className="inline-block bg-coral-pink/10 text-coral-pink text-xs font-medium px-2 py-1 rounded-full hover:bg-coral-pink hover:text-white transition-colors">
                  #Vibrato
                </a>
                <a href="#" className="inline-block bg-turmeric-yellow/10 text-dark-slate text-xs font-medium px-2 py-1 rounded-full hover:bg-turmeric-yellow hover:text-white transition-colors">
                  #BachSonatas
                </a>
                <a href="#" className="inline-block bg-deep-teal/10 text-deep-teal text-xs font-medium px-2 py-1 rounded-full hover:bg-deep-teal hover:text-white transition-colors">
                  #Articulation
                </a>
              </div>
            </div>
            
            {/* Upcoming Events */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-poppins font-semibold text-base mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                <div className="p-3 border border-royal-purple/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Flute Masterclass</span>
                    <span className="text-xs bg-turmeric-yellow/10 text-dark-slate px-2 py-0.5 rounded-full">Live</span>
                  </div>
                  <p className="text-xs text-dark-slate/70 mt-1">Oct 28, 7:00 PM EST</p>
                  <button className="mt-2 text-xs bg-royal-purple text-ivory-white px-3 py-1 rounded-full hover:bg-royal-purple/90 transition-colors">
                    Set Reminder
                  </button>
                </div>
                <div className="p-3 border border-royal-purple/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Q&A: Flute Auditions</span>
                    <span className="text-xs bg-royal-purple/10 text-royal-purple px-2 py-0.5 rounded-full">Coming Soon</span>
                  </div>
                  <p className="text-xs text-dark-slate/70 mt-1">Nov 5, 4:00 PM EST</p>
                  <button className="mt-2 text-xs bg-royal-purple text-ivory-white px-3 py-1 rounded-full hover:bg-royal-purple/90 transition-colors">
                    Set Reminder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <MobileFooter />
    </>
  );
};

export default Community;
