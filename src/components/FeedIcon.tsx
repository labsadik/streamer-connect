
import { Home, Activity } from "lucide-react";

interface FeedIconProps {
  className?: string;
  size?: number;
}

export function FeedIcon({ className = "", size = 24 }: FeedIconProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Activity 
          size={size} 
          className="text-gradient bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text fill-transparent stroke-current"
        />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

export default FeedIcon;
