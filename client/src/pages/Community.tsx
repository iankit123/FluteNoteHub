import React, { useState, useEffect } from 'react';
import NavigationBar from "@/components/NavigationBar";
import { useUser } from "@/context/UserContext";
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { firebaseDB } from '@/lib/firebase';
import { CommunityPost, CommunityComment, User } from '@shared/schema';
import DiscussionPostCard from '@/components/DiscussionPostCard';
import NewDiscussionDialog from '@/components/NewDiscussionDialog';

// Import sample user data with Indian context to serve as avatars and user info
const indianTeachers = [
  { id: 101, displayName: "Anjali Sharma", avatar: "", isInstructor: true },
  { id: 102, displayName: "Vikram Reddy", avatar: "", isInstructor: true },
  { id: 103, displayName: "Priya Gupta", avatar: "", isInstructor: true }
];

const indianStudents = [
  { id: 201, displayName: "Rahul Patel", avatar: "", isInstructor: false },
  { id: 202, displayName: "Deepak Singh", avatar: "", isInstructor: false },
  { id: 203, displayName: "Meera Khanna", avatar: "", isInstructor: false },
  { id: 204, displayName: "Arjun Malhotra", avatar: "", isInstructor: false },
  { id: 205, displayName: "Kiran Joshi", avatar: "", isInstructor: false }
];

// Combine all users
const sampleUsers = [...indianTeachers, ...indianStudents];

// Sample discussion topics to seed if empty
const sampleDiscussions = [
  {
    id: 1,
    userId: 101,
    title: "How did you learn to play the flute – teacher, YouTube, or self-taught?",
    content: "I've been teaching flute for 5 years in Delhi, but I'm curious about everyone's learning journey. Did you learn from a guru, YouTube videos, or teach yourself?",
    likesCount: 24,
    category: "question",
    createdAt: new Date("2025-04-10T09:30:00Z")
  },
  {
    id: 2,
    userId: 203,
    title: "What's the hardest Bollywood flute tune you've tried?",
    content: "'Roja Janeman' was tricky for me – especially the fast part! I spent weeks practicing it. Which Bollywood songs challenged you the most?",
    likesCount: 18,
    category: "discussion",
    createdAt: new Date("2025-04-12T14:15:00Z")
  },
  {
    id: 3,
    userId: 102,
    title: "Which Indian song was your first flute tune?",
    content: "Mine was 'Vaishnav Jan To'! It's a perfect beginner bhajan with a simple melody that sounds beautiful on flute. What was yours?",
    likesCount: 15,
    category: "discussion",
    createdAt: new Date("2025-04-13T11:45:00Z")
  },
  {
    id: 4,
    userId: 202,
    title: "Is there a devotional song you love playing on the flute?",
    content: "Bhajans, aartis, or any soothing melodies you enjoy playing? I've been practicing 'Om Jai Jagdish Hare' for an upcoming puja at our local temple.",
    likesCount: 12,
    category: "discussion",
    createdAt: new Date("2025-04-14T08:20:00Z")
  },
  {
    id: 5,
    userId: 201,
    title: "Best place to buy quality bamboo flutes in India?",
    content: "I'm looking to upgrade from my beginner flute. Any recommendations for shops in Mumbai or online stores that sell good quality bamboo flutes? Budget around 2000 rupees.",
    likesCount: 9,
    category: "question",
    createdAt: new Date("2025-04-15T07:30:00Z")
  }
];

// Sample comments
const sampleComments = [
  { 
    id: 1,
    postId: 1, 
    userId: 202, 
    content: "I started with a teacher in Pune who specialized in Hindustani classical, but YouTube has been great for picking up fusion techniques.",
    likesCount: 7,
    createdAt: new Date("2025-04-10T12:45:00Z")
  },
  { 
    id: 2,
    postId: 1, 
    userId: 201, 
    content: "Completely self-taught! Started with a bamboo flute I bought in Varanasi during a trip. Any tips for a beginner?",
    likesCount: 3,
    createdAt: new Date("2025-04-10T14:30:00Z")
  },
  { 
    id: 3,
    postId: 2, 
    userId: 102, 
    content: "The flute part in 'Tum Hi Ho' from Aashiqui 2 looks simple but getting the emotion right is so difficult!",
    likesCount: 5,
    createdAt: new Date("2025-04-12T15:20:00Z")
  },
  { 
    id: 4,
    postId: 2, 
    userId: 101, 
    content: "For me it was 'Kabhi Jo Badal Barse' - those high notes require perfect breath control.",
    likesCount: 2,
    createdAt: new Date("2025-04-12T16:15:00Z")
  },
  { 
    id: 5,
    postId: 3, 
    userId: 201, 
    content: "I started with 'Mere Sapno Ki Rani' because my grandfather used to hum it all the time.",
    likesCount: 4,
    createdAt: new Date("2025-04-13T14:25:00Z")
  },
  { 
    id: 6,
    postId: 4, 
    userId: 203, 
    content: "Krishna Bhajans sound magical on the flute! I love playing 'Achyutam Keshavam' during morning practice.",
    likesCount: 6,
    createdAt: new Date("2025-04-14T09:40:00Z")
  },
  { 
    id: 7,
    postId: 4, 
    userId: 101, 
    content: "The Gayatri Mantra has a beautiful flow when played slowly on the flute. Perfect for meditation sessions.",
    likesCount: 8,
    createdAt: new Date("2025-04-14T10:30:00Z")
  },
  { 
    id: 8,
    postId: 5, 
    userId: 102, 
    content: "Anandi Musicals in Pune makes excellent hand-crafted flutes. Worth the trip if you're nearby!",
    likesCount: 3,
    createdAt: new Date("2025-04-15T09:15:00Z")
  },
  { 
    id: 9,
    postId: 5, 
    userId: 202, 
    content: "I ordered from Swarsangam online and their flutes are excellent for the price. They have a good range in your budget.",
    likesCount: 5,
    createdAt: new Date("2025-04-15T10:45:00Z")
  }
];

export default function Community() {
  const { user } = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postComments, setPostComments] = useState<Record<number, CommunityComment[]>>({});
  const [activePost, setActivePost] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDiscussionDialog, setShowNewDiscussionDialog] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  
  // Function to find a user by ID
  const findUser = (userId: number | null): User => {
    if (!userId) return createDefaultUser();
    
    // For the current logged-in user
    if (user && userId === 1) {
      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        isInstructor: user.isInstructor || false
      };
    }
    
    // For sample users
    const sampleUser = sampleUsers.find(u => u.id === userId);
    if (sampleUser) {
      return {
        id: sampleUser.id,
        username: sampleUser.displayName.toLowerCase().replace(/\s+/g, '.'),
        displayName: sampleUser.displayName,
        avatar: sampleUser.avatar,
        isInstructor: sampleUser.isInstructor
      };
    }
    
    // Default user as fallback
    return createDefaultUser();
  };
  
  const createDefaultUser = (): User => ({
    id: 999,
    username: "anonymous.user",
    displayName: "Anonymous User",
    avatar: "",
    isInstructor: false
  });

  // Load posts and comments
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Try to get posts from Firebase
        let allPosts = await firebaseDB.getAllCommunityPosts();
        
        // If no posts yet, seed with sample data
        if (allPosts.length === 0) {
          console.log("No posts found, seeding with sample data");
          // Store sample posts in Firebase
          for (const post of sampleDiscussions) {
            await firebaseDB.createCommunityPost(post);
          }
          
          // Store sample comments in Firebase
          for (const comment of sampleComments) {
            await firebaseDB.createCommunityComment(comment);
          }
          
          // Fetch the newly created posts
          allPosts = await firebaseDB.getAllCommunityPosts();
        }
        
        setPosts(allPosts);
        
        // Load comments for each post
        const commentsData: Record<number, CommunityComment[]> = {};
        for (const post of allPosts) {
          const postComments = await firebaseDB.getCommunityComments(post.id);
          commentsData[post.id] = postComments;
        }
        
        setPostComments(commentsData);
      } catch (error) {
        console.error("Error loading community data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const toggleComments = (postId: number) => {
    setActivePost(activePost === postId ? null : postId);
  };
  
  const handleLikePost = async (post: CommunityPost) => {
    if (!user) return;
    
    const newLikesCount = (post.likesCount || 0) + 1;
    try {
      await firebaseDB.updatePostLikes(post.id, newLikesCount);
      
      // Update local state
      setPosts(currentPosts => 
        currentPosts.map(p => 
          p.id === post.id ? { ...p, likesCount: newLikesCount } : p
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  
  const handleLikeComment = async (comment: CommunityComment) => {
    if (!user) return;
    
    const newLikesCount = (comment.likesCount || 0) + 1;
    try {
      await firebaseDB.updateCommentLikes(comment.postId!, comment.id, newLikesCount);
      
      // Update local state
      setPostComments(current => {
        const postId = comment.postId!;
        const updatedComments = current[postId]?.map(c => 
          c.id === comment.id ? { ...c, likesCount: newLikesCount } : c
        ) || [];
        
        return {
          ...current,
          [postId]: updatedComments
        };
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };
  
  const handleCreateDiscussion = async (title: string, content: string) => {
    if (!user) return;
    
    try {
      // Create a new post
      const newPostId = Math.max(0, ...posts.map(p => p.id)) + 1;
      const newPost: CommunityPost = {
        id: newPostId,
        title,
        content,
        userId: user.id,
        category: 'discussion',
        createdAt: new Date(),
        likesCount: 0
      };
      
      await firebaseDB.createCommunityPost(newPost);
      
      // Update local state
      setPosts(currentPosts => [newPost, ...currentPosts]);
      setPostComments(current => ({
        ...current,
        [newPostId]: []
      }));
      
      return true;
    } catch (error) {
      console.error("Error creating discussion:", error);
      throw error;
    }
  };
  
  const handlePostComment = async (postId: number, content: string) => {
    if (!user) return;
    
    setIsPostingComment(true);
    try {
      // Create the new comment
      const newCommentId = Math.max(
        0, 
        ...Object.values(postComments).flatMap(comments => comments.map(c => c.id))
      ) + 1;
      
      const newComment: CommunityComment = {
        id: newCommentId,
        content,
        userId: user.id,
        postId,
        parentId: null,
        createdAt: new Date(),
        likesCount: 0
      };
      
      await firebaseDB.createCommunityComment(newComment);
      
      // Update local state
      setPostComments(current => ({
        ...current,
        [postId]: [...(current[postId] || []), newComment]
      }));
    } catch (error) {
      console.error("Error posting comment:", error);
      throw error;
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Flute Community</h1>
          {user && (
            <Button 
              className="bg-royal-purple hover:bg-royal-purple/90"
              onClick={() => setShowNewDiscussionDialog(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-royal-purple" />
            <span className="ml-2 text-gray-600">Loading discussions...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const postAuthor = findUser(post.userId);
              const comments = (postComments[post.id] || []).map(comment => ({
                ...comment,
                author: findUser(comment.userId)
              }));
              
              return (
                <DiscussionPostCard
                  key={post.id}
                  post={post}
                  author={postAuthor}
                  comments={comments}
                  isActive={activePost === post.id}
                  toggleActive={toggleComments}
                  onLike={handleLikePost}
                  onCommentLike={handleLikeComment}
                  currentUser={user ? {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    avatar: user.avatar,
                    isInstructor: user.isInstructor || false
                  } : null}
                  onPostComment={handlePostComment}
                />
              );
            })}
          </div>
        )}
      </div>
      
      <NewDiscussionDialog
        open={showNewDiscussionDialog}
        onOpenChange={setShowNewDiscussionDialog}
        onSubmit={handleCreateDiscussion}
        currentUser={user ? {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          isInstructor: user.isInstructor || false
        } : null}
      />
    </>
  );
}