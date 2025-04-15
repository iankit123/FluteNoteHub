import { Tutorial, CommunityPost, CommunityComment, User } from '@shared/schema';

export interface TutorialCardProps {
  tutorial: Tutorial;
  onPlay?: (tutorial: Tutorial) => void;
  onEdit?: (tutorial: Tutorial) => void;
  onBookmark?: (tutorial: Tutorial) => void;
  onComment?: (tutorial: Tutorial) => void;
  onShare?: (tutorial: Tutorial) => void;
  onAddToMyNotes?: (tutorial: Tutorial) => void;
  showAuthor?: boolean;
  currentUserName?: string | null;
}

export interface DiscussionPostProps {
  post: CommunityPost;
  author: User;
  comments: (CommunityComment & { author: User })[];
  onLike?: (post: CommunityPost) => void;
  onReply?: (post: CommunityPost) => void;
  onCommentLike?: (comment: CommunityComment) => void;
  isActive: boolean;
  toggleActive: (postId: number) => void;
  currentUser: User | null;
  onPostComment: (postId: number, content: string) => Promise<void>;
}

export interface NewDiscussionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string) => Promise<void>;
  currentUser: User | null;
}