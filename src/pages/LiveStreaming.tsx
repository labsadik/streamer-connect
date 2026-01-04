
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import VideoPlayer from "@/components/VideoPlayer";
import { Info, AlertTriangle, Wifi, Users, User as UserIcon } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { formatNumber } from "@/lib/utils";
import { fetchProfilesForVideos } from "@/lib/supabase-helpers";

export default function LiveStreaming() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liveVideos, setLiveVideos] = useState<Video[]>([]);
  const [featuredStream, setFeaturedStream] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streamers, setStreamers] = useState<User[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  
  // Fetch live streams
  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*, user:user_id(*)')
          .eq('is_live', true)
          .order('views', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Convert from database format to our Video type
          const formattedVideos = await fetchProfilesForVideos(data);
          setLiveVideos(formattedVideos);
          
          if (formattedVideos.length > 0) {
            setFeaturedStream(formattedVideos[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching live streams:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchStreamers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('role', 'user')
          .limit(5);
          
        if (error) throw error;
        
        if (data) {
          // Convert database format to our User type
          const formattedStreamers: User[] = data.map(profile => ({
            id: profile.id,
            name: profile.username || 'Unnamed Creator',
            username: profile.username || 'user',
            avatar: profile.avatar || `https://ui-avatars.com/api/?name=${profile.username || "User"}&background=random`,
            banner: profile.banner,
            about: profile.about,
            subscribers: 0
          }));
          
          setStreamers(formattedStreamers);
        }
      } catch (error) {
        console.error("Error fetching streamers:", error);
      }
    };
    
    fetchLiveStreams();
    fetchStreamers();
    
    // Show content policy warning after 10 minutes
    const warningTimer = setTimeout(() => {
      setShowWarning(true);
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
    
    return () => clearTimeout(warningTimer);
  }, []);
  
  const handleStartStreaming = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    navigate("/upload");
  };
  
  const dismissWarning = () => {
    setShowWarning(false);
  };
  
  const stopUsing = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <Card className="w-11/12 max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive gap-2">
                <AlertTriangle /> Content Policy Warning
              </CardTitle>
              <CardDescription>
                You have been using NoorCast for over 10 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTitle>Please review our Content Policy</AlertTitle>
                <AlertDescription>
                  By continuing to use NoorCast, you agree to adhere to our content policy and guidelines. Failure to do so may result in account suspension.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                We are committed to maintaining a safe and family-friendly environment for all users. Please ensure that all content you view and share aligns with Islamic values.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={stopUsing}>Stop Using</Button>
              <Button onClick={dismissWarning}>Continue</Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      <main className="max-w-screen-2xl mx-auto px-4 md:px-6 pt-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Live Streaming</h1>
          <Button onClick={handleStartStreaming}>Start Streaming</Button>
        </div>
        
        <Tabs defaultValue="live">
          <TabsList className="mb-6">
            <TabsTrigger value="live">Live Now</TabsTrigger>
            <TabsTrigger value="streamers">Streamers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="live">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[30vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spinner"></div>
              </div>
            ) : liveVideos.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Wifi className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Live Streams Available</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  There are currently no active live streams. Check back later or start your own stream!
                </p>
                <Button onClick={handleStartStreaming}>Start Streaming</Button>
              </div>
            ) : (
              <div className="space-y-8">
                {featuredStream && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Featured Stream</h2>
                    <div className="aspect-video relative rounded-lg overflow-hidden">
                      <VideoPlayer src={featuredStream.videoUrl} poster={featuredStream.thumbnail} autoPlay={false} />
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-md">
                          <Wifi size={14} className="animate-pulse" />
                          <span className="text-sm font-medium">LIVE</span>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1 bg-black/60 text-white px-2 py-0.5 rounded-md">
                          <Users size={14} />
                          <span className="text-sm">{formatNumber(featuredStream.views)} watching</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{featuredStream.title}</h3>
                      {featuredStream.user && (
                        <p className="text-sm text-muted-foreground">{featuredStream.user.name}</p>
                      )}
                      <p className="text-sm mt-2 line-clamp-2">{featuredStream.description}</p>
                    </div>
                  </div>
                )}
                
                {liveVideos.length > 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">More Live Streams</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {liveVideos.slice(1).map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="streamers">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Featured Streamers</h2>
              
              {streamers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Streamers Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Be the first to become a NoorCast streamer and share your content!
                  </p>
                  <Button onClick={handleStartStreaming}>Become a Streamer</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {streamers.map((streamer) => (
                    <Card key={streamer.id} className="overflow-hidden">
                      <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/50"></div>
                      <div className="px-4 pb-4 relative">
                        <div className="absolute -top-10 left-4">
                          <div className="w-20 h-20 rounded-full border-4 border-background overflow-hidden">
                            <img
                              src={streamer.avatar || `https://ui-avatars.com/api/?name=${streamer.username}&background=random`}
                              alt={streamer.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="pt-12">
                          <h3 className="text-lg font-semibold">{streamer.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">@{streamer.username}</p>
                          <p className="text-sm mb-4 line-clamp-2">{streamer.about || "No bio available"}</p>
                          <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
