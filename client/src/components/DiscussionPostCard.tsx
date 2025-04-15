import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { DiscussionPostProps } from '@/types';

function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric' 
  });
}

export default function DiscussionPostCard({
  post,
  author,
  comments,
  onLike,
  onReply,
  onCommentLike,
  isActive,
  toggleActive,
  currentUser,
  onPostComment
}: DiscussionPostProps) {
  const [commentText, setCommentText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      await onPostComment(post.id, commentText);
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={author.avatar || ''} alt={author.displayName} />
            <AvatarFallback className="bg-royal-purple/20 text-royal-purple">
              {author.displayName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{author.displayName}</h3>
            <p className="text-xs text-gray-500">
              {author.isInstructor ? 'Flute Teacher' : 'Flute Enthusiast'} • {formatDate(post.createdAt || new Date())}
            </p>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h2>
        <p className="text-gray-700 mb-4">{post.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button 
              className="flex items-center text-gray-500 hover:text-royal-purple"
              onClick={() => onLike && onLike(post)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{post.likesCount || 0}</span>
            </button>
            <button 
              className="flex items-center text-gray-500 hover:text-royal-purple"
              onClick={() => toggleActive(post.id)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{comments.length}</span>
            </button>
          </div>
          
          {currentUser && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-royal-purple hover:bg-royal-purple/10"
              onClick={() => onReply && onReply(post)}
            >
              Reply
            </Button>
          )}
        </div>
      </div>
      
      {isActive && (
        <div className="bg-gray-50 border-t border-gray-100">
          <div className="px-6 py-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Comments</h4>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex">
                  <Avatar className="h-8 w-8 mt-1 mr-3 flex-shrink-0">
                    <AvatarImage src={comment.author.avatar || ''} alt={comment.author.displayName} />
                    <AvatarFallback className="bg-royal-purple/10 text-royal-purple text-xs">
                      {comment.author.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <h5 className="text-sm font-medium text-gray-900 mr-2">{comment.author.displayName}</h5>
                      <span className="text-xs text-gray-500">
                        {comment.author.isInstructor ? 'Teacher' : 'Enthusiast'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                    <div className="flex items-center mt-2">
                      <button 
                        className="flex items-center text-xs text-gray-500 hover:text-royal-purple"
                        onClick={() => onCommentLike && onCommentLike(comment)}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        <span>{comment.likesCount || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {currentUser && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex">
                  <Avatar className="h-8 w-8 mt-1 mr-3">
                    <AvatarImage src={currentUser.avatar || ''} alt={currentUser.displayName} />
                    <AvatarFallback className="bg-royal-purple/10 text-royal-purple text-xs">
                      {currentUser.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <textarea 
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-purple focus:border-transparent" 
                      rows={2}
                      placeholder="Add your comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    ></textarea>
                    <div className="mt-2 text-right">
                      <Button 
                        size="sm"
                        className="bg-royal-purple hover:bg-royal-purple/90"
                        onClick={handleCommentSubmit}
                        disabled={isSubmitting || !commentText.trim()}
                      >
                        {isSubmitting ? 'Posting...' : 'Post'}
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
  );
}