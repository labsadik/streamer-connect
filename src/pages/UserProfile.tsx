import { useState, useEffect, useRef, memo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Calendar, 
  Video as VideoIcon, 
  Check
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Video } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatNumber, formatDate } from "@/lib/utils";
import { VideoActions } from "@/components/VideoActions";
import { ExpandableText } from "@/components/ExpandableText";
import { ensureUserProfile } from "@/lib/supabase-helpers";

interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  banner?: string;
  about?: string;
  subscriber_count: number;
  video_count: number;
  verified: boolean;
  created_at: string;
}

const VideoCard = memo(({ video, isOwnProfile, onEdit, onDelete }: {
  video: Video;
  isOwnProfile: boolean;
  onEdit: (id: string) => void;
  onDelete: () => void;
}) => {
  return (
    <div className="group animate-fade-in relative">
      <Link to={`/video/${video.id}`} className="block">
        <div className="space-y-2">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {video.duration > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
            {isOwnProfile && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <VideoActions
                  videoId={video.id}
                  videoUrl={video.videoUrl}
                  thumbnailUrl={video.thumbnail || ''}
                  onEdit={() => onEdit(video.id)}
                  onDelete={onDelete}
                />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
              {video.title}
            </h3>
            <div className="flex items-center text-xs text-gray-600 space-x-1">
              <span>{formatNumber(video.views)} views</span>
              <span>•</span>
              <span>{formatDate(video.createdAt)}</span>
            </div>
            <p className="text-sm font-medium text-black dark:text-white truncate">
              {video.user?.name}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
});

VideoCard.displayName = "VideoCard";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [activeTab, setActiveTab] = useState("videos");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSubscribe, setIsLoadingSubscribe] = useState(false);

  const isOwnProfile = currentUser?.id === id;
  const videoChannelRef = useRef<any>(null);
  const subscriptionChannelRef = useRef<any>(null);

  // Cleanup function for realtime channels
  const cleanupRealtime = () => {
    if (videoChannelRef.current) {
      supabase.removeChannel(videoChannelRef.current);
      videoChannelRef.current = null;
    }
    if (subscriptionChannelRef.current) {
      supabase.removeChannel(subscriptionChannelRef.current);
      subscriptionChannelRef.current = null;
    }
  };

  // Refresh videos and update video count
  const refreshVideos = async () => {
    if (!id) return;
    const { data: videosData, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (videosError) {
      console.error("Error refreshing videos:", videosError);
      return;
    }

    const formattedVideos = (videosData || []).map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      videoUrl: video.video_url,
      views: video.views,
      likes: video.likes,
      dislikes: video.dislikes,
      createdAt: video.created_at,
      duration: video.duration,
      isShort: video.is_short,
      isLive: video.is_live,
      qualityLevels: Array.isArray(video.quality_levels) ? video.quality_levels.map(String) : [],
      defaultQuality: video.default_quality,
      tags: video.tags,
      category: video.category,
      userId: video.user_id,
      user: {
        id: profile?.id || id,
        name: profile?.username || 'Unknown User',
        username: profile?.username || 'user',
        avatar: profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || "Unknown")}&background=random`,
        subscribers: subscriberCount
      }
    }));

    setVideos(formattedVideos);
    if (profile) {
      setProfile({ ...profile, video_count: formattedVideos.length });
    }
  };

  // Refresh subscriber count
  const refreshSubscriberCount = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('subscriber_count')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      const newCount = data.subscriber_count || 0;
      setSubscriberCount(newCount);
      if (profile) {
        setProfile({ ...profile, subscriber_count: newCount });
      }
    }
  };

  useEffect(() => {
    if (!id) {
      setError("No profile ID provided");
      setIsLoading(false);
      return;
    }

    const loadProfileAndSubscribe = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await ensureUserProfile(id);
        
        // Load profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileData) {
          setError("Profile not found");
          setIsLoading(false);
          return;
        }

        setProfile(profileData);
        setSubscriberCount(profileData.subscriber_count || 0);

        // Load videos
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false })
          .limit(30);

        const formattedVideos: Video[] = (videosData || []).map(video => ({
          id: video.id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          videoUrl: video.video_url,
          views: video.views,
          likes: video.likes,
          dislikes: video.dislikes,
          createdAt: video.created_at,
          duration: video.duration,
          isShort: video.is_short,
          isLive: video.is_live,
          qualityLevels: Array.isArray(video.quality_levels) ? video.quality_levels.map(String) : [],
          defaultQuality: video.default_quality,
          tags: video.tags,
          category: video.category,
          userId: video.user_id,
          user: {
            id: profileData.id,
            name: profileData.username || 'Unknown User',
            username: profileData.username || 'user',
            avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.username || "Unknown")}&background=random`,
            subscribers: profileData.subscriber_count || 0
          }
        }));

        setVideos(formattedVideos);

        // Check subscription
        if (currentUser && currentUser.id !== id) {
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('subscriber_id', currentUser.id)
            .eq('channel_id', id)
            .maybeSingle();
          setIsSubscribed(!!subscriptionData);
        }

        // ✅ SETUP REALTIME LISTENERS
        cleanupRealtime(); // Clean up any existing

        // Listen to video changes
        videoChannelRef.current = supabase
          .channel(`videos-${id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'videos',
              filter: `user_id=eq.${id}`
            },
            () => refreshVideos()
          )
          .subscribe();

        // Listen to subscription changes
        subscriptionChannelRef.current = supabase
          .channel(`subscriptions-${id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'subscriptions',
              filter: `channel_id=eq.${id}`
            },
            () => refreshSubscriberCount()
          )
          .subscribe();

      } catch (error: any) {
        console.error("Error loading profile:", error);
        setError(error.message || "Failed to load profile");
        toast.error(error.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileAndSubscribe();

    // Cleanup on unmount or id change
    return () => {
      cleanupRealtime();
    };
  }, [id, currentUser]);

  const handleSubscribe = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to subscribe");
      return;
    }
    if (!id) return;
    
    setIsLoadingSubscribe(true);
    try {
      if (isSubscribed) {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('subscriber_id', currentUser.id)
          .eq('channel_id', id);
        if (error) throw error;
        setIsSubscribed(false);
        toast.success("Unsubscribed!");
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert([{ subscriber_id: currentUser.id, channel_id: id }]);
        if (error) throw error;
        setIsSubscribed(true);
        toast.success("Subscribed!");
      }
      // Realtime will auto-update counts, but we can also trigger refresh
      refreshSubscriberCount();
    } catch (error: any) {
      console.error("Error subscribing:", error);
      toast.error("Failed to update subscription");
    } finally {
      setIsLoadingSubscribe(false);
    }
  };

  const handleVideoEdit = (videoId: string) => {
    toast.info("Edit functionality coming soon!");
  };

  const handleVideoDelete = async (videoId: string) => {
    if (!currentUser || !profile) return;
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    setIsLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)
        .eq('user_id', currentUser.id);
      if (deleteError) throw deleteError;
      await refreshVideos();
      toast.success("Video deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete video");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4">{error || "Profile not found"}</h1>
            <p className="text-muted-foreground mb-6">
              {error === "Profile not found" 
                ? "The profile you're looking for doesn't exist or has been removed."
                : "There was an error loading the profile. Please try again later."
              }
            </p>
            <Button asChild>
              <Link to="/">Go back to home</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-16">
        <div className="w-full h-48 bg-gradient-to-r from-red-600 to-red-800 relative overflow-hidden">
          {profile.banner ? (
            <img 
              src={profile.banner} 
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-90"></div>
          )}
        </div>

        <div className="container mx-auto px-4 -mt-16 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
            <div className="relative">
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=random`}
                alt={profile.username}
                className="w-24 h-24 rounded-full border-4 border-background shadow-lg object-cover"
              />
              {profile.verified && (
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center border-2 border-background">
                  <Check className="w-4 h-4 text-red-600" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
                    {profile.username}
                    {profile.verified && <Check className="w-6 h-6 text-red-600" />}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
                    <span className="font-medium">{formatNumber(subscriberCount)} subscribers</span>
                    <span>•</span>
                    <span>{formatNumber(profile.video_count)} videos</span>
                    <span>•</span>
                    <span>Joined {formatDate(profile.created_at)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isOwnProfile && (
                    <Button 
                      onClick={handleSubscribe}
                      variant={isSubscribed ? "outline" : "default"}
                      disabled={isLoadingSubscribe}
                      className="px-6 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isLoadingSubscribe ? (
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-b-2 border-current"></div>
                      ) : isSubscribed ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Subscribed
                        </>
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="videos" 
                  className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:shadow-none rounded-none p-0 pb-3 font-medium text-black dark:text-white"
                >
                  <VideoIcon className="w-4 h-4" />
                  Videos
                </TabsTrigger>
                <TabsTrigger 
                  value="about" 
                  className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:shadow-none rounded-none p-0 pb-3 font-medium text-black dark:text-white"
                >
                  <User className="w-4 h-4" />
                  About
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="videos" className="mt-0">
              {videos.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {videos.map((video) => (
                    <VideoCard 
                      key={video.id} 
                      video={video} 
                      isOwnProfile={isOwnProfile}
                      onEdit={handleVideoEdit}
                      onDelete={() => handleVideoDelete(video.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <VideoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
                  <p className="text-gray-600 mb-4">
                    {isOwnProfile ? "Upload your first video to get started!" : "This user hasn't uploaded any videos yet."}
                  </p>
                  {isOwnProfile && (
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                      <Link to="/upload">Upload Video</Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {profile.about && (
                      <div>
                        <h3 className="font-semibold mb-3 text-lg text-black dark:text-white">Description</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <ExpandableText 
                            text={profile.about} 
                            maxLength={500}
                            className="text-gray-600 dark:text-gray-300"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold mb-4 text-lg text-black dark:text-white">Stats</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{formatNumber(subscriberCount)}</div>
                          <div className="text-sm text-gray-600">Subscribers</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{formatNumber(profile.video_count)}</div>
                          <div className="text-sm text-gray-600">Videos</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{formatNumber(videos.reduce((sum, video) => sum + video.views, 0))}</div>
                          <div className="text-sm text-gray-600">Total Views</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{formatNumber(videos.reduce((sum, video) => sum + video.likes, 0))}</div>
                          <div className="text-sm text-gray-600">Total Likes</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3 text-lg text-black dark:text-white">Details</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatDate(profile.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}