export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  banner?: string;
  about?: string;
  subscribers: number;
  subscriberCount?: number;
  videoCount?: number;
  verified?: boolean;
  isSubscribed?: boolean;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  views: number;
  createdAt: string;
  duration: number;
  userId: string;
  user?: User;
  likes: number;
  dislikes: number;
  isSaved?: boolean;
  isShort?: boolean;
  isLive?: boolean;
  quality?: "240p" | "360p" | "480p" | "720p" | "1080p" | "1440p" | "4K" | "8K";
  enhancedQuality?: "240p" | "360p" | "480p" | "720p" | "1080p" | "1440p" | "4K" | "8K";
  qualityLevels?: string[];
  defaultQuality?: string;
  tags?: string[];
  category?: string;
  commentsCount?: number;
  sharesCount?: number;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  parentId?: string;
  createdAt: string;
  updatedAt?: string;
  user?: User;
  replies?: Comment[];
}

export interface VideoReport {
  id: string;
  userId: string;
  videoId: string;
  reason: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  subscriberId: string;
  channelId: string;
  createdAt: string;
}

export interface SavedVideo {
  id: string;
  userId: string;
  videoId: string;
  createdAt: string;
  video?: Video;
}

export interface VideoView {
  id: string;
  videoId: string;
  userId?: string;
  ipAddress?: string;
  viewedAt: string;
  durationWatched: number;
  qualityWatched: string;
}

export interface VideoLike {
  id: string;
  userId: string;
  videoId: string;
  createdAt: string;
}
