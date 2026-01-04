
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import VideoGrid from "@/components/VideoGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Video } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfilesForVideos, ensureUserProfile } from "@/lib/supabase-helpers";

export default function SavedVideos() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    const fetchSavedVideos = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching saved videos for user:", user.id);
        
        // Ensure user profile exists
        await ensureUserProfile(user.id, { email: user.email });
        
        // First get saved video IDs
        const { data: savedData, error: savedError } = await supabase
          .from('saved_videos')
          .select('video_id')
          .eq('user_id', user.id);
        
        if (savedError) {
          console.error("Error fetching saved videos:", savedError);
          setIsLoading(false);
          return;
        }
        
        console.log("Saved video IDs:", savedData?.length || 0);
        
        if (!savedData || savedData.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Extract video IDs
        const videoIds = savedData.map(item => item.video_id);
        
        // Fetch the actual videos
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .in('id', videoIds);
        
        if (videosError) {
          console.error("Error fetching video details:", videosError);
          setIsLoading(false);
          return;
        }
        
        console.log("Video details fetched:", videosData?.length || 0);
        
        if (videosData && videosData.length > 0) {
          // Format videos with profiles
          const formattedVideos = await fetchProfilesForVideos(videosData);
          console.log("Formatted videos:", formattedVideos.length);
          setSavedVideos(formattedVideos);
        }
      } catch (error) {
        console.error("Error in fetchSavedVideos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedVideos();
  }, [user, authLoading, navigate]);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold mb-6">Saved Videos</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : savedVideos.length > 0 ? (
          <VideoGrid videos={savedVideos} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You haven't saved any videos yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
