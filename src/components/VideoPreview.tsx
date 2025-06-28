
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Play, Pause, AlertTriangle } from 'lucide-react';

interface VideoPreviewProps {
  rtspUrl: string;
  className?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ rtspUrl, className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use the actual RTSP URL provided
  const getVideoSource = (rtspUrl: string) => {
    return rtspUrl;
  };

  const handlePlayToggle = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setHasError(false);
      
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to play RTSP stream:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [rtspUrl]);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {isPlaying && !hasError ? (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            crossOrigin="anonymous"
          >
            <source src={getVideoSource(rtspUrl)} />
          </video>
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            LIVE
          </div>
          <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded truncate max-w-[80%]">
            {rtspUrl}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          {hasError ? (
            <div className="flex flex-col items-center text-red-400">
              <AlertTriangle className="w-8 h-8 mb-2" />
              <span className="text-xs text-center">RTSP Stream Error</span>
            </div>
          ) : (
            <Camera className="w-8 h-8 text-gray-400" />
          )}
        </div>
      )}
      
      <button
        onClick={handlePlayToggle}
        disabled={isLoading}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200 disabled:opacity-50"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default VideoPreview;
