import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import NavigationBar from "@/components/NavigationBar";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, MessageCircle } from 'lucide-react';

// Sample user data with Indian context
const indianUsers = [
  { id: 1, name: "Anjali Sharma", avatar: "", role: "Flute Teacher" },
  { id: 2, name: "Rahul Patel", avatar: "", role: "Beginner Flutist" },
  { id: 3, name: "Deepak Singh", avatar: "", role: "Advanced Player" },
  { id: 4, name: "Priya Gupta", avatar: "", role: "Carnatic Flutist" },
  { id: 5, name: "Vikram Reddy", avatar: "", role: "Hindustani Classical Student" }
];

// Sample discussion posts with Indian context
const discussionPosts = [
  {
    id: 1,
    author: indianUsers[0],
    title: "How did you learn to play the flute – teacher, YouTube, or self-taught?",
    content: "I've been teaching flute for 5 years in Delhi, but I'm curious about everyone's learning journey. Did you learn from a guru, YouTube videos, or teach yourself?",
    likes: 24,
    comments: [
      { 
        id: 1, 
        author: indianUsers[2], 
        content: "I started with a teacher in Pune who specialized in Hindustani classical, but YouTube has been great for picking up fusion techniques.",
        likes: 7
      },
      { 
        id: 2, 
        author: indianUsers[1], 
        content: "Completely self-taught! Started with a bamboo flute I bought in Varanasi during a trip. Any tips for a beginner?",
        likes: 3
      }
    ],
    createdAt: "2025-04-10T09:30:00Z"
  },
  {
    id: 2,
    author: indianUsers[3],
    title: "What's the hardest Bollywood flute tune you've tried?",
    content: "'Roja Janeman' was tricky for me – especially the fast part! I spent weeks practicing it. Which Bollywood songs challenged you the most?",
    likes: 18,
    comments: [
      { 
        id: 3, 
        author: indianUsers[4], 
        content: "The flute part in 'Tum Hi Ho' from Aashiqui 2 looks simple but getting the emotion right is so difficult!",
        likes: 5
      },
      { 
        id: 4, 
        author: indianUsers[0], 
        content: "For me it was 'Kabhi Jo Badal Barse' - those high notes require perfect breath control.",
        likes: 2
      }
    ],
    createdAt: "2025-04-12T14:15:00Z"
  },
  {
    id: 3,
    author: indianUsers[4],
    title: "Which Indian song was your first flute tune?",
    content: "Mine was 'Vaishnav Jan To'! It's a perfect beginner bhajan with a simple melody that sounds beautiful on flute. What was yours?",
    likes: 15,
    comments: [
      { 
        id: 5, 
        author: indianUsers[1], 
        content: "I started with 'Mere Sapno Ki Rani' because my grandfather used to hum it all the time.",
        likes: 4
      }
    ],
    createdAt: "2025-04-13T11:45:00Z"
  },
  {
    id: 4,
    author: indianUsers[2],
    title: "Is there a devotional song you love playing on the flute?",
    content: "Bhajans, aartis, or any soothing melodies you enjoy playing? I've been practicing 'Om Jai Jagdish Hare' for an upcoming puja at our local temple.",
    likes: 12,
    comments: [
      { 
        id: 6, 
        author: indianUsers[3], 
        content: "Krishna Bhajans sound magical on the flute! I love playing 'Achyutam Keshavam' during morning practice.",
        likes: 6
      },
      { 
        id: 7, 
        author: indianUsers[0], 
        content: "The Gayatri Mantra has a beautiful flow when played slowly on the flute. Perfect for meditation sessions.",
        likes: 8
      }
    ],
    createdAt: "2025-04-14T08:20:00Z"
  },
  {
    id: 5,
    author: indianUsers[1],
    title: "Best place to buy quality bamboo flutes in India?",
    content: "I'm looking to upgrade from my beginner flute. Any recommendations for shops in Mumbai or online stores that sell good quality bamboo flutes? Budget around 2000 rupees.",
    likes: 9,
    comments: [
      { 
        id: 8, 
        author: indianUsers[4], 
        content: "Anandi Musicals in Pune makes excellent hand-crafted flutes. Worth the trip if you're nearby!",
        likes: 3
      },
      { 
        id: 9, 
        author: indianUsers[2], 
        content: "I ordered from Swarsangam online and their flutes are excellent for the price. They have a good range in your budget.",
        likes: 5
      }
    ],
    createdAt: "2025-04-15T07:30:00Z"
  }
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric' 
  });
}

export default function Community() {
  const { user } = useUser();
  const [activePost, setActivePost] = useState<number | null>(null);
  
  const toggleComments = (postId: number) => {
    setActivePost(activePost === postId ? null : postId);
  };

  return (
    <>
      <NavigationBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Flute Community</h1>
          {user && (
            <Button className="bg-royal-purple hover:bg-royal-purple/90">
              <MessageCircle className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {discussionPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-royal-purple/20 text-royal-purple">
                      {post.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{post.author.name}</h3>
                    <p className="text-xs text-gray-500">{post.author.role} • {formatDate(post.createdAt)}</p>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h2>
                <p className="text-gray-700 mb-4">{post.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <button className="flex items-center text-gray-500 hover:text-royal-purple">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span>{post.likes}</span>
                    </button>
                    <button 
                      className="flex items-center text-gray-500 hover:text-royal-purple"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{post.comments.length}</span>
                    </button>
                  </div>
                  
                  {user && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-royal-purple hover:bg-royal-purple/10"
                    >
                      Reply
                    </Button>
                  )}
                </div>
              </div>
              
              {activePost === post.id && post.comments.length > 0 && (
                <div className="bg-gray-50 border-t border-gray-100">
                  <div className="px-6 py-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Comments</h4>
                    <div className="space-y-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex">
                          <Avatar className="h-8 w-8 mt-1 mr-3 flex-shrink-0">
                            <AvatarFallback className="bg-royal-purple/10 text-royal-purple text-xs">
                              {comment.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1">
                              <h5 className="text-sm font-medium text-gray-900 mr-2">{comment.author.name}</h5>
                              <span className="text-xs text-gray-500">{comment.author.role}</span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                            <div className="flex items-center mt-2">
                              <button className="flex items-center text-xs text-gray-500 hover:text-royal-purple">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                <span>{comment.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {user && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex">
                          <Avatar className="h-8 w-8 mt-1 mr-3">
                            <AvatarFallback className="bg-royal-purple/10 text-royal-purple text-xs">
                              {user.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <textarea 
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-purple focus:border-transparent" 
                              rows={2}
                              placeholder="Add your comment..."
                            ></textarea>
                            <div className="mt-2 text-right">
                              <Button 
                                size="sm"
                                className="bg-royal-purple hover:bg-royal-purple/90"
                              >
                                Post
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}