
import { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, 
  Settings, RepeatIcon, CameraIcon, MicIcon, Layers3, Sparkles, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ src, poster, autoPlay = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hideControls, setHideControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAngles, setShowAngles] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false);
  const [gestureControlEnabled, setGestureControlEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [aiQualityEnhancement, setAiQualityEnhancement] = useState(false);
  const [originalQuality, setOriginalQuality] = useState<string>("720p");
  const [enhancedQuality, setEnhancedQuality] = useState<string>("1080p");
  const hideControlsTimer = useRef<NodeJS.Timeout>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    
    if (!video) return;
    
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
    
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("volumechange", onVolumeChange);
    
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    setShowAlert(true);
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    const video = videoRef.current;
    if (video) {
      video.addEventListener('contextmenu', handleContextMenu);
    }
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      if (video) {
        video.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(console.error);
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const seek = (seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setHideControls(false);
    clearTimeout(hideControlsTimer.current);
    
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) {
        setHideControls(true);
      }
    }, 3000);
  };

  const onPlayerMouseMove = () => {
    showControlsTemporarily();
  };

  const toggleCameraAngles = () => {
    setShowAngles(!showAngles);
    if (!showAngles) {
      toast.info("Multiple camera angles available. Click on a thumbnail to switch views.");
    }
  };

  const toggleAISummary = () => {
    setShowAISummary(!showAISummary);
    if (!showAISummary && !aiSummary) {
      setAiSummary("Loading AI summary...");
      setTimeout(() => {
        setAiSummary("This video demonstrates the latest features of the application including the new interface, real-time messaging, and AI-powered recommendations. The presenter discusses how to use these features effectively and suggests best practices.");
      }, 1500);
    }
  };

  const toggleVoiceControl = () => {
    setVoiceControlEnabled(!voiceControlEnabled);
    if (!voiceControlEnabled) {
      toast.success("Voice control enabled. Try saying 'play', 'pause', or 'skip'.");
    } else {
      toast.info("Voice control disabled");
    }
  };

  const toggleGestureControl = () => {
    setGestureControlEnabled(!gestureControlEnabled);
    if (!gestureControlEnabled) {
      toast.success("Gesture control enabled. Use hand gestures to control playback.");
    } else {
      toast.info("Gesture control disabled");
    }
  };

  const toggleAIQualityEnhancement = () => {
    setAiQualityEnhancement(!aiQualityEnhancement);
    if (!aiQualityEnhancement) {
      setEnhancedQuality(getHigherQuality(originalQuality));
      toast.success(`AI Quality Enhancement enabled: ${originalQuality} → ${enhancedQuality}`);
    } else {
      toast.info("AI Quality Enhancement disabled");
    }
  };

  const getHigherQuality = (current: string): string => {
    const qualityLevels = ["240p", "360p", "480p", "720p", "1080p", "1440p", "4K", "8K"];
    const currentIndex = qualityLevels.indexOf(current);
    if (currentIndex >= qualityLevels.length - 1) return current;
    return qualityLevels[currentIndex + 2 > qualityLevels.length - 1 ? qualityLevels.length - 1 : currentIndex + 2];
  };

  return (
    <div 
      ref={playerRef}
      className="relative w-full aspect-video rounded-lg overflow-hidden bg-black group"
      onMouseMove={onPlayerMouseMove}
      onMouseLeave={() => isPlaying && setHideControls(true)}
    >
      {showAlert && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-10/12 max-w-md">
          <Alert variant="default" className="bg-primary/80 text-white border-none shadow-lg">
            <AlertDescription>
              Right-clicking is disabled on this video player
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <video 
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        onClick={() => setIsPlaying(!isPlaying)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      
      {!isPlaying && (
        <button 
          className="absolute inset-0 w-full h-full flex items-center justify-center z-10 bg-black/20"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-black/50 text-white">
            <Play size={24} className="md:w-8 md:h-8 ml-1" />
          </div>
        </button>
      )}
      
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 md:px-4 py-2 transition-opacity duration-300",
          (isPlaying && hideControls) ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="relative w-full my-2 group/slider">
          {/* Enhanced colorful timeline with red and pink gradient */}
          <div className="relative w-full h-2 md:h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600/50 to-gray-400/50 rounded-full"></div>
            
            {/* Progress bar with vibrant red-pink gradient */}
            <div 
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-150 ease-out"
              style={{
                width: `${(currentTime / (duration || 1)) * 100}%`,
                background: 'linear-gradient(90deg, #ef4444 0%, #ec4899 25%, #f97316 50%, #ef4444 75%, #dc2626 100%)',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6), 0 0 16px rgba(236, 72, 153, 0.4)'
              }}
            ></div>
            
            {/* Glowing progress indicator */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-150 ease-out"
              style={{
                left: `${(currentTime / (duration || 1)) * 100}%`,
                marginLeft: '-6px',
                background: 'radial-gradient(circle, #ffffff 0%, #ef4444 50%, #dc2626 100%)',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.8), 0 0 24px rgba(236, 72, 153, 0.6)'
              }}
            ></div>
          </div>
          
          {/* Invisible input for interaction */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              if (videoRef.current) {
                const newTime = parseFloat(e.target.value);
                videoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
              }
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-white/80 transition"
            >
              {isPlaying ? <Pause size={16} className="md:w-5 md:h-5" /> : <Play size={16} className="md:w-5 md:h-5" />}
            </button>
            
            <button 
              onClick={() => {
                if (videoRef.current) {
                  const newTime = Math.max(0, videoRef.current.currentTime - 10);
                  videoRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }
              }}
              className="text-white hover:text-white/80 transition"
            >
              <SkipBack size={14} className="md:w-4 md:h-4" />
            </button>
            
            <button 
              onClick={() => {
                if (videoRef.current) {
                  const newTime = Math.min(duration, videoRef.current.currentTime + 10);
                  videoRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }
              }}
              className="text-white hover:text-white/80 transition"
            >
              <SkipForward size={14} className="md:w-4 md:h-4" />
            </button>
            
            <div className="flex items-center gap-1 md:gap-2 group/volume">
              <button 
                onClick={() => {
                  if (videoRef.current) {
                    const newMuted = !isMuted;
                    videoRef.current.muted = newMuted;
                    setIsMuted(newMuted);
                  }
                }}
                className="text-white hover:text-white/80 transition"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} className="md:w-5 md:h-5" /> : <Volume2 size={16} className="md:w-5 md:h-5" />}
              </button>
              
              <div className="w-0 overflow-hidden group-hover/volume:w-12 md:group-hover/volume:w-20 transition-all duration-200">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    if (videoRef.current) {
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
                    }
                  }}
                  className="w-12 md:w-20 appearance-none bg-white/30 rounded-full h-1 outline-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ef4444 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 0%)`,
                  }}
                />
              </div>
            </div>
            
            {/* Enhanced time display with colorful styling */}
            <div className="text-white text-xs md:text-sm font-medium">
              <span className="text-pink-300">{formatTime(currentTime)}</span>
              <span className="text-white/70"> / </span>
              <span className="text-red-300">{formatTime(duration || 0)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-white hover:bg-white/20 w-6 h-6 md:w-8 md:h-8"
                >
                  <Settings size={14} className="md:w-4 md:h-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-black/90 border-gray-700 text-white">
                <DropdownMenuItem onClick={toggleAIQualityEnhancement} className="flex justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} />
                    <span>AI Quality Enhancement</span>
                  </div>
                  {aiQualityEnhancement && (
                    <Badge className="bg-primary">
                      {originalQuality} → {enhancedQuality}
                    </Badge>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={toggleAISummary} className="flex justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} />
                    <span>AI Summary</span>
                  </div>
                  {showAISummary && <Badge className="bg-primary">On</Badge>}
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={toggleCameraAngles} className="flex justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CameraIcon size={16} />
                    <span>Camera Angles</span>
                  </div>
                  {showAngles && <Badge className="bg-primary">On</Badge>}
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={toggleVoiceControl} className="flex justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MicIcon size={16} />
                    <span>Voice Control</span>
                  </div>
                  {voiceControlEnabled && <Badge className="bg-primary">On</Badge>}
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={toggleGestureControl} className="flex justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Layers3 size={16} />
                    <span>Gesture Control</span>
                  </div>
                  {gestureControlEnabled && <Badge className="bg-primary">On</Badge>}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-gray-700" />
                
                <DropdownMenuItem onClick={() => {
                  if (playerRef.current) {
                    if (!document.fullscreenElement) {
                      playerRef.current.requestFullscreen().catch(console.error);
                    } else {
                      document.exitFullscreen().catch(console.error);
                    }
                  }
                }} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Maximize size={16} />
                    <span>Fullscreen</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {showAISummary && aiSummary && (
        <div className="absolute top-4 left-4 right-4 bg-black/70 p-3 rounded-lg z-20 text-white text-sm">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-primary" />
            <span className="font-medium">AI Summary</span>
          </div>
          <p>{aiSummary}</p>
        </div>
      )}
      
      {showAngles && (
        <div className="absolute top-4 right-4 bg-black/70 p-2 rounded-lg z-20">
          <p className="text-white text-xs mb-2 font-medium">Camera Angles</p>
          <div className="flex flex-col gap-2">
            <button className="relative w-24 h-14 rounded overflow-hidden border-2 border-primary">
              <img src={poster || '/placeholder.svg'} alt="Main angle" className="w-full h-full object-cover" />
              <Badge variant="secondary" className="absolute bottom-0 right-0 text-[10px] py-0 px-1">1</Badge>
            </button>
            <button className="relative w-24 h-14 rounded overflow-hidden border border-white/30 hover:border-white/70">
              <img src={poster || '/placeholder.svg'} alt="Angle 2" className="w-full h-full object-cover" />
              <Badge variant="secondary" className="absolute bottom-0 right-0 text-[10px] py-0 px-1">2</Badge>
            </button>
            <button className="relative w-24 h-14 rounded overflow-hidden border border-white/30 hover:border-white/70">
              <img src={poster || '/placeholder.svg'} alt="Angle 3" className="w-full h-full object-cover" />
              <Badge variant="secondary" className="absolute bottom-0 right-0 text-[10px] py-0 px-1">3</Badge>
            </button>
          </div>
        </div>
      )}
      
      {voiceControlEnabled && (
        <Badge variant="secondary" className="bg-primary/80 text-white">
          <MicIcon size={14} className="mr-1" /> Voice Control Active
        </Badge>
      )}
      
      {gestureControlEnabled && (
        <Badge variant="secondary" className="bg-primary/80 text-white">
          <Layers3 size={14} className="mr-1" /> Gesture Control Active
        </Badge>
      )}
      
      {aiQualityEnhancement && (
        <Badge variant="secondary" className="absolute top-4 right-4 bg-primary/80 text-white">
          <Sparkles size={14} className="mr-1" /> Enhanced: {originalQuality} → {enhancedQuality}
        </Badge>
      )}
    </div>
  );
}

export default VideoPlayer;
