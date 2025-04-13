import { 
  User,
  Tutorial,
  Tag,
  Note,
  Comment,
  Bookmark,
  CommunityPost,
  CommunityComment
} from "@shared/schema";

// Extended types with additional computed properties
export interface TutorialWithTags extends Tutorial {
  tags?: Tag[];
  author?: Partial<User>;
  commentCount?: number;
  isBookmarked?: boolean;
  updatedAt?: Date;
}

export interface NoteWithTags extends Note {
  tags?: Tag[];
  author?: Partial<User>;
  commentCount?: number;
  isBookmarked?: boolean;
}

export interface CommunityPostWithTags extends CommunityPost {
  tags?: Tag[];
  author?: Partial<User>;
  commentCount?: number;
  isLiked?: boolean;
}

export interface CommentWithUser extends Comment {
  author?: Partial<User>;
}

export interface CommunityCommentWithUser extends CommunityComment {
  author?: Partial<User>;
  replies?: CommunityCommentWithUser[];
}

// Component specific props
export interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export interface TutorialCardProps {
  tutorial: TutorialWithTags;
  onPlay?: (tutorial: TutorialWithTags) => void;
  onEdit?: (tutorial: TutorialWithTags) => void;
  onBookmark?: (tutorial: TutorialWithTags) => void;
  onComment?: (tutorial: TutorialWithTags) => void;
  onShare?: (tutorial: TutorialWithTags) => void;
}

export interface CommunityPostProps {
  post: CommunityPostWithTags;
  onLike?: (post: CommunityPostWithTags) => void;
  onComment?: (post: CommunityPostWithTags) => void;
  onBookmark?: (post: CommunityPostWithTags) => void;
  onShare?: (post: CommunityPostWithTags) => void;
}

export interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  onReady?: () => void;
  onStateChange?: (state: 'play' | 'pause' | 'end') => void;
}

export type NavigationItem = {
  name: string;
  icon: string;
  href: string;
}

export interface Category {
  id: string;
  name: string;
}
