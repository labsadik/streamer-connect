
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostActionsProps {
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  onLikeChange: () => void;
}

export default function PostActions({ 
  postId, 
  likes, 
  comments, 
  shares, 
  isLiked, 
  onLikeChange 
}: PostActionsProps) {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to like posts");
        return;
      }

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .match({ user_id: user.id, post_id: postId });
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({ user_id: user.id, post_id: postId });
        
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
        title: 'Check out this post',
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike}
          disabled={isLiking}
          className={`${isLiked ? 'text-primary' : ''}`}
        >
          <ThumbsUp size={18} className={`mr-1 ${isLiked ? 'fill-primary' : ''}`} />
          <span>{likes}</span>
        </Button>
        
        <Button variant="ghost" size="sm">
          <MessageSquare size={18} className="mr-1" />
          <span>{comments}</span>
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 size={18} className="mr-1" />
          <span>{shares}</span>
        </Button>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Save post</DropdownMenuItem>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuItem>Report</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
