
import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, User, Volume2, VolumeX } from "lucide-react";
import { Video, Comment as CommentType } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShortVideoFeedProps {
  videos: Video[];
}

export default function ShortVideoFeed({ videos }: ShortVideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, CommentType[]>>({});
  const [newComment, setNewComment] = useState<string>("");
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [descriptionExpanded, setDescriptionExpanded] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Initialize video refs
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, videos.length);
  }, [videos.length]);

  // Set up intersection observer for videos
  useEffect(() => {
    if (videos.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          
          if (entry.isIntersecting) {
            videoElement.play().catch(error => console.error("Error playing video:", error));
            
            // Find the index of this video in our array
            const index = videoRefs.current.findIndex(ref => ref === videoElement);
            if (index !== -1) {
              setCurrentIndex(index);
            }
          } else {
            videoElement.pause();
          }
        });
      },
      {
        threshold: 0.7, // Video needs to be 70% visible to start playing
      }
    );
    
    videoRefs.current.forEach((videoRef) => {
      if (videoRef) {
        observer.observe(videoRef);
      }
    });
    
    return () => {
      videoRefs.current.forEach((videoRef) => {
        if (videoRef) {
          observer.unobserve(videoRef);
        }
      });
    };
  }, [videos]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoRefs.current.forEach(videoRef => {
      if (videoRef) {
        videoRef.muted = !isMuted;
      }
    });
  };

  const handleLike = async (videoId: string) => {
    if (!user) {
      toast.error("Please sign in to like videos");
      navigate("/auth");
      return;
    }
    
    const newLikeState = !likes[videoId];
    setLikes(prev => ({ ...prev, [videoId]: newLikeState }));
    
    const currentVideo = videos.find(v => v.id === videoId);
    if (!currentVideo) return;
    
    try {
      await supabase
        .from('videos')
        .update({ 
          likes: newLikeState 
            ? (currentVideo.likes + 1) 
            : Math.max(0, currentVideo.likes - 1) 
        })
        .eq('id', videoId);
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert UI state on error
      setLikes(prev => ({ ...prev, [videoId]: !newLikeState }));
    }
  };

  const handleSave = async (videoId: string) => {
    if (!user) {
      toast.error("Please sign in to save videos");
      navigate("/auth");
      return;
    }
    
    const newSaveState = !saved[videoId];
    setSaved(prev => ({ ...prev, [videoId]: newSaveState }));
    
    try {
      if (newSaveState) {
        // Save video
        await supabase
          .from('saved_videos')
          .insert({
            user_id: user.id,
            video_id: videoId
          });
        toast.success("Video saved");
      } else {
        // Unsave video
        await supabase
          .from('saved_videos')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);
        toast.success("Video removed from saved videos");
      }
    } catch (error) {
      console.error("Error saving/unsaving video:", error);
      // Revert UI state on error
      setSaved(prev => ({ ...prev, [videoId]: !newSaveState }));
    }
  };

  const handleShare = (videoId: string) => {
    const url = `${window.location.origin}/video/${videoId}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  };
  
  const toggleComments = (videoId: string) => {
    setShowComments(prev => ({ ...prev, [videoId]: !prev[videoId] }));
    
    // Load comments if they don't exist yet
    if (!comments[videoId]) {
      // In a real app, this would fetch comments from the database
      setComments(prev => ({ ...prev, [videoId]: [] }));
    }
  };
  
  const submitComment = (videoId: string) => {
    if (!user) {
      toast.error("Please sign in to comment");
      navigate("/auth");
      return;
    }
    
    if (!newComment.trim()) return;
    
    const newCommentObj: CommentType = {
      id: `new-${Date.now()}`,
      content: newComment,
      userId: user.id,
      videoId,
      createdAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.user_metadata?.name || user.email || "User",
        username: user.email || "user",
        avatar: user.user_metadata?.avatar || "https://ui-avatars.com/api/?name=User&background=random",
        subscribers: 0,
      },
    };
    
    setComments(prev => ({
      ...prev,
      [videoId]: [...(prev[videoId] || []), newCommentObj]
    }));
    
    setNewComment("");
    toast.success("Comment added");
  };
  
  const toggleDescription = (videoId: string) => {
    setDescriptionExpanded(prev => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  return (
    <div className="min-h-screen flex flex-col" ref={containerRef}>
      {/* Videos */}
      <div className="flex flex-col snap-y snap-mandatory w-full">
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="relative h-screen w-full snap-start snap-always flex items-center justify-center bg-black"
          >
            <video
              ref={el => videoRefs.current[index] = el}
              src={video.videoUrl}
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-contain"
            />
            
            {/* Volume Control */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="absolute top-4 right-4 z-20 bg-black/50 text-white hover:bg-black/70 rounded-full"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
            
            {/* Video Info Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white z-10 ${isMobile ? '' : 'max-w-md mx-auto'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {video.user && (
                      <Avatar className="h-8 w-8 border border-white/20">
                        <AvatarImage src={video.user.avatar} alt={video.user.name} />
                        <AvatarFallback>{video.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <p className="font-medium">{video.user?.name}</p>
                      <p className="text-xs text-white/70">
                        {formatNumber(video.views)} views
                      </p>
                    </div>
                  </div>
                  <p className="text-sm mb-2 line-clamp-2">{video.title}</p>
                  
                  <div className="mb-2">
                    <p className={`text-xs text-white/70 ${descriptionExpanded[video.id] ? '' : 'line-clamp-2'}`}>
                      {video.description}
                    </p>
                    {video.description && video.description.length > 100 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleDescription(video.id)}
                        className="text-xs p-1 h-auto text-white/70 hover:text-white hover:bg-transparent"
                      >
                        {descriptionExpanded[video.id] ? 'Show less' : 'Show more'}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col items-center space-y-4 ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-black/30 text-white hover:bg-black/50"
                    onClick={() => handleLike(video.id)}
                  >
                    <Heart className={`h-5 w-5 ${likes[video.id] ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="sr-only">Like</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-black/30 text-white hover:bg-black/50"
                    onClick={() => toggleComments(video.id)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="sr-only">Comment</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-black/30 text-white hover:bg-black/50"
                    onClick={() => handleShare(video.id)}
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">Share</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-black/30 text-white hover:bg-black/50"
                    onClick={() => handleSave(video.id)}
                  >
                    <Bookmark className={`h-5 w-5 ${saved[video.id] ? 'fill-white' : ''}`} />
                    <span className="sr-only">Save</span>
                  </Button>
                </div>
              </div>
              
              {/* Comments Section */}
              {showComments[video.id] && (
                <div className="mt-4 bg-black/50 p-3 rounded-lg max-h-60 overflow-y-auto">
                  <h3 className="text-sm font-medium mb-2">Comments</h3>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.user_metadata?.avatar} />
                      <AvatarFallback><User size={14} /></AvatarFallback>
                    </Avatar>
                    <Textarea 
                      placeholder="Add a comment..." 
                      className="min-h-0 h-8 text-xs"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button size="sm" className="h-8" onClick={() => submitComment(video.id)}>Post</Button>
                  </div>
                  
                  {comments[video.id]?.length === 0 ? (
                    <p className="text-xs text-center text-white/50">No comments yet</p>
                  ) : (
                    <div className="space-y-2">
                      {comments[video.id]?.map((comment) => (
                        <div key={comment.id} className="flex items-start space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.user?.avatar} />
                            <AvatarFallback>{comment.user?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium">{comment.user?.name}</p>
                            <p className="text-xs">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
