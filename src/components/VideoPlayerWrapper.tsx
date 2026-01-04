
import { useState, useRef, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

interface VideoPlayerWrapperProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  isLooping?: boolean;
  onQualityChange?: (quality: string) => void;
}

export function VideoPlayerWrapper({ 
  src, 
  poster, 
  autoPlay = false,
  isLooping = false,
  onQualityChange
}: VideoPlayerWrapperProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.loop = isLooping;
    }
  }, [isLooping]);
  
  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={isLooping}
        controls
        className="w-full rounded-lg"
      />
    </div>
  );
}

export default VideoPlayerWrapper;
