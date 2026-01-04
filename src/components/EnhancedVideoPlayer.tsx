import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, 
  Settings, Lock, Unlock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EnhancedVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  videoId: string;
  qualityLevels?: string[];
  defaultQuality?: string;
  onQualityChange?: (quality: string) => void;
}

export function EnhancedVideoPlayer({ 
  src, 
  poster, 
  autoPlay = false,
  videoId,
  qualityLevels = ["360p", "720p", "1080p"],
  defaultQuality = "720p",
  onQualityChange
}: EnhancedVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hideControls, setHideControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState(defaultQuality);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  
  const hideControlsTimer = useRef<NodeJS.Timeout>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Memoize event handlers to prevent unnecessary re-renders
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(console.error);
    }
    
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleProgressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setHideControls(false);
    clearTimeout(hideControlsTimer.current);
    
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying && !isDragging) {
        setHideControls(true);
      }
    }, 3000);
  }, [isPlaying, isDragging]);

  const handleQualityChange = useCallback((quality: string) => {
    setSelectedQuality(quality);
    onQualityChange?.(quality);
    toast.success(`Quality changed to ${quality}`);
  }, [onQualityChange]);

  const trackViewProgress = useCallback(async (currentTime: number) => {
    try {
      await supabase.from('video_views').insert({
        video_id: videoId,
        user_id: user?.id,
        duration_watched: Math.floor(currentTime),
        quality_watched: selectedQuality
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [user, videoId, selectedQuality]);

  // Context menu handlers
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const toggleLoop = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.loop = !isLooping;
      setIsLooping(!isLooping);
      toast.success(isLooping ? "Loop disabled" : "Loop enabled");
    }
    closeContextMenu();
  }, [isLooping, closeContextMenu]);

  const toggleScreenLock = useCallback(() => {
    setIsScreenLocked(!isScreenLocked);
    toast.success(isScreenLocked ? "Screen unlocked" : "Screen locked");
    closeContextMenu();
  }, [isScreenLocked, closeContextMenu]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        closeContextMenu();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu, closeContextMenu]);

  // Optimized effect for video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (user && video.currentTime > 0) {
        trackViewProgress(video.currentTime);
      }
    };
    
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("progress", onProgress);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [trackViewProgress, user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScreenLocked) return;
      if (!playerRef.current?.contains(document.activeElement)) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(prev + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(prev - 0.1, 0));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, toggleMute, toggleFullscreen, isScreenLocked]);

  // Handle progress bar dragging
  const handleProgressMouseDown = () => {
    setIsDragging(true);
    showControlsTemporarily();
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setHideControls(true);
      }, 3000);
    }
  };

  // Calculate progress percentages
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div 
        ref={playerRef}
        className="relative w-full aspect-video rounded-lg overflow-hidden bg-black group"
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => isPlaying && !isDragging && setHideControls(true)}
        onContextMenu={handleContextMenu}
      >
        <video 
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-cover"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Play/Pause overlay */}
        {!isPlaying && !isLoading && (
          <button 
            className="absolute inset-0 w-full h-full flex items-center justify-center z-10 bg-black/20"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 transform hover:scale-105">
              <Play size={30} className="ml-1" />
            </div>
          </button>
        )}
        
        {/* Screen lock indicator */}
        {isScreenLocked && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-2 z-20">
            <Lock size={16} />
            <span className="text-sm">Screen Locked</span>
          </div>
        )}
        
        {/* Controls */}
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 transition-opacity duration-300",
            (isPlaying && hideControls) ? "opacity-0" : "opacity-100",
            isScreenLocked && "pointer-events-none opacity-50"
          )}
        >
          {/* Simple timeline */}
          <div className="relative w-full mb-3 group/slider">
            <div 
              ref={progressRef}
              className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
              onMouseDown={handleProgressMouseDown}
              onMouseUp={handleProgressMouseUp}
              onMouseLeave={handleProgressMouseUp}
            >
              {/* Buffer progress */}
              <div 
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 bg-white/30"
                style={{ width: `${bufferedPercent}%` }}
              ></div>
              
              {/* Current progress */}
              <div 
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-150 ease-out bg-red-600"
                style={{ width: `${progressPercent}%` }}
              ></div>
              
              {/* Progress handle */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-150 ease-out opacity-0 group-hover/slider:opacity-100 bg-white"
                style={{
                  left: `${progressPercent}%`,
                  marginLeft: '-6px',
                }}
              ></div>
            </div>
            
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={togglePlay}
                className="text-white hover:text-white/80 transition p-1 rounded-full hover:bg-white/10"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button 
                onClick={() => seek(-10)}
                className="text-white hover:text-white/80 transition p-1 rounded-full hover:bg-white/10 hidden sm:block"
                aria-label="Rewind 10 seconds"
              >
                <SkipBack size={18} />
              </button>
              
              <button 
                onClick={() => seek(10)}
                className="text-white hover:text-white/80 transition p-1 rounded-full hover:bg-white/10 hidden sm:block"
                aria-label="Forward 10 seconds"
              >
                <SkipForward size={18} />
              </button>
              
              <div className="flex items-center gap-2 group/volume">
                <button 
                  onClick={toggleMute}
                  className="text-white hover:text-white/80 transition p-1 rounded-full hover:bg-white/10"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                
                <div className="w-0 overflow-hidden group-hover/volume:w-20 md:group-hover/volume:w-24 transition-all duration-200">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full appearance-none bg-white/30 rounded-full h-1.5 outline-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ef4444 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 0%)`,
                    }}
                  />
                </div>
              </div>
              
              <div className="text-white text-xs md:text-sm font-medium">
                <span>{formatTime(currentTime)}</span>
                <span className="text-white/70"> / </span>
                <span>{formatTime(duration || 0)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2">
              <Badge variant="secondary" className="text-xs hidden md:inline-flex bg-black/50 text-white">
                {selectedQuality}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full text-white hover:bg-white/20 h-8 w-8"
                    aria-label="Settings"
                  >
                    <Settings size={16} className="text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-black/90 border-gray-700 text-white">
                  <div className="px-2 py-1 text-xs text-gray-400">Quality</div>
                  {qualityLevels.map((quality) => (
                    <DropdownMenuItem 
                      key={quality}
                      onClick={() => handleQualityChange(quality)}
                      className="cursor-pointer flex justify-between"
                    >
                      <span>{quality}</span>
                      {quality === selectedQuality && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <button 
                onClick={toggleFullscreen}
                className="text-white hover:text-white/80 transition p-1 rounded-full hover:bg-white/10"
                aria-label="Fullscreen"
              >
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-black/90 border border-gray-700 rounded-md shadow-lg py-1 w-48"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div 
            className="px-3 py-2 text-sm text-white cursor-pointer hover:bg-gray-800 flex items-center gap-2"
            onClick={toggleLoop}
          >
            <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
              {isLooping && <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
            <span>Loop video</span>
          </div>
          <div 
            className="px-3 py-2 text-sm text-white cursor-pointer hover:bg-gray-800 flex items-center gap-2"
            onClick={toggleScreenLock}
          >
            {isScreenLocked ? <Unlock size={16} /> : <Lock size={16} />}
            <span>{isScreenLocked ? "Unlock screen" : "Lock screen"}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default EnhancedVideoPlayer;