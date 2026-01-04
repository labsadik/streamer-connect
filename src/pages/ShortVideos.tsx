
import { useState, useEffect } from "react";
import ShortVideoFeed from "@/components/ShortVideoFeed";
import { Video } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfilesForVideos } from "@/lib/supabase-helpers";
import { Play, Zap } from "lucide-react";

export default function ShortVideos() {
  const [shortVideos, setShortVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchShortVideos = async () => {
      try {
        setIsLoading(true);
        
        // Fetch videos with is_short flag or with duration <= 90 seconds (1.5 minutes)
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .or('is_short.eq.true,duration.lte.90')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching short videos:", error);
          return;
        }
        
        if (data && data.length > 0) {
          const formattedVideos = await fetchProfilesForVideos(data);
          setShortVideos(formattedVideos);
        }
      } catch (error) {
        console.error("Error in fetchShortVideos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchShortVideos();
    
    // Enable realtime updates for shorts
    const channel = supabase
      .channel('public:videos')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'videos',
        filter: 'is_short=eq.true'
      }, async (payload) => {
        console.log('New short video added:', payload);
        
        // Fetch the new video with user details
        const { data } = await supabase
          .from('videos')
          .select('*')
          .eq('id', payload.new.id)
          .single();
          
        if (data) {
          // Check if it's a short video (is_short flag or duration <= 90 seconds)
          if (data.is_short || (data.duration && data.duration <= 90)) {
            const formattedVideos = await fetchProfilesForVideos([data]);
            setShortVideos(prev => [...formattedVideos, ...prev]);
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen stick-hero">
        <div className="text-center">
          <div className="stick-gradient-bg w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse-glow">
            <Play className="h-8 w-8 text-white" />
          </div>
          <div className="w-12 h-12 border-4 border-stick-primary/20 border-t-stick-primary rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold stick-gradient-text">Loading Shorts...</h3>
          <p className="text-muted-foreground">Preparing your video feed</p>
        </div>
      </div>
    );
  }
  
  if (shortVideos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen stick-hero">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="stick-card p-8">
            <div className="stick-gradient-bg w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Short Videos Available</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to create some exciting short content!
            </p>
            <button className="stick-btn-primary">
              Upload Your First Short
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return <ShortVideoFeed videos={shortVideos} />;
}
