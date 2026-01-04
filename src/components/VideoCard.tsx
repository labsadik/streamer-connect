
import { useState } from "react";
import { Link } from "react-router-dom";
import { Video } from "@/types";
import { formatNumber, formatDate, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Wifi, Clock } from "lucide-react";

interface VideoCardProps {
  video: Video;
  featured?: boolean;
}

export function VideoCard({ video, featured = false }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`group transition-transform duration-300 ${featured ? "" : "hover:scale-[1.02]"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/video/${video.id}`} className="block outline-none">
        <div className={`relative rounded-lg overflow-hidden ${featured ? "aspect-[16/8]" : "aspect-video"}`}>
          {/* Thumbnail */}
          <img 
            src={video.thumbnail} 
            alt={video.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
          />
          
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
          
          {/* Live badge */}
          {video.isLive && (
            <Badge variant="destructive" className="absolute top-2 left-2 px-2 py-0.5 text-xs flex items-center gap-1">
              <Wifi size={12} className="animate-pulse" /> LIVE
            </Badge>
          )}
          
          {/* Short badge */}
          {video.isShort && (
            <Badge variant="secondary" className="absolute top-2 left-2 px-2 py-0.5 text-xs flex items-center gap-1">
              <Clock size={12} /> SHORT
            </Badge>
          )}
        </div>
      </Link>
      
      <div className="flex gap-3 mt-3">
        {/* Channel avatar (only show on non-featured cards) */}
        {!featured && video.user && (
          <Link to={`/profile/${video.user.id}`} className="flex-shrink-0 mt-0.5">
            <img 
              src={video.user.avatar} 
              alt={video.user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          </Link>
        )}
        
        <div className="flex-1 min-w-0">
          <Link to={`/video/${video.id}`} className="block outline-none">
            <h3 className={`font-medium line-clamp-2 ${featured ? "text-lg" : "text-sm"}`}>
              {video.title}
            </h3>
          </Link>
          
          {video.user && (
            <Link to={`/profile/${video.user.id}`} className="mt-1 block">
              <p className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {video.user.name}
              </p>
            </Link>
          )}
          
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span>{formatNumber(video.views)} views</span>
            <span className="mx-1">•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
