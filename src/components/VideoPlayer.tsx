import React, { useRef, useEffect, useState } from 'react';
import { Zone, VehicleDetection } from '@/types/monitoring';

interface VideoPlayerProps {
  rtspUrl: string;
  zones: Zone[];
  vehicleDetections: VehicleDetection[];
  isDrawingZone: boolean;
  currentZonePoints: {x: number, y: number}[];
  onVideoClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  isPlaying: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  rtspUrl,
  zones,
  vehicleDetections,
  isDrawingZone,
  currentZonePoints,
  onVideoClick,
  isPlaying
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 800, height: 450 });
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the actual RTSP URL provided
  const getVideoSource = (rtspUrl: string) => {
    return rtspUrl;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setVideoError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (video.videoWidth && video.videoHeight) {
        setVideoDimensions({
          width: video.videoWidth,
          height: video.videoHeight
        });
      }
    };

    const handleError = (e: Event) => {
      setIsLoading(false);
      setVideoError('Failed to load RTSP stream. Please check the URL or ensure your browser supports this stream format.');
      console.error('Video error:', e);
    };

    const handleLoadedMetadata = () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoDimensions({
          width: video.videoWidth,
          height: video.videoHeight
        });
      }
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [rtspUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(e => {
        console.error('Failed to play video:', e);
        setVideoError('Failed to play video stream');
      });
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOverlay = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw existing zones
      zones.forEach(zone => {
        if (zone.points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(zone.points[0].x, zone.points[0].y);
          zone.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.closePath();
          
          // Fill zone with semi-transparent color
          ctx.fillStyle = zone.color + '40';
          ctx.fill();
          
          // Draw zone border
          ctx.strokeStyle = zone.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw zone name at center
          const centerX = zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
          const centerY = zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(zone.name, centerX, centerY);
        }
      });

      // Draw current zone being drawn
      if (isDrawingZone && currentZonePoints.length > 0) {
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        if (currentZonePoints.length > 1) {
          ctx.beginPath();
          ctx.moveTo(currentZonePoints[0].x, currentZonePoints[0].y);
          currentZonePoints.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }

        // Draw points
        currentZonePoints.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#EF4444';
          ctx.fill();
        });
        
        ctx.setLineDash([]);
      }

      // Draw vehicle detections
      vehicleDetections.forEach(vehicle => {
        const { x, y, width, height } = vehicle.boundingBox;
        
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        ctx.fillStyle = '#10B981';
        ctx.fillRect(x, y - 25, 120, 25);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${vehicle.type} (${Math.round(vehicle.confidence * 100)}%)`, x + 2, y - 8);
      });

      requestAnimationFrame(drawOverlay);
    };

    drawOverlay();
  }, [zones, vehicleDetections, isDrawingZone, currentZonePoints]);

  const handleVideoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingZone || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * videoDimensions.width;
    const y = ((event.clientY - rect.top) / rect.height) * videoDimensions.height;

    onVideoClick({
      ...event,
      clientX: x,
      clientY: y
    } as any);
  };

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden cursor-pointer"
        onClick={handleVideoClick}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-white text-lg">Loading RTSP stream...</div>
          </div>
        )}

        {videoError && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-white text-center p-4">
              <div className="text-lg font-semibold mb-2">Stream Error</div>
              <div className="text-sm">{videoError}</div>
              <div className="text-xs mt-2 text-gray-300">
                RTSP URL: {rtspUrl}
              </div>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-auto"
          width={videoDimensions.width}
          height={videoDimensions.height}
          controls={false}
          autoPlay={false}
          muted
          playsInline
          crossOrigin="anonymous"
        >
          <source src={getVideoSource(rtspUrl)} />
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay canvas for zones and detections */}
        <canvas
          ref={canvasRef}
          width={videoDimensions.width}
          height={videoDimensions.height}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {isDrawingZone && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
            Drawing Zone - Click to add points
          </div>
        )}
        
        {!isPlaying && !isLoading && !videoError && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-xl">Paused</div>
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          RTSP: {rtspUrl.slice(0, 30)}...
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
