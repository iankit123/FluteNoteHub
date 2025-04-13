import React, { useState } from 'react';
import { CommunityPostProps } from '@/types';
import TagBadge from './TagBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart,
  HeartCrack,
  MessageSquare, 
  Bookmark, 
  BookmarkCheck,
  Share2,
  Send 
} from 'lucide-react';
import { formatTimeAgo, cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';

const CommunityPost: React.FC<CommunityPostProps> = ({ 
  post, 
  onLike, 
  onComment, 
  onBookmark, 
  onShare 
}) => {
  const { user } = useUser();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      // Submit comment logic
      onComment?.(post);
      setCommentText('');
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* Author header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage src={post.author?.avatar || ''} alt={post.author?.displayName} />
            <AvatarFallback>{post.author?.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">{post.author?.displayName}</h3>
              {post.author?.isInstructor && (
                <span className="ml-2 text-xs bg-royal-purple/10 text-royal-purple px-2 py-0.5 rounded-full">
                  Instructor
                </span>
              )}
            </div>
            <p className="text-dark-slate/60 text-xs">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
      </div>
      
      {/* Post content */}
      <div className="p-4">
        <h4 className="font-poppins font-semibold text-lg">{post.title}</h4>
        
        <div className="mt-3 text-dark-slate/80">
          {post.content.split('\n').map((line, index) => (
            <p key={index} className={index > 0 ? 'mt-2' : ''}>{line}</p>
          ))}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags?.map(tag => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button 
              className={cn(
                "flex items-center",
                post.isLiked ? "text-royal-purple" : "text-dark-slate/60 hover:text-royal-purple"
              )}
              onClick={() => onLike?.(post)}
            >
              {post.isLiked ? <HeartCrack className="h-4 w-4 mr-1" /> : <Heart className="h-4 w-4 mr-1" />}
              <span>{post.likesCount}</span>
            </button>
            <button 
              className="flex items-center text-dark-slate/60 hover:text-royal-purple transition-colors"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{post.commentCount || 0}</span>
            </button>
          </div>
          <div className="flex space-x-2">
            <button 
              className={cn(
                "transition-colors",
                post.isLiked ? "text-royal-purple" : "hover:text-royal-purple text-dark-slate/60"
              )}
              onClick={() => onBookmark?.(post)}
            >
              {post.isLiked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
            <button 
              className="hover:text-royal-purple transition-colors text-dark-slate/60"
              onClick={() => onShare?.(post)}
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            {/* Show 1 sample comment */}
            <div className="flex items-start mb-3">
              <Avatar className="w-8 h-8 mr-2">
                <AvatarImage src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150" alt="User comment" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="bg-ivory-white rounded-lg p-2 flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Alex Johnson</span>
                  <span className="text-xs text-dark-slate/50">15 min ago</span>
                </div>
                <p className="text-sm">I find that recording myself is the most helpful technique! It reveals issues I never notice while playing.</p>
              </div>
            </div>
            
            {post.commentCount && post.commentCount > 1 && (
              <button className="text-royal-purple text-sm hover:underline">
                View all {post.commentCount} comments
              </button>
            )}
            
            {/* Comment input */}
            {user && (
              <form onSubmit={handleSubmitComment} className="flex items-center mt-3">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarImage src={user.avatar || ""} alt={user.displayName} />
                  <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-ivory-white rounded-full px-4 py-2">
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="w-full bg-transparent outline-none text-sm" 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  className="ml-2 text-royal-purple disabled:text-royal-purple/50"
                  disabled={!commentText.trim()}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPost;
