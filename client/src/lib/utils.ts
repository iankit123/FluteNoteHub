import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function extractVideoId(url: string): string | null {
  // YouTube URL patterns
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^&\s]+)/,
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com)\/(?:embed)\/([^&\s]+)/,
    /(?:https?:\/\/)?(?:youtu\.be)\/([^&\s]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getTimestampInSeconds(timestamp: string): number | null {
  // Parse formats like [1:22], [01:22], [1:22.5], [01:22.5], [1m22s], etc.
  const patterns = [
    // [1:22] or [01:22] format
    /\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]/,
    // [1m22s] format
    /\[(\d+)m(\d+(?:\.\d+)?)s\]/
  ];
  
  for (const pattern of patterns) {
    const match = timestamp.match(pattern);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      return minutes * 60 + seconds;
    }
  }
  
  return null;
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 9);
}
