
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VideoGrid from "@/components/VideoGrid";
import Navbar from "@/components/Navbar";
import { Video } from "@/types";
import { getAllVideos, getTrendingVideos } from "@/lib/data";
import { TrendingUp, Clock, ThumbsUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    loadVideos();
    
    const channel = supabase
      .channel('videos-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos'
        },
        () => {
          loadVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, activeTab, user]);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const [allVideos, trending] = await Promise.all([
        getAllVideos(),
        getTrendingVideos()
      ]);
      
      setVideos(allVideos);
      setTrendingVideos(trending);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterVideos = async () => {
    let filtered = [...videos];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query) ||
          video.user?.name.toLowerCase().includes(query) ||
          video.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    switch (activeTab) {
      case "trending":
        filtered = [...trendingVideos];
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (video) =>
              video.title.toLowerCase().includes(query) ||
              video.description.toLowerCase().includes(query) ||
              video.user?.name.toLowerCase().includes(query)
          );
        }
        break;
      case "recent":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "liked":
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case "following":
        if (user) {
          try {
            const { data: subscriptions } = await supabase
              .from('subscriptions')
              .select('channel_id')
              .eq('subscriber_id', user.id);
            
            if (subscriptions) {
              const followedUserIds = subscriptions.map(sub => sub.channel_id);
              filtered = filtered.filter(video => followedUserIds.includes(video.userId));
            } else {
              filtered = [];
            }
          } catch (error) {
            console.error('Error fetching subscriptions:', error);
            filtered = [];
          }
        } else {
          filtered = [];
        }
        break;
      case "enhanced":
        filtered = filtered.filter(video => video.enhancedQuality);
        break;
      case "shorts":
        filtered = filtered.filter(video => video.isShort);
        break;
      case "live":
        filtered = filtered.filter(video => video.isLive);
        break;
    }

    setFilteredVideos(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar onSearch={setSearchQuery} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar onSearch={setSearchQuery} />
      
      <main className="pt-16 md:pt-20">
          <VideoGrid videos={filteredVideos} />
          
          {filteredVideos.length === 0 && !isLoading && (
            <div className="text-center py-12 md:py-16">
              <div className="space-y-4">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold">No videos found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery 
                    ? `We couldn't find any videos matching "${searchQuery}". Try adjusting your search terms.`
                    : activeTab === "following" && !user
                    ? "Sign in to see videos from creators you follow."
                    : "No videos available in this category at the moment."
                  }
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
                {activeTab === "following" && !user && (
                  <Button 
                    variant="default" 
                    onClick={() => window.location.href = "/auth"}
                    className="mt-4"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
