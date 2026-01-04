
import { supabase } from "@/integrations/supabase/client";
import { Video } from "@/types";

/**
 * Fetches profile data for video creators and formats video data
 */
export async function fetchProfilesForVideos(videos: any[]): Promise<Video[]> {
  if (!videos || videos.length === 0) return [];
  
  // Extract unique user IDs from videos
  const userIds = [...new Set(videos.map(video => video.user_id))];
  
  // Fetch profiles in a single query
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);
  
  // Create a map for quick profile lookup
  const profileMap = new Map();
  if (profilesData) {
    profilesData.forEach(profile => {
      profileMap.set(profile.id, profile);
    });
  }
  
  // Format videos with profile data
  return videos.map(video => {
    const profile = profileMap.get(video.user_id);
    const fallbackUsername = `user_${video.user_id.slice(0, 8)}`;
    const username = profile?.username || fallbackUsername;
    
    return {
      id: video.id,
      title: video.title,
      description: video.description || "",
      thumbnail: video.thumbnail || "",
      videoUrl: video.video_url,
      views: video.views,
      createdAt: video.created_at,
      duration: video.duration || 0,
      userId: video.user_id,
      user: {
        id: profile?.id || video.user_id,
        name: username,
        username: username,
        avatar: profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
        subscribers: profile?.subscriber_count || 0
      },
      likes: video.likes,
      dislikes: video.dislikes,
      isShort: video.is_short,
      isLive: video.is_live
    };
  });
}

/**
 * Save a video to user's saved videos
 */
export async function saveVideo(videoId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: "Not authenticated" };
  
  const { data, error } = await supabase
    .from('saved_videos')
    .insert({
      user_id: user.user.id,
      video_id: videoId
    });
    
  return { data, error };
}

/**
 * Unsave a video from user's saved videos
 */
export async function unsaveVideo(videoId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: "Not authenticated" };
  
  const { data, error } = await supabase
    .from('saved_videos')
    .delete()
    .match({
      user_id: user.user.id,
      video_id: videoId
    });
    
  return { data, error };
}

/**
 * Check if a video is saved by the current user
 */
export async function isVideoSaved(videoId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;
  
  const { data, error } = await supabase
    .from('saved_videos')
    .select('*')
    .match({
      user_id: user.user.id,
      video_id: videoId
    });
    
  return data && data.length > 0;
}

/**
 * Report a video
 */
export async function reportVideo(videoId: string, reason: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: "Not authenticated" };
  
  const { data, error } = await supabase
    .from('video_reports')
    .insert({
      user_id: user.user.id,
      video_id: videoId,
      reason: reason
    });
    
  return { data, error };
}
