import React, { useState } from 'react';
import { Link } from 'wouter';
import { TutorialCardProps } from '@/types';
import TagBadge from './TagBadge';
import EditDescriptionDialog from './EditDescriptionDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import YouTubePlayer from '@/components/ui/player';
import WaveDivider from '@/components/ui/wave-divider';
import { Button } from '@/components/ui/button';
import { 
  Bookmark, 
  BookmarkCheck,
  MessageSquare, 
  Share2, 
  Edit,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { cn, formatTimeAgo, truncateText } from '@/lib/utils';

const TutorialCard: React.FC<TutorialCardProps> = ({ 
  tutorial, 
  onPlay, 
  onEdit, 
  onBookmark, 
  onComment, 
  onShare 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const isYouTube = tutorial.source === 'youtube';
  const isPersonalNote = tutorial.source === 'personal';
  const isWebsite = tutorial.source === 'website';
  const isCommunityShare = tutorial.source === 'community';
  
  const handlePlay = () => {
    if (onPlay) onPlay(tutorial);
  };
  
  const toggleDescription = () => {
    setExpanded(!expanded);
  };
  
  const handleEditDescription = () => {
    setEditDialogOpen(true);
  };
  
  const hasDescription = !!tutorial.description;
  const firstLine = hasDescription ? 
    tutorial.description?.split('\n')[0] || '' : 
    '';
  
  return (
    <>
    <div className="bg-white rounded-xl shadow-card card-transition gradient-border overflow-hidden relative">
      {isYouTube && (
        <div className="relative">
          <YouTubePlayer 
            videoUrl={tutorial.videoUrl || ''} 
            thumbnailUrl={tutorial.thumbnailUrl || undefined}
            title={tutorial.title}
            onReady={() => onPlay?.(tutorial)}
          />
          <div className="absolute top-3 right-3 bg-dark-slate/60 text-ivory-white px-2 py-1 rounded text-xs">
            {tutorial.duration}
          </div>
        </div>
      )}
      
      {/* Personal Note Header */}
      {isPersonalNote && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between">
            <h3 className="font-poppins font-semibold text-lg">{tutorial.title}</h3>
            <span className="text-xs text-dark-slate/50">
              {tutorial.updatedAt ? `Updated ${formatTimeAgo(tutorial.updatedAt)}` : formatTimeAgo(tutorial.createdAt || new Date())}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tutorial.tags?.map(tag => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      )}
      
      {/* Website Tutorial Header */}
      {isWebsite && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between">
            <h3 className="font-poppins font-semibold text-lg">{tutorial.title}</h3>
            <span className="text-xs text-dark-slate/50">
              {formatTimeAgo(tutorial.createdAt || new Date())}
            </span>
          </div>
          <div className="mt-2">
            {tutorial.websiteUrl && (
              <a 
                href={tutorial.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-royal-purple hover:underline"
              >
                {(() => {
                  try {
                    return new URL(tutorial.websiteUrl).hostname;
                  } catch (e) {
                    return tutorial.websiteUrl;
                  }
                })()}
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tutorial.tags?.map(tag => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      )}
      
      {/* Community Share Header */}
      {isCommunityShare && (
        <div className="relative">
          {tutorial.thumbnailUrl && (
            <img 
              src={tutorial.thumbnailUrl} 
              alt={tutorial.title} 
              className="w-full h-48 object-cover" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-royal-purple/50 to-transparent flex items-end">
            <div className="p-4 w-full">
              <div className="flex flex-wrap gap-2">
                {tutorial.tags?.slice(0, 2).map((tag, index) => (
                  <TagBadge key={index} tag={tag} />
                ))}
              </div>
            </div>
          </div>
          {tutorial.videoUrl && (
            <button 
              onClick={handlePlay} 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-royal-purple/80 hover:bg-royal-purple text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M9.5 17V7l7 5-7 5z" clipRule="evenodd"/>
              </svg>
            </button>
          )}
        </div>
      )}
      
      {/* Wave Divider - For YouTube and community posts that have thumbnails */}
      {(isYouTube || (isCommunityShare && tutorial.thumbnailUrl)) && (
        <div className="relative z-0 -mt-1 -mb-2">
          <WaveDivider />
        </div>
      )}
      
      <div className="pt-0 px-4 pb-4">
        {/* Title and description for YouTube and Community */}
        {(isYouTube || isCommunityShare) && (
          <>
            <h3 className="font-poppins font-semibold text-lg">{tutorial.title}</h3>
            
            {hasDescription ? (
              <div className="mt-2">
                <div className="text-dark-slate/70 text-sm">
                  {expanded 
                    ? tutorial.description?.split('\n').map((line, i) => (
                        <p key={i} className="mb-1">{line || ' '}</p>
                      ))
                    : <p>{truncateText(firstLine, 100) + (firstLine.length > 100 || tutorial.description?.includes('\n') ? '...' : '')}</p>}
                </div>
                
                <div className="flex">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleDescription} 
                    className="text-royal-purple text-xs mt-1 h-6 px-2 flex items-center"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        <span>See Full Description</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditDescription}
                    className="text-royal-purple text-xs mt-1 h-6 px-2 flex items-center"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    <span>Edit</span>
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleEditDescription} 
                className="text-royal-purple text-xs mt-2 h-6 px-2 flex items-center"
              >
                <Plus className="h-3 w-3 mr-1" />
                <span>Add Description</span>
              </Button>
            )}
          </>
        )}
        
        {/* Website description */}
        {isWebsite && hasDescription && (
          <div className="mt-2">
            <div className="text-dark-slate/70 text-sm">
              {expanded 
                ? tutorial.description?.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line || ' '}</p>
                  ))
                : <p>{truncateText(firstLine, 100) + (firstLine.length > 100 || tutorial.description?.includes('\n') ? '...' : '')}</p>}
            </div>
            
            <div className="flex">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleDescription} 
                className="text-royal-purple text-xs mt-1 h-6 px-2 flex items-center"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    <span>See Full Description</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditDescription}
                className="text-royal-purple text-xs mt-1 h-6 px-2 flex items-center"
              >
                <Edit className="h-3 w-3 mr-1" />
                <span>Edit</span>
              </Button>
            </div>
          </div>
        )}
        
        {isWebsite && !hasDescription && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEditDescription} 
            className="text-royal-purple text-xs mt-2 h-6 px-2 flex items-center"
          >
            <Plus className="h-3 w-3 mr-1" />
            <span>Add Description</span>
          </Button>
        )}
        
        {/* Personal note content */}
        {isPersonalNote && (
          <div className="text-sm text-dark-slate/80 space-y-2">
            {tutorial.description && (
              <>
                {tutorial.description.split('\n').map((line, i) => {
                  if (line.startsWith('[') && line.includes(']')) {
                    const timestampEnd = line.indexOf(']') + 1;
                    const timestamp = line.substring(0, timestampEnd);
                    const text = line.substring(timestampEnd);
                    
                    return (
                      <p key={i}>
                        <span className="text-royal-purple font-medium">{timestamp}</span>
                        {text}
                      </p>
                    );
                  } else if (line.startsWith('> ')) {
                    return (
                      <p key={i} className="bg-turmeric-yellow/20 px-2 py-1 rounded text-dark-slate/90 block mt-3">
                        {line.substring(2)}
                      </p>
                    );
                  } else {
                    return <p key={i}>{line}</p>;
                  }
                })}
              </>
            )}
          </div>
        )}
        
        {/* Author and action buttons */}
        <div className="flex justify-between items-center mt-4">
          {tutorial.author ? (
            <div className="flex items-center">
              <Avatar className="w-8 h-8 mr-2">
                <AvatarImage src={tutorial.author.avatar || ''} alt={tutorial.author.displayName} />
                <AvatarFallback>{tutorial.author.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="ml-2 text-sm">{tutorial.author.displayName}</span>
              {tutorial.author.isInstructor && (
                <span className="ml-2 text-xs bg-royal-purple/10 text-royal-purple px-2 py-0.5 rounded-full">
                  Instructor
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-dark-slate/50">
              {formatTimeAgo(tutorial.createdAt || new Date())}
            </div>
          )}
          
          <div className="flex space-x-2 text-dark-slate/60">
            {isPersonalNote && (
              <button 
                onClick={() => onEdit?.(tutorial)} 
                className="hover:text-royal-purple transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={() => onBookmark?.(tutorial)} 
              className={cn(
                "transition-colors",
                tutorial.isBookmarked ? "text-royal-purple" : "hover:text-royal-purple text-dark-slate/60"
              )}
            >
              {tutorial.isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
            <button 
              onClick={() => onComment?.(tutorial)} 
              className="hover:text-royal-purple transition-colors"
            >
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4" />
                {tutorial.commentCount !== undefined && (
                  <span className="text-xs ml-1">{tutorial.commentCount}</span>
                )}
              </div>
            </button>
            <button 
              onClick={() => onShare?.(tutorial)} 
              className="hover:text-royal-purple transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <EditDescriptionDialog
      tutorial={tutorial}
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
    />
    </>
  );
};

export default TutorialCard;
