import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Share2, Download, Flag, Heart, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { EnhancedVideoPlayer } from "@/components/EnhancedVideoPlayer";
import VideoComments from "@/components/VideoComments";
import Navbar from "@/components/Navbar";
import { Video } from "@/types";
import { getVideoWithUser, getRecentVideos } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatNumber, formatTimeAgo } from "@/lib/utils";

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const videoData = await getVideoWithUser(id);
        setVideo(videoData);
        
        if (user && videoData) {
          // Increment views
          await supabase.rpc('increment_video_views', { video_uuid: id });
          
          // Check if saved
          const { data: savedData } = await supabase
            .from('saved_videos')
            .select('id')
            .eq('video_id', id)
            .eq('user_id', user.id)
            .single();
          setIsSaved(!!savedData);
          
          // Check if liked
          const { data: likedData } = await supabase
            .from('video_likes')
            .select('id')
            .eq('video_id', id)
            .eq('user_id', user.id)
            .single();
          setIsLiked(!!likedData);
        }
        
        // Get likes count
        const { count } = await supabase
          .from('video_likes')
          .select('*', { count: 'exact', head: true })
          .eq('video_id', id);
        setLikesCount(count || 0);
        
        // Get subscription status & count
        if (videoData?.userId) {
          const { count: subCount } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('channel_id', videoData.userId);
          setSubscriberCount(subCount || 0);
          
          if (user) {
            const { data: subData } = await supabase
              .from('subscriptions')
              .select('id')
              .eq('subscriber_id', user.id)
              .eq('channel_id', videoData.userId)
              .single();
            setIsSubscribed(!!subData);
          }
        }
        
        const related = await getRecentVideos();
        setRelatedVideos(related.slice(0, 8));
      } catch (error) {
        console.error("Error fetching video:", error);
        toast.error("Failed to load video");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !id) {
      toast.error("You must be logged in to like videos.");
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        toast.success("Removed like");
      } else {
        // Like
        const { error } = await supabase
          .from('video_likes')
          .insert([{ video_id: id, user_id: user.id }]);
        
        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        toast.success("Liked!");
      }
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like. Please try again.");
    }
  };

  const handleSubscribe = async () => {
    if (!user || !video?.userId) {
      toast.error("You must be logged in to subscribe.");
      return;
    }

    try {
      if (isSubscribed) {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('subscriber_id', user.id)
          .eq('channel_id', video.userId);
        if (error) throw error;
        setIsSubscribed(false);
        setSubscriberCount(prev => Math.max(0, prev - 1));
        toast.success("Unsubscribed!");
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert([{ subscriber_id: user.id, channel_id: video.userId }]);
        if (error) throw error;
        setIsSubscribed(true);
        setSubscriberCount(prev => prev + 1);
        toast.success("Subscribed!");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to update subscription.");
    }
  };

  const handleSave = async () => {
    if (!user || !video || !id) {
      toast.error("You must be logged in to save videos.");
      return;
    }

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_videos')
          .delete()
          .eq('video_id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        setIsSaved(false);
        toast.success("Video unsaved!");
      } else {
        const { error } = await supabase
          .from('saved_videos')
          .insert([{ video_id: id, user_id: user.id }]);
        if (error) throw error;
        setIsSaved(true);
        toast.success("Video saved!");
      }
    } catch (error) {
      console.error("Error saving video:", error);
      toast.error("Failed to save video.");
    }
  };

  const handleShare = () => {
    if (!id) return;
    const shareUrl = `${window.location.origin}/video/${id}`;
    if (navigator.share) {
      navigator.share({ title: video?.title || "Video", url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success("Link copied to clipboard!");
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Video not found</h1>
            <Link to="/" className="text-red-600 hover:underline">Go back home</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-16 md:pt-20">
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-4 md:space-y-6">
              <EnhancedVideoPlayer 
                src={video.videoUrl}
                poster={video.thumbnail}
                videoId={video.id}
                qualityLevels={video.qualityLevels || ["360p", "720p", "1080p"]}
                defaultQuality={video.defaultQuality || "720p"}
                onQualityChange={(q) => {}} // No-op if not used
                autoPlay={false}
              />
              
              <div className="space-y-4">
                <h1 className="text-xl md:text-2xl font-bold">{video.title}</h1>
                
                {/* YouTube-style action bar */}
                <div className="flex flex-wrap items-center gap-1.5 py-3 border-y border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`gap-2 rounded-full ${isLiked ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'}`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{formatNumber(likesCount)}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 text-muted-foreground hover:text-primary">
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </Button>
                  
                  <Button 
                    variant={isSaved ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={handleSave}
                    className="gap-2 text-muted-foreground hover:text-primary"
                  >
                    <Download className="h-5 w-5" />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary ml-auto md:ml-0">
                    <Flag className="h-5 w-5" />
                    <span>Report</span>
                  </Button>
                </div>

                {/* Channel info */}
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Link to={`/profile/${video.user?.id}`} className="flex-shrink-0">
                    <img
                      src={video.user?.avatar}
                      alt={video.user?.name}
                      className="w-12 h-12 rounded-full"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <Link to={`/profile/${video.user?.id}`} className="font-semibold hover:underline">
                          {video.user?.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(subscriberCount)} subscribers
                        </p>
                      </div>
                      {user?.id !== video.userId && (
                        <Button
                          onClick={handleSubscribe}
                          variant={isSubscribed ? "outline" : "default"}
                          size="sm"
                          className="rounded-full"
                        >
                          {isSubscribed ? (
                            <><BellOff className="mr-1.5 h-4 w-4" /> Subscribed</>
                          ) : (
                            <><Bell className="mr-1.5 h-4 w-4" /> Subscribe</>
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="mt-3 text-sm whitespace-pre-line">{video.description}</p>
                  </div>
                </div>

                <VideoComments videoId={video.id} />
              </div>
            </div>

            {/* Related Videos */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Related videos</h2>
              <div className="space-y-4">
                {relatedVideos.map((v) => (
                  <Link key={v.id} to={`/video/${v.id}`} className="flex gap-3 group">
                    <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden">
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {v.duration && (
                        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                          {Math.floor(v.duration / 60)}:{String(v.duration % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-2 text-sm group-hover:text-red-600">
                        {v.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{v.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(v.views)} views</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}