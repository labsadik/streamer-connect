
import { Video } from "@/types";
import { Link } from "react-router-dom";
import { formatNumber, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

interface FeaturedVideoProps {
  video: Video;
}

export function FeaturedVideo({ video }: FeaturedVideoProps) {
  return (
    <div className="relative rounded-xl overflow-hidden group">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-[70vh] max-h-[600px] flex flex-col justify-end p-6 md:p-10">
        <div className="max-w-xl animate-slide-up">
          <div className="flex items-center mb-4">
            <span className="px-2 py-1 bg-primary/90 rounded-md text-primary-foreground text-xs font-medium">
              Featured
            </span>
            {video.user && (
              <Link to={`/profile/${video.user.id}`} className="ml-3 flex items-center">
                <img 
                  src={video.user.avatar} 
                  alt={video.user.name}
                  className="w-8 h-8 rounded-full mr-2 border border-white/20"
                />
                <span className="font-medium text-white">{video.user.name}</span>
              </Link>
            )}
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            {video.title}
          </h1>
          
          <p className="text-white/80 mb-4 line-clamp-2">
            {video.description}
          </p>
          
          <div className="flex items-center text-sm text-white/60 mb-6">
            <span>{formatNumber(video.views)} views</span>
            <span className="mx-2">•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
          
          <Button size="lg" asChild className="group">
            <Link to={`/video/${video.id}`} className="flex items-center gap-2">
              <PlayCircle size={20} className="transition-transform group-hover:scale-110" />
              <span>Watch Now</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FeaturedVideo;
