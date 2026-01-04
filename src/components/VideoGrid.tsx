import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Video } from "@/types";
import { formatNumber, formatTimeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";

interface VideoGridProps {
  videos: Video[];
  className?: string;
}

export default function VideoGrid({ videos, className }: VideoGridProps) {
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [videoStates, setVideoStates] = useState<Record<string, {
    isPlaying: boolean;
    isMuted: boolean;
    currentTime: number;
    duration: number;
    isLoading: boolean;
  }>>({});

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Initialize video states
  useEffect(() => {
    const initialStates: Record<string, any> = {};
    videos.forEach(video => {
      initialStates[video.id] = {
        isPlaying: false,
        isMuted: true,
        currentTime: 0,
        duration: video.duration || 0,
        isLoading: false
      };
    });
    setVideoStates(initialStates);
  }, [videos]);

  // Handle video play/pause
  const handleVideoPlay = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    // Pause all other videos
    Object.keys(videoRefs.current).forEach(id => {
      if (id !== videoId && videoRefs.current[id]) {
        videoRefs.current[id]?.pause();
        setVideoStates(prev => ({
          ...prev,
          [id]: { ...prev[id], isPlaying: false }
        }));
      }
    });

    // Play current video
    setVideoStates(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], isLoading: true }
    }));

    video.play()
      .then(() => {
        setVideoStates(prev => ({
          ...prev,
          [videoId]: { 
            ...prev[videoId], 
            isPlaying: true, 
            isLoading: false 
          }
        }));
      })
      .catch(error => {
        console.error("Error playing video:", error);
        setVideoStates(prev => ({
          ...prev,
          [videoId]: { 
            ...prev[videoId], 
            isPlaying: false, 
            isLoading: false 
          }
        }));
      });
  };

  const handleVideoPause = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    video.pause();
    setVideoStates(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], isPlaying: false }
    }));
  };

  const toggleMute = (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const video = videoRefs.current[videoId];
    if (!video) return;

    const newMutedState = !videoStates[videoId]?.isMuted;
    video.muted = newMutedState;
    
    setVideoStates(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], isMuted: newMutedState }
    }));
  };

  const togglePlayPause = (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (videoStates[videoId]?.isPlaying) {
      handleVideoPause(videoId);
    } else {
      handleVideoPlay(videoId);
    }
  };

  const updateVideoTime = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    setVideoStates(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        currentTime: video.currentTime,
        duration: video.duration || prev[videoId].duration
      }
    }));
  };

  const handleMouseEnter = (videoId: string) => {
    setHoveredVideoId(videoId);
    handleVideoPlay(videoId);
  };

  const handleMouseLeave = (videoId: string) => {
    setHoveredVideoId(null);
    handleVideoPause(videoId);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No videos found</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4",
      // Mobile: 1 column with medium cards
      "grid-cols-1",
      // Small tablets: 2 columns
      "sm:grid-cols-2",
      // Medium screens: 3 columns
      "md:grid-cols-3",
      // Large screens: 4 columns
      "lg:grid-cols-4",
      // Extra large: 5 columns
      "xl:grid-cols-5",
      className
    )}>
      {videos.map((video) => (
        <Link
          key={video.id}
          to={`/video/${video.id}`}
          className="group animate-fade-in block"
          onMouseEnter={() => handleMouseEnter(video.id)}
          onMouseLeave={() => handleMouseLeave(video.id)}
          onTouchStart={() => handleMouseEnter(video.id)}
        >
          <div className="space-y-3">
            {/* Video Thumbnail/Player - Medium size on mobile */}
            <div className="relative pb-[56.25%] rounded-xl overflow-hidden bg-muted">
              {/* Video Element */}
              <video
                ref={el => videoRefs.current[video.id] = el}
                src={video.videoUrl}
                className="absolute top-0 left-0 w-full h-full object-cover"
                muted={videoStates[video.id]?.isMuted}
                loop
                playsInline
                onTimeUpdate={() => updateVideoTime(video.id)}
                onLoadedMetadata={() => updateVideoTime(video.id)}
              />
              
              {/* Fallback Image */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className={cn(
                  "absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300",
                  hoveredVideoId === video.id ? "opacity-0" : "opacity-100"
                )}
                loading="lazy"
              />
              
              {/* Loading Indicator */}
              {videoStates[video.id]?.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
              
              {/* Controls Overlay */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300",
                hoveredVideoId === video.id ? "opacity-100" : ""
              )}>
                {/* Play/Pause */}
                <button
                  onClick={(e) => togglePlayPause(video.id, e)}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
                >
                  {videoStates[video.id]?.isPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white ml-1" />
                  )}
                </button>
                
                {/* Mute Button */}
                <button
                  onClick={(e) => toggleMute(video.id, e)}
                  className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full p-2 hover:bg-black/80 transition-colors"
                >
                  {videoStates[video.id]?.isMuted ? (
                    <VolumeX className="h-4 w-4 text-white" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-white" />
                  )}
                </button>
                
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                  <div 
                    className="h-full bg-red-600"
                    style={{
                      width: `${videoStates[video.id]?.currentTime && videoStates[video.id]?.duration 
                        ? (videoStates[video.id].currentTime / videoStates[video.id].duration) * 100 
                        : 0}%`
                    }}
                  />
                </div>
                
                {/* Time Display */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-sm font-medium text-white">
                  {formatDuration(videoStates[video.id]?.currentTime || 0)} / {formatDuration(videoStates[video.id]?.duration || video.duration || 0)}
                </div>
              </div>
              
              {/* Duration Badge */}
              {video.duration > 0 && (
                <div className={cn(
                  "absolute bottom-3 right-3 bg-black/80 text-white text-sm px-2 py-1 rounded font-medium",
                  hoveredVideoId === video.id ? "opacity-0" : "opacity-100"
                )}>
                  {formatDuration(video.duration)}
                </div>
              )}
              
              {/* Quality Badge */}
              {video.enhancedQuality && (
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-sm px-2 py-1 rounded font-medium">
                  {video.enhancedQuality}
                </div>
              )}
              
              {/* Live Indicator */}
              {video.isLive && (
                <div className="absolute top-3 right-3 bg-red-600 text-white text-sm px-3 py-1 rounded-full font-bold animate-pulse">
                  LIVE
                </div>
              )}
              
              {/* Short Indicator */}
              {video.isShort && (
                <div className="absolute top-3 left-3 bg-purple-600 text-white text-sm px-3 py-1 rounded-full font-bold">
                  SHORT
                </div>
              )}
            </div>

            {/* Video Info - Larger text like YouTube */}
            <div className="space-y-2">
              <div className="flex gap-3">
                {/* Channel Avatar */}
                <Link
                  to={`/profile/${video.user?.id}`}
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={video.user?.avatar}
                    alt={video.user?.name}
                    className="w-10 h-10 rounded-full hover:scale-105 transition-transform"
                  />
                </Link>

                {/* Title and Metadata */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
                    {video.title}
                  </h3>
                  
                  <div className="mt-1 space-y-1">
                    <Link
                      to={`/profile/${video.user?.id}`}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors line-clamp-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {video.user?.name}
                    </Link>
                    
                    <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-1 gap-y-0.5">
                      <span className="font-medium">{formatNumber(video.views)} views</span>
                      <span>•</span>
                      <span>{formatTimeAgo(new Date(video.createdAt))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}