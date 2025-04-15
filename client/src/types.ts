import { Tutorial } from '@shared/schema';

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