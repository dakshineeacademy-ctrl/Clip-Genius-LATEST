import React, { useRef, useEffect, useState } from 'react';
import { VideoClip, Template, CustomCaptionStyle } from '../types';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface PlayerProps {
  videoUrl: string;
  clip: VideoClip | null;
  template: Template;
  customStyle?: CustomCaptionStyle;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const Player: React.FC<PlayerProps> = ({ videoUrl, clip, template, customStyle, isPlaying, onPlayPause }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCaption, setCurrentCaption] = useState<string>("");

  // Handle Play/Pause commands
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(e => console.error("Play failed", e));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Reset state when clip changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip) return;

    // Initialize to start of clip
    video.currentTime = clip.startTime;
    setCurrentTime(clip.startTime);
    setProgress(0);
    setCurrentCaption("");
    
    // Auto-play is handled by parent setting isPlaying=true, 
    // but if we switch clips while playing, the first effect handles the play() call.
  }, [clip?.id]); // Only run when clip ID changes

  // High-precision Sync Loop (replacing timeupdate)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip) return;

    const animate = () => {
      const now = video.currentTime;
      setCurrentTime(now);

      // 1. Calculate Progress
      const duration = clip.endTime - clip.startTime;
      const elapsed = now - clip.startTime;
      // Clamp between 0 and 100
      const progressPercent = Math.max(0, Math.min(100, (elapsed / duration) * 100));
      setProgress(progressPercent);

      // 2. Loop Logic
      // Check if we passed the end time
      if (now >= clip.endTime) {
        video.currentTime = clip.startTime;
        // Don't return, let the next lines render the start state immediately for smoothness
      }

      // 3. Precise Caption Sync
      const relativeTime = now - clip.startTime;
      
      // Find the caption where the current relative time falls strictly within start/end
      const activeCaption = clip.captions.find(
        c => relativeTime >= c.start && relativeTime <= c.end
      );

      if (activeCaption) {
        setCurrentCaption(activeCaption.text);
      } else {
        setCurrentCaption("");
      }

      // Schedule next frame if playing
      if (isPlaying) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, clip]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Construct inline styles for customization
  const getCustomStyles = (): React.CSSProperties => {
    if (!customStyle) return {};
    
    // Convert hex + opacity to rgba
    const hex = customStyle.backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const rgba = `rgba(${r}, ${g}, ${b}, ${customStyle.bgOpacity / 100})`;

    return {
      color: customStyle.textColor,
      backgroundColor: rgba,
      fontWeight: customStyle.fontWeight,
    };
  };

  return (
    <div className="relative group w-full max-w-[350px] mx-auto aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-dark-700">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        playsInline
        onClick={onPlayPause}
      />

      {/* Captions Overlay */}
      {currentCaption && (
        <div className={`absolute pointer-events-none transition-all duration-75 ${template.containerClass}`}>
          <div 
            className={`${template.textClass}`}
            style={getCustomStyles()} // Apply overrides
          >
            {currentCaption}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-600 rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-brand-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <button onClick={onPlayPause} className="p-2 hover:bg-white/20 rounded-full transition">
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <span className="text-xs font-mono">
             {formatTime(currentTime)} / {clip ? formatTime(clip.endTime) : "0:00"}
          </span>

          <button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded-full transition">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
      
      {/* Play Overlay Button (Center) */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={onPlayPause}
        >
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white">
            <Play size={32} fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;