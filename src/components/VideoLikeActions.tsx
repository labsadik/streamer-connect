
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2, Download, MoreHorizontal, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoLikeActionsProps {
  videoId: string;
  likes: number;
  comments: number;
  shares?: number;
  isLiked?: boolean;
  onLikeChange: () => void;
  compact?: boolean;
}

export default function VideoLikeActions({ 
  videoId, 
  likes, 
  comments, 
  shares = 0, 
  isLiked, 
  onLikeChange,
  compact = false
}: VideoLikeActionsProps) {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to like videos");
        return;
      }

      if (isLiked) {
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .match({ user_id: user.id, video_id: videoId });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('video_likes')
          .insert({ user_id: user.id, video_id: videoId });
        
        if (error) throw error;
      }
      
      onLikeChange();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Check out this video',
        url: window.location.href,
      });
    } catch (error) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleDownload = () => {
    toast.info("Download functionality coming soon!");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike}
          disabled={isLiking}
          className={`group flex items-center gap-1 px-2 py-1 h-8 rounded-full transition-all duration-200 ${
            isLiked 
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
              : 'hover:bg-white/20 text-white hover:text-red-400'
          }`}
        >
          <Heart 
            size={16} 
            className={`transition-all duration-200 ${
              isLiked 
                ? 'fill-red-500 text-red-500 scale-110' 
                : 'group-hover:scale-105'
            }`} 
          />
          <span className="text-xs font-medium">{likes}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="group flex items-center gap-1 px-2 py-1 h-8 text-white hover:bg-white/20"
        >
          <MessageSquare size={16} className="group-hover:scale-105 transition-all duration-200" />
          <span className="text-xs font-medium">{comments}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare}
          className="group flex items-center gap-1 px-2 py-1 h-8 text-white hover:bg-white/20"
        >
          <Share2 size={16} className="group-hover:scale-105 transition-all duration-200" />
          <span className="text-xs font-medium">{shares}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-background/80 backdrop-blur-sm rounded-lg border">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike}
          disabled={isLiking}
          className={`group flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
            isLiked 
              ? 'bg-gradient-to-r from-pink-500/20 to-red-500/20 text-pink-600 border border-pink-500/30' 
              : 'hover:bg-primary/10'
          }`}
        >
          <ThumbsUp 
            size={18} 
            className={`transition-all duration-200 ${
              isLiked 
                ? 'fill-pink-500 text-pink-500 scale-110' 
                : 'group-hover:text-primary group-hover:scale-105'
            }`} 
          />
          <span className="font-medium">{likes}</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="group flex items-center gap-2">
          <MessageSquare 
            size={18} 
            className="group-hover:text-primary group-hover:scale-105 transition-all duration-200" 
          />
          <span className="font-medium">{comments}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare}
          className="group flex items-center gap-2"
        >
          <Share2 
            size={18} 
            className="group-hover:text-primary group-hover:scale-105 transition-all duration-200" 
          />
          <span className="font-medium">{shares}</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDownload}
          className="group"
        >
          <Download 
            size={18} 
            className="group-hover:text-primary group-hover:scale-105 transition-all duration-200" 
          />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="group">
              <MoreHorizontal 
                size={18} 
                className="group-hover:text-primary transition-colors duration-200" 
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Save video</DropdownMenuItem>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
            <DropdownMenuItem>Add to playlist</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
