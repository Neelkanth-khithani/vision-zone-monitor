

// // // import React, { useRef, useEffect, useState, useCallback } from 'react';
// // // import Hls from 'hls.js';
// // // import { Zone, VehicleDetection } from '@/types/monitoring';

// // // interface VideoPlayerProps {
// // //   rtspUrl: string;
// // //   zones: Zone[];
// // //   vehicleDetections: VehicleDetection[];
// // //   isDrawingZone: boolean;
// // //   currentZonePoints: { x: number; y: number }[];
// // //   onVideoClick: (event: React.MouseEvent<HTMLDivElement>) => void;
// // // }

// // // const VideoPlayer: React.FC<VideoPlayerProps> = ({
// // //   rtspUrl,
// // //   zones,
// // //   vehicleDetections,
// // //   isDrawingZone,
// // //   currentZonePoints,
// // //   onVideoClick
// // // }) => {
// // //   const videoRef = useRef<HTMLVideoElement>(null);
// // //   const canvasRef = useRef<HTMLCanvasElement>(null);
// // //   const hlsRef = useRef<Hls | null>(null);
// // //   const [isLoading, setIsLoading] = useState(true);
// // //   const [error, setError] = useState<string>('');
// // //   const [videoReady, setVideoReady] = useState(false);
// // //   const [retryCount, setRetryCount] = useState(0);
// // //   const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
// // //   const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
// // //   const [videoOffset, setVideoOffset] = useState({ x: 0, y: 0 });
// // //   const animationFrameRef = useRef<number | null>(null);

// // //   const MAX_RETRIES = 5;
// // //   const RETRY_DELAY = 2000;

// // //   // Function to calculate and set video and canvas dimensions/offsets
// // //   const calculateVideoAndCanvasDimensions = useCallback(() => {
// // //     const video = videoRef.current;
// // //     const canvas = canvasRef.current;
// // //     if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return;

// // //     const videoAspectRatio = video.videoWidth / video.videoHeight;
// // //     const containerWidth = video.clientWidth;
// // //     const containerHeight = video.clientHeight;
// // //     const containerAspectRatio = containerWidth / containerHeight;

// // //     let actualVideoWidth = containerWidth;
// // //     let actualVideoHeight = containerHeight;
// // //     let offsetX = 0;
// // //     let offsetY = 0;

// // //     if (videoAspectRatio > containerAspectRatio) {
// // //       actualVideoHeight = containerWidth / videoAspectRatio;
// // //       offsetY = (containerHeight - actualVideoHeight) / 2;
// // //     } else {
// // //       actualVideoWidth = containerHeight * videoAspectRatio;
// // //       offsetX = (containerWidth - actualVideoWidth) / 2;
// // //     }

// // //     setVideoDimensions({ width: actualVideoWidth, height: actualVideoHeight });
// // //     setVideoOffset({ x: offsetX, y: offsetY });

// // //     canvas.width = actualVideoWidth;
// // //     canvas.height = actualVideoHeight;
// // //     canvas.style.left = `${offsetX}px`;
// // //     canvas.style.top = `${offsetY}px`;
// // //   }, []);

// // //   // Enhanced click handler that properly converts coordinates
// // //   const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
// // //     if (!isDrawingZone) return;

// // //     const canvas = canvasRef.current;
// // //     if (!canvas) return;

// // //     const rect = canvas.getBoundingClientRect();
// // //     const x = event.clientX - rect.left;
// // //     const y = event.clientY - rect.top;

// // //     // Create a synthetic event for the parent component
// // //     const syntheticEvent = {
// // //       ...event,
// // //       currentTarget: {
// // //         ...event.currentTarget,
// // //         getBoundingClientRect: () => ({
// // //           left: rect.left,
// // //           top: rect.top,
// // //           width: rect.width,
// // //           height: rect.height,
// // //           right: rect.right,
// // //           bottom: rect.bottom,
// // //           x: rect.x,
// // //           y: rect.y
// // //         })
// // //       }
// // //     } as React.MouseEvent<HTMLDivElement>;

// // //     onVideoClick(syntheticEvent);
// // //   }, [isDrawingZone, onVideoClick]);

// // //   useEffect(() => {
// // //     const video = videoRef.current;
// // //     if (!video || !rtspUrl) return;

// // //     setIsLoading(true);
// // //     setError('');
// // //     setVideoReady(false);

// // //     if (hlsRef.current) {
// // //       hlsRef.current.destroy();
// // //       hlsRef.current = null;
// // //     }

// // //     if (retryTimeoutRef.current) {
// // //       clearTimeout(retryTimeoutRef.current);
// // //       retryTimeoutRef.current = null;
// // //     }

// // //     if (Hls.isSupported()) {
// // //       const hls = new Hls({
// // //         enableWorker: false,
// // //         lowLatencyMode: true,
// // //         // Reduced buffer sizes to prevent buffer full errors
// // //         backBufferLength: 10,
// // //         maxBufferLength: 20,
// // //         maxMaxBufferLength: 30,
// // //         maxBufferSize: 20 * 1000 * 1000, // 20MB instead of 60MB
// // //         maxBufferHole: 0.5,
// // //         highBufferWatchdogPeriod: 1,
// // //         nudgeOffset: 0.1,
// // //         nudgeMaxRetry: 3,
// // //         maxFragLookUpTolerance: 0.25,
// // //         liveSyncDurationCount: 2, // Reduced from 3
// // //         liveMaxLatencyDurationCount: 5, // Reduced from 10
// // //         fragLoadingTimeOut: 15000, // Reduced from 20000
// // //         fragLoadingMaxRetry: 4, // Reduced from 6
// // //         fragLoadingRetryDelay: 500, // Reduced from 1000
// // //         fragLoadingMaxRetryTimeout: 32000, // Reduced from 64000
// // //         maxStarvationDelay: 2, // Reduced from 4
// // //         maxLoadingDelay: 2, // Reduced from 4
// // //         startLevel: -1,
// // //         capLevelToPlayerSize: true, // Enable to reduce quality if needed
// // //         manifestLoadingTimeOut: 8000, // Reduced from 10000
// // //         manifestLoadingMaxRetry: 4, // Reduced from 6
// // //         manifestLoadingRetryDelay: 500, // Reduced from 1000
// // //         levelLoadingTimeOut: 8000, // Reduced from 10000
// // //         levelLoadingMaxRetry: 4, // Reduced from 6
// // //         levelLoadingRetryDelay: 500, // Reduced from 1000
// // //       });

// // //       hlsRef.current = hls;

// // //       hls.on(Hls.Events.MEDIA_ATTACHED, () => {
// // //         console.log('HLS: Media attached');
// // //       });

// // //       hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
// // //         console.log('HLS: Manifest parsed, levels:', data.levels);
// // //         setIsLoading(false);
// // //         setRetryCount(0);
// // //         video.play().catch(console.error);
// // //       });

// // //       hls.on(Hls.Events.LEVEL_LOADED, () => {
// // //         if (!videoReady) {
// // //           setVideoReady(true);
// // //         }
// // //       });

// // //       hls.on(Hls.Events.FRAG_LOADED, () => {
// // //         if (error) {
// // //           setError('');
// // //         }
// // //       });

// // //       // Enhanced buffer management
// // //       hls.on(Hls.Events.BUFFER_FULL, () => {
// // //         console.log('Buffer full, attempting to free space...');
// // //         try {
// // //           // Try to remove old buffered data
// // //           const currentTime = video.currentTime;
// // //           if (currentTime > 10) {
// // //             // Remove data older than 5 seconds
// // //             hls.trigger(Hls.Events.BUFFER_FLUSHING, {
// // //               startOffset: 0,
// // //               endOffset: currentTime - 5,
// // //               type: 'video'
// // //             });
// // //           }
// // //         } catch (e) {
// // //           console.warn('Failed to flush buffer:', e);
// // //         }
// // //       });

// // //       hls.on(Hls.Events.ERROR, (event, data) => {
// // //         console.log('HLS Error:', data);

// // //         // Handle buffer full errors specifically
// // //         if (data.details === 'bufferFullError') {
// // //           console.log('Buffer full error detected, attempting recovery...');
// // //           try {
// // //             const currentTime = video.currentTime;
// // //             // More aggressive buffer cleanup for buffer full errors
// // //             hls.trigger(Hls.Events.BUFFER_FLUSHING, {
// // //               startOffset: 0,
// // //               endOffset: currentTime - 2,
// // //               type: 'video'
// // //             });
// // //             // Also try to flush audio buffer
// // //             hls.trigger(Hls.Events.BUFFER_FLUSHING, {
// // //               startOffset: 0,
// // //               endOffset: currentTime - 2,
// // //               type: 'audio'
// // //             });
// // //           } catch (e) {
// // //             console.warn('Failed to recover from buffer full error:', e);
// // //           }
// // //           return; // Don't treat as fatal error
// // //         }

// // //         if (data.fatal) {
// // //           console.error('Fatal HLS Error:', data);
// // //           setError(`Fatal Error: ${data.details}`);
// // //           setIsLoading(false);

// // //           switch (data.type) {
// // //             case Hls.ErrorTypes.NETWORK_ERROR:
// // //               console.log('Network error, trying to recover...');
// // //               if (retryCount < MAX_RETRIES) {
// // //                 setRetryCount(prev => prev + 1);
// // //                 retryTimeoutRef.current = setTimeout(() => {
// // //                   hls.startLoad();
// // //                 }, RETRY_DELAY);
// // //               } else {
// // //                 setError('Network error: Unable to connect to stream after multiple attempts');
// // //               }
// // //               break;
// // //             case Hls.ErrorTypes.MEDIA_ERROR:
// // //               console.log('Media error, trying to recover...');
// // //               hls.recoverMediaError();
// // //               break;
// // //             default:
// // //               console.log('Other fatal error, destroying HLS...');
// // //               hls.destroy();
// // //               break;
// // //           }
// // //         } else {
// // //           switch (data.details) {
// // //             case 'fragGap':
// // //               console.log('Fragment gap detected, this is normal for live streams starting up');
// // //               break;
// // //             case 'fragLoadError':
// // //               console.log('Fragment load error, HLS will retry automatically');
// // //               break;
// // //             case 'fragLoadTimeOut':
// // //               console.log('Fragment load timeout, retrying...');
// // //               break;
// // //             case 'levelLoadError':
// // //               console.log('Level load error, retrying...');
// // //               if (retryCount < MAX_RETRIES) {
// // //                 setRetryCount(prev => prev + 1);
// // //                 retryTimeoutRef.current = setTimeout(() => {
// // //                   hls.startLoad();
// // //                 }, RETRY_DELAY);
// // //               }
// // //               break;
// // //             default:
// // //               console.log('Non-fatal HLS error:', data.details);
// // //               if (!['fragGap', 'fragLoadError', 'fragLoadTimeOut', 'bufferFullError'].includes(data.details)) {
// // //                 setError(`Stream Error: ${data.details}`);
// // //               }
// // //               break;
// // //           }
// // //         }
// // //       });

// // //       hls.attachMedia(video);
// // //       hls.loadSource(rtspUrl);

// // //     } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
// // //       video.src = rtspUrl;
// // //       video.addEventListener('loadedmetadata', () => {
// // //         setIsLoading(false);
// // //         setVideoReady(true);
// // //         setRetryCount(0);
// // //         video.play().catch(console.error);
// // //       });
// // //       video.addEventListener('error', () => {
// // //         setError('Failed to load video stream');
// // //         setIsLoading(false);
// // //       });
// // //     } else {
// // //       setError('HLS is not supported in this browser');
// // //       setIsLoading(false);
// // //     }

// // //     const handleLoadStart = () => setIsLoading(true);
// // //     const handleCanPlay = () => {
// // //       setIsLoading(false);
// // //       setVideoReady(true);
// // //       calculateVideoAndCanvasDimensions();
// // //     };
// // //     const handleError = () => {
// // //       setError('Video playback error');
// // //       setIsLoading(false);
// // //     };
// // //     const handleWaiting = () => {
// // //       console.log('Video is buffering...');
// // //     };
// // //     const handlePlaying = () => {
// // //       console.log('Video is playing');
// // //       if (error && error.includes('Stream Error')) {
// // //         setError('');
// // //       }
// // //     };

// // //     video.addEventListener('loadstart', handleLoadStart);
// // //     video.addEventListener('canplay', handleCanPlay);
// // //     video.addEventListener('error', handleError);
// // //     video.addEventListener('waiting', handleWaiting);
// // //     video.addEventListener('playing', handlePlaying);
// // //     video.addEventListener('loadedmetadata', calculateVideoAndCanvasDimensions);
// // //     window.addEventListener('resize', calculateVideoAndCanvasDimensions);

// // //     return () => {
// // //       if (hlsRef.current) {
// // //         hlsRef.current.destroy();
// // //         hlsRef.current = null;
// // //       }
// // //       if (retryTimeoutRef.current) {
// // //         clearTimeout(retryTimeoutRef.current);
// // //         retryTimeoutRef.current = null;
// // //       }
// // //       video.removeEventListener('loadstart', handleLoadStart);
// // //       video.removeEventListener('canplay', handleCanPlay);
// // //       video.removeEventListener('error', handleError);
// // //       video.removeEventListener('waiting', handleWaiting);
// // //       video.removeEventListener('playing', handlePlaying);
// // //       video.removeEventListener('loadedmetadata', calculateVideoAndCanvasDimensions);
// // //       window.removeEventListener('resize', calculateVideoAndCanvasDimensions);
// // //     };
// // //   }, [rtspUrl, calculateVideoAndCanvasDimensions]);

// // //   // Enhanced drawing effect with proper cleanup
// // //   useEffect(() => {
// // //     const canvas = canvasRef.current;
// // //     const video = videoRef.current;
// // //     if (!canvas || !video || !videoReady || videoDimensions.width === 0) return;

// // //     const ctx = canvas.getContext('2d');
// // //     if (!ctx) return;

// // //     const drawOverlay = () => {
// // //       // Clear the entire canvas
// // //       ctx.clearRect(0, 0, canvas.width, canvas.height);

// // //       // Save context state
// // //       ctx.save();

// // //       // Draw existing zones
// // //       zones.forEach(zone => {
// // //         if (zone.points.length < 3) return;

// // //         ctx.beginPath();
// // //         ctx.moveTo(zone.points[0].x, zone.points[0].y);
// // //         zone.points.slice(1).forEach(point => {
// // //           ctx.lineTo(point.x, point.y);
// // //         });
// // //         ctx.closePath();

// // //         // Fill zone
// // //         ctx.fillStyle = zone.color + '33';
// // //         ctx.fill();

// // //         // Stroke zone border
// // //         ctx.strokeStyle = zone.color;
// // //         ctx.lineWidth = 2;
// // //         ctx.stroke();

// // //         // Draw zone label
// // //         const minX = Math.min(...zone.points.map(p => p.x));
// // //         const minY = Math.min(...zone.points.map(p => p.y));
// // //         const maxX = Math.max(...zone.points.map(p => p.x));
// // //         const maxY = Math.max(...zone.points.map(p => p.y));
// // //         const labelX = (minX + maxX) / 2;
// // //         const labelY = (minY + maxY) / 2;

// // //         ctx.fillStyle = zone.color;
// // //         ctx.font = 'bold 14px Arial';
// // //         ctx.textAlign = 'center';
// // //         ctx.textBaseline = 'middle';

// // //         // Add text background for better visibility
// // //         const textMetrics = ctx.measureText(zone.name);
// // //         const textWidth = textMetrics.width;
// // //         const textHeight = 16;

// // //         ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
// // //         ctx.fillRect(labelX - textWidth/2 - 4, labelY - textHeight/2 - 2, textWidth + 8, textHeight + 4);

// // //         ctx.fillStyle = zone.color;
// // //         ctx.fillText(zone.name, labelX, labelY);
// // //       });

// // //       // Draw current zone being drawn
// // //       if (isDrawingZone && currentZonePoints.length > 0) {
// // //         ctx.strokeStyle = '#00ff00';
// // //         ctx.lineWidth = 3;
// // //         ctx.fillStyle = '#00ff0033';
// // //         ctx.setLineDash([5, 5]); // Dashed line for current zone

// // //         if (currentZonePoints.length === 1) {
// // //           // Draw single point
// // //           ctx.beginPath();
// // //           ctx.arc(currentZonePoints[0].x, currentZonePoints[0].y, 4, 0, 2 * Math.PI);
// // //           ctx.fillStyle = '#00ff00';
// // //           ctx.fill();
// // //         } else {
// // //           // Draw lines between points
// // //           ctx.beginPath();
// // //           ctx.moveTo(currentZonePoints[0].x, currentZonePoints[0].y);
// // //           currentZonePoints.slice(1).forEach(point => {
// // //             ctx.lineTo(point.x, point.y);
// // //           });

// // //           if (currentZonePoints.length > 2) {
// // //             ctx.closePath();
// // //             ctx.fill();
// // //           }
// // //           ctx.stroke();

// // //           // Draw points
// // //           currentZonePoints.forEach((point, index) => {
// // //             ctx.beginPath();
// // //             ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
// // //             ctx.fillStyle = index === 0 ? '#ff0000' : '#00ff00'; // First point in red
// // //             ctx.fill();
// // //             ctx.strokeStyle = '#ffffff';
// // //             ctx.lineWidth = 1;
// // //             ctx.stroke();
// // //           });
// // //         }

// // //         ctx.setLineDash([]); // Reset line dash
// // //       }

// // //       // Draw vehicle detections
// // //       vehicleDetections.forEach(detection => {
// // //         const scaleX = videoDimensions.width / (video.videoWidth || 1);
// // //         const scaleY = videoDimensions.height / (video.videoHeight || 1);

// // //         const x = detection.x * scaleX;
// // //         const y = detection.y * scaleY;
// // //         const width = detection.width * scaleX;
// // //         const height = detection.height * scaleY;

// // //         // Draw detection box
// // //         ctx.strokeStyle = '#ff0000';
// // //         ctx.lineWidth = 3;
// // //         ctx.strokeRect(x, y, width, height);

// // //         // Draw label background
// // //         ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
// // //         const label = `Vehicle ${detection.confidence.toFixed(2)}`;
// // //         ctx.font = '12px Arial';
// // //         const labelWidth = ctx.measureText(label).width;
// // //         ctx.fillRect(x, y - 20, labelWidth + 8, 18);

// // //         // Draw label text
// // //         ctx.fillStyle = '#ffffff';
// // //         ctx.fillText(label, x + 4, y - 6);
// // //       });

// // //       // Restore context state
// // //       ctx.restore();
// // //     };

// // //     // Use requestAnimationFrame for smooth updates
// // //     const animate = () => {
// // //       drawOverlay();
// // //       animationFrameRef.current = requestAnimationFrame(animate);
// // //     };

// // //     animationFrameRef.current = requestAnimationFrame(animate);

// // //     return () => {
// // //       if (animationFrameRef.current) {
// // //         cancelAnimationFrame(animationFrameRef.current);
// // //         animationFrameRef.current = null;
// // //       }
// // //     };
// // //   }, [zones, vehicleDetections, isDrawingZone, currentZonePoints, videoReady, videoDimensions, videoOffset]);

// // //   const getStatusMessage = () => {
// // //     if (isLoading) return 'Loading stream...';
// // //     if (error) return error;
// // //     if (retryCount > 0) return `Retrying connection... (${retryCount}/${MAX_RETRIES})`;
// // //     return null;
// // //   };

// // //   return (
// // //     <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
// // //       <video
// // //         ref={videoRef}
// // //         className="w-full h-full object-contain"
// // //         controls={false}
// // //         muted
// // //         playsInline
// // //         onContextMenu={(e) => e.preventDefault()}
// // //       />

// // //       <canvas
// // //         ref={canvasRef}
// // //         className="absolute cursor-crosshair"
// // //         onClick={handleCanvasClick}
// // //         style={{ pointerEvents: isDrawingZone ? 'auto' : 'none' }}
// // //       />

// // //       {(isLoading || error || retryCount > 0) && (
// // //         <div className="absolute inset-0 flex items-center justify-center bg-black/50">
// // //           <div className="text-white text-center">
// // //             {isLoading && (
// // //               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
// // //             )}
// // //             <p className={error ? 'text-red-400' : 'text-white'}>
// // //               {getStatusMessage()}
// // //             </p>
// // //             {retryCount > 0 && (
// // //               <p className="text-sm text-gray-400 mt-1">
// // //                 Stream may take a moment to stabilize...
// // //               </p>
// // //             )}
// // //           </div>
// // //         </div>
// // //       )}

// // //       {videoReady && !error && (
// // //         <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
// // //           Live
// // //           {retryCount > 0 && (
// // //             <span className="ml-2 text-yellow-400">
// // //               (Reconnecting...)
// // //             </span>
// // //           )}
// // //         </div>
// // //       )}

// // //       {/* Zone drawing instructions */}
// // //       {isDrawingZone && (
// // //         <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-3 py-2 rounded">
// // //           <p>Click to add points • {currentZonePoints.length} points added</p>
// // //           <p className="text-green-400">Need at least 3 points to create zone</p>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default VideoPlayer;

// // // import React, { useRef, useEffect, useState, useCallback } from 'react';
// // // import Hls from 'hls.js';
// // // import { Zone, VehicleDetection } from '@/types/monitoring';

// // // interface VideoPlayerProps {
// // //   rtspUrl: string;
// // //   zones: Zone[];
// // //   vehicleDetections: VehicleDetection[];
// // //   isDrawingZone: boolean;
// // //   currentZonePoints: { x: number; y: number }[];
// // //   // Change the type of the event to come from HTMLCanvasElement
// // //   onVideoClick: (event: React.MouseEvent<HTMLCanvasElement>) => void; 
// // // }

// // // const VideoPlayer: React.FC<VideoPlayerProps> = ({
// // //   rtspUrl,
// // //   zones,
// // //   vehicleDetections,
// // //   isDrawingZone,
// // //   currentZonePoints,
// // //   onVideoClick
// // // }) => {
// // //   const videoRef = useRef<HTMLVideoElement>(null);
// // //   const canvasRef = useRef<HTMLCanvasElement>(null);
// // //   const hlsRef = useRef<Hls | null>(null);
// // //   const [isLoading, setIsLoading] = useState(true);
// // //   const [error, setError] = useState<string>('');
// // //   const [videoReady, setVideoReady] = useState(false);
// // //   const [retryCount, setRetryCount] = useState(0);
// // //   const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
// // //   const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
// // //   const [videoOffset, setVideoOffset] = useState({ x: 0, y: 0 });
// // //   const animationFrameRef = useRef<number | null>(null);

// // //   const MAX_RETRIES = 5;
// // //   const RETRY_DELAY = 2000;

// // //   // Function to calculate and set video and canvas dimensions/offsets
// // //   const calculateVideoAndCanvasDimensions = useCallback(() => {
// // //     const video = videoRef.current;
// // //     const canvas = canvasRef.current;
// // //     if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return;

// // //     const videoAspectRatio = video.videoWidth / video.videoHeight;
// // //     const containerWidth = video.clientWidth;
// // //     const containerHeight = video.clientHeight;
// // //     const containerAspectRatio = containerWidth / containerHeight;

// // //     let actualVideoWidth = containerWidth;
// // //     let actualVideoHeight = containerHeight;
// // //     let offsetX = 0;
// // //     let offsetY = 0;

// // //     if (videoAspectRatio > containerAspectRatio) {
// // //       actualVideoHeight = containerWidth / videoAspectRatio;
// // //       offsetY = (containerHeight - actualVideoHeight) / 2;
// // //     } else {
// // //       actualVideoWidth = containerHeight * videoAspectRatio;
// // //       offsetX = (containerWidth - actualVideoWidth) / 2;
// // //     }

// // //     setVideoDimensions({ width: actualVideoWidth, height: actualVideoHeight });
// // //     setVideoOffset({ x: offsetX, y: offsetY });

// // //     canvas.width = actualVideoWidth;
// // //     canvas.height = actualVideoHeight;
// // //     canvas.style.left = `${offsetX}px`;
// // //     canvas.style.top = `${offsetY}px`;
// // //   }, []);

// // //   // Enhanced click handler that properly converts coordinates
// // //   const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
// // //     if (!isDrawingZone) return;

// // //     const canvas = canvasRef.current;
// // //     if (!canvas) return;

// // //     const rect = canvas.getBoundingClientRect();
// // //     const x = event.clientX - rect.left;
// // //     const y = event.clientY - rect.top;

// // //     // Create a synthetic event for the parent component
// // //     const syntheticEvent = {
// // //       ...event,
// // //       currentTarget: {
// // //         ...event.currentTarget,
// // //         getBoundingClientRect: () => ({
// // //           left: rect.left,
// // //           top: rect.top,
// // //           width: rect.width,
// // //           height: rect.height,
// // //           right: rect.right,
// // //           bottom: rect.bottom,
// // //           x: rect.x,
// // //           y: rect.y
// // //         })
// // //       }
// // //     // Change the type assertion to HTMLCanvasElement
// // //     } as React.MouseEvent<HTMLCanvasElement>;

// // //     onVideoClick(syntheticEvent);
// // //   }, [isDrawingZone, onVideoClick]);

// // //   useEffect(() => {
// // //     const video = videoRef.current;
// // //     if (!video || !rtspUrl) return;

// // //     setIsLoading(true);
// // //     setError('');
// // //     setVideoReady(false);

// // //     if (hlsRef.current) {
// // //       hlsRef.current.destroy();
// // //       hlsRef.current = null;
// // //     }

// // //     if (retryTimeoutRef.current) {
// // //       clearTimeout(retryTimeoutRef.current);
// // //       retryTimeoutRef.current = null;
// // //     }

// // //     if (Hls.isSupported()) {
// // //       const hls = new Hls({
// // //         enableWorker: false,
// // //         lowLatencyMode: true,
// // //         // Reduced buffer sizes to prevent buffer full errors
// // //         backBufferLength: 10,
// // //         maxBufferLength: 20,
// // //         maxMaxBufferLength: 30,
// // //         maxBufferSize: 20 * 1000 * 1000, // 20MB instead of 60MB
// // //         maxBufferHole: 0.5,
// // //         highBufferWatchdogPeriod: 1,
// // //         nudgeOffset: 0.1,
// // //         nudgeMaxRetry: 3,
// // //         maxFragLookUpTolerance: 0.25,
// // //         liveSyncDurationCount: 2, // Reduced from 3
// // //         liveMaxLatencyDurationCount: 5, // Reduced from 10
// // //         fragLoadingTimeOut: 15000, // Reduced from 20000
// // //         fragLoadingMaxRetry: 4, // Reduced from 6
// // //         fragLoadingRetryDelay: 500, // Reduced from 1000
// // //         fragLoadingMaxRetryTimeout: 32000, // Reduced from 64000
// // //         maxStarvationDelay: 2, // Reduced from 4
// // //         maxLoadingDelay: 2, // Reduced from 4
// // //         startLevel: -1,
// // //         capLevelToPlayerSize: true, // Enable to reduce quality if needed
// // //         manifestLoadingTimeOut: 8000, // Reduced from 10000
// // //         manifestLoadingMaxRetry: 4, // Reduced from 6
// // //         manifestLoadingRetryDelay: 500, // Reduced from 1000
// // //         levelLoadingTimeOut: 8000, // Reduced from 10000
// // //         levelLoadingMaxRetry: 4, // Reduced from 6
// // //         levelLoadingRetryDelay: 500, // Reduced from 1000
// // //       });

// // //       hlsRef.current = hls;

// // //       hls.on(Hls.Events.MEDIA_ATTACHED, () => {
// // //         console.log('HLS: Media attached');
// // //       });

// // //       hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
// // //         console.log('HLS: Manifest parsed, levels:', data.levels);
// // //         setIsLoading(false);
// // //         setRetryCount(0);
// // //         video.play().catch(console.error);
// // //       });

// // //       hls.on(Hls.Events.LEVEL_LOADED, () => {
// // //         if (!videoReady) {
// // //           setVideoReady(true);
// // //         }
// // //       });

// // //       hls.on(Hls.Events.FRAG_LOADED, () => {
// // //         if (error) {
// // //           setError('');
// // //         }
// // //       });

// // //       // Enhanced buffer management
// // //       hls.on(Hls.Events.BUFFER_FULL, () => {
// // //         console.log('Buffer full, attempting to free space...');
// // //         try {
// // //           // Try to remove old buffered data
// // //           const currentTime = video.currentTime;
// // //           if (currentTime > 10) {
// // //             // Remove data older than 5 seconds
// // //             hls.trigger(Hls.Events.BUFFER_FLUSHING, {
// // //               startOffset: 0,
// // //               endOffset: currentTime - 5,
// // //               type: 'video'
// // //             });
// // //           }
// // //         } catch (e) {
// // //           console.warn('Failed to flush buffer:', e);
// // //         }
// // //       });

// // //       hls.on(Hls.Events.ERROR, (event, data) => {
// // //         console.log('HLS Error:', data);

// // //         // Handle buffer full errors specifically
// // //         if (data.details === 'bufferFullError') {
// // //           console.log('Buffer full error detected, attempting recovery...');
// // //           try {
// // //             const currentTime = video.currentTime;
// // //             // More aggressive buffer cleanup for buffer full errors
// // //             hls.trigger(Hls.Events.BUFFER_FLUSHING, {
// // //               startOffset: 0,
// // //               endOffset: currentTime - 2,
// // //               type: 'video'
// // //             });
// // //             // Also try to flush audio buffer
// // //             hls.trigger(Hls.Events.BUFFER_FLUSHING, {
// // //               startOffset: 0,
// // //               endOffset: currentTime - 2,
// // //               type: 'audio'
// // //             });
// // //           } catch (e) {
// // //             console.warn('Failed to recover from buffer full error:', e);
// // //           }
// // //           return; // Don't treat as fatal error
// // //         }

// // //         if (data.fatal) {
// // //           console.error('Fatal HLS Error:', data);
// // //           setError(`Fatal Error: ${data.details}`);
// // //           setIsLoading(false);

// // //           switch (data.type) {
// // //             case Hls.ErrorTypes.NETWORK_ERROR:
// // //               console.log('Network error, trying to recover...');
// // //               if (retryCount < MAX_RETRIES) {
// // //                 setRetryCount(prev => prev + 1);
// // //                 retryTimeoutRef.current = setTimeout(() => {
// // //                   hls.startLoad();
// // //                 }, RETRY_DELAY);
// // //               } else {
// // //                 setError('Network error: Unable to connect to stream after multiple attempts');
// // //               }
// // //               break;
// // //             case Hls.ErrorTypes.MEDIA_ERROR:
// // //               console.log('Media error, trying to recover...');
// // //               hls.recoverMediaError();
// // //               break;
// // //             default:
// // //               console.log('Other fatal error, destroying HLS...');
// // //               hls.destroy();
// // //               break;
// // //           }
// // //         } else {
// // //           switch (data.details) {
// // //             case 'fragGap':
// // //               console.log('Fragment gap detected, this is normal for live streams starting up');
// // //               break;
// // //             case 'fragLoadError':
// // //               console.log('Fragment load error, HLS will retry automatically');
// // //               break;
// // //             case 'fragLoadTimeOut':
// // //               console.log('Fragment load timeout, retrying...');
// // //               break;
// // //             case 'levelLoadError':
// // //               console.log('Level load error, retrying...');
// // //               if (retryCount < MAX_RETRIES) {
// // //                 setRetryCount(prev => prev + 1);
// // //                 retryTimeoutRef.current = setTimeout(() => {
// // //                   hls.startLoad();
// // //                 }, RETRY_DELAY);
// // //               }
// // //               break;
// // //             default:
// // //               console.log('Non-fatal HLS error:', data.details);
// // //               if (!['fragGap', 'fragLoadError', 'fragLoadTimeOut', 'bufferFullError'].includes(data.details)) {
// // //                 setError(`Stream Error: ${data.details}`);
// // //               }
// // //               break;
// // //           }
// // //         }
// // //       });

// // //       hls.attachMedia(video);
// // //       hls.loadSource(rtspUrl);

// // //     } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
// // //       video.src = rtspUrl;
// // //       video.addEventListener('loadedmetadata', () => {
// // //         setIsLoading(false);
// // //         setVideoReady(true);
// // //         setRetryCount(0);
// // //         video.play().catch(console.error);
// // //       });
// // //       video.addEventListener('error', () => {
// // //         setError('Failed to load video stream');
// // //         setIsLoading(false);
// // //       });
// // //     } else {
// // //       setError('HLS is not supported in this browser');
// // //       setIsLoading(false);
// // //     }

// // //     const handleLoadStart = () => setIsLoading(true);
// // //     const handleCanPlay = () => {
// // //       setIsLoading(false);
// // //       setVideoReady(true);
// // //       calculateVideoAndCanvasDimensions();
// // //     };
// // //     const handleError = () => {
// // //       setError('Video playback error');
// // //       setIsLoading(false);
// // //     };
// // //     const handleWaiting = () => {
// // //       console.log('Video is buffering...');
// // //     };
// // //     const handlePlaying = () => {
// // //       console.log('Video is playing');
// // //       if (error && error.includes('Stream Error')) {
// // //         setError('');
// // //       }
// // //     };

// // //     video.addEventListener('loadstart', handleLoadStart);
// // //     video.addEventListener('canplay', handleCanPlay);
// // //     video.addEventListener('error', handleError);
// // //     video.addEventListener('waiting', handleWaiting);
// // //     video.addEventListener('playing', handlePlaying);
// // //     video.addEventListener('loadedmetadata', calculateVideoAndCanvasDimensions);
// // //     window.addEventListener('resize', calculateVideoAndCanvasDimensions);

// // //     return () => {
// // //       if (hlsRef.current) {
// // //         hlsRef.current.destroy();
// // //         hlsRef.current = null;
// // //       }
// // //       if (retryTimeoutRef.current) {
// // //         clearTimeout(retryTimeoutRef.current);
// // //         retryTimeoutRef.current = null;
// // //       }
// // //       video.removeEventListener('loadstart', handleLoadStart);
// // //       video.removeEventListener('canplay', handleCanPlay);
// // //       video.removeEventListener('error', handleError);
// // //       video.removeEventListener('waiting', handleWaiting);
// // //       video.removeEventListener('playing', handlePlaying);
// // //       video.removeEventListener('loadedmetadata', calculateVideoAndCanvasDimensions);
// // //       window.removeEventListener('resize', calculateVideoAndCanvasDimensions);
// // //     };
// // //   }, [rtspUrl, calculateVideoAndCanvasDimensions]);

// // //   // Enhanced drawing effect with proper cleanup
// // //   useEffect(() => {
// // //     const canvas = canvasRef.current;
// // //     const video = videoRef.current;
// // //     if (!canvas || !video || !videoReady || videoDimensions.width === 0) return;

// // //     const ctx = canvas.getContext('2d');
// // //     if (!ctx) return;

// // //     const drawOverlay = () => {
// // //       // Clear the entire canvas
// // //       ctx.clearRect(0, 0, canvas.width, canvas.height);

// // //       // Save context state
// // //       ctx.save();

// // //       // Draw existing zones
// // //       zones.forEach(zone => {
// // //         if (zone.points.length < 3) return;

// // //         ctx.beginPath();
// // //         ctx.moveTo(zone.points[0].x, zone.points[0].y);
// // //         zone.points.slice(1).forEach(point => {
// // //           ctx.lineTo(point.x, point.y);
// // //         });
// // //         ctx.closePath();

// // //         // Fill zone
// // //         ctx.fillStyle = zone.color + '33';
// // //         ctx.fill();

// // //         // Stroke zone border
// // //         ctx.strokeStyle = zone.color;
// // //         ctx.lineWidth = 2;
// // //         ctx.stroke();

// // //         // Draw zone label
// // //         const minX = Math.min(...zone.points.map(p => p.x));
// // //         const minY = Math.min(...zone.points.map(p => p.y));
// // //         const maxX = Math.max(...zone.points.map(p => p.x));
// // //         const maxY = Math.max(...zone.points.map(p => p.y));
// // //         const labelX = (minX + maxX) / 2;
// // //         const labelY = (minY + maxY) / 2;

// // //         ctx.fillStyle = zone.color;
// // //         ctx.font = 'bold 14px Arial';
// // //         ctx.textAlign = 'center';
// // //         ctx.textBaseline = 'middle';

// // //         // Add text background for better visibility
// // //         const textMetrics = ctx.measureText(zone.name);
// // //         const textWidth = textMetrics.width;
// // //         const textHeight = 16;

// // //         ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
// // //         ctx.fillRect(labelX - textWidth/2 - 4, labelY - textHeight/2 - 2, textWidth + 8, textHeight + 4);

// // //         ctx.fillStyle = zone.color;
// // //         ctx.fillText(zone.name, labelX, labelY);
// // //       });

// // //       // Draw current zone being drawn
// // //       if (isDrawingZone && currentZonePoints.length > 0) {
// // //         ctx.strokeStyle = '#00ff00';
// // //         ctx.lineWidth = 3;
// // //         ctx.fillStyle = '#00ff0033';
// // //         ctx.setLineDash([5, 5]); // Dashed line for current zone

// // //         if (currentZonePoints.length === 1) {
// // //           // Draw single point
// // //           ctx.beginPath();
// // //           ctx.arc(currentZonePoints[0].x, currentZonePoints[0].y, 4, 0, 2 * Math.PI);
// // //           ctx.fillStyle = '#00ff00';
// // //           ctx.fill();
// // //         } else {
// // //           // Draw lines between points
// // //           ctx.beginPath();
// // //           ctx.moveTo(currentZonePoints[0].x, currentZonePoints[0].y);
// // //           currentZonePoints.slice(1).forEach(point => {
// // //             ctx.lineTo(point.x, point.y);
// // //           });

// // //           if (currentZonePoints.length > 2) {
// // //             ctx.closePath();
// // //             ctx.fill();
// // //           }
// // //           ctx.stroke();

// // //           // Draw points
// // //           currentZonePoints.forEach((point, index) => {
// // //             ctx.beginPath();
// // //             ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
// // //             ctx.fillStyle = index === 0 ? '#ff0000' : '#00ff00'; // First point in red
// // //             ctx.fill();
// // //             ctx.strokeStyle = '#ffffff';
// // //             ctx.lineWidth = 1;
// // //             ctx.stroke();
// // //           });
// // //         }

// // //         ctx.setLineDash([]); // Reset line dash
// // //       }

// // //       // Draw vehicle detections
// // //       vehicleDetections.forEach(detection => {
// // //         const scaleX = videoDimensions.width / (video.videoWidth || 1);
// // //         const scaleY = videoDimensions.height / (video.videoHeight || 1);

// // //         const x = detection.x * scaleX;
// // //         const y = detection.y * scaleY;
// // //         const width = detection.width * scaleX;
// // //         const height = detection.height * scaleY;

// // //         // Draw detection box
// // //         ctx.strokeStyle = '#ff0000';
// // //         ctx.lineWidth = 3;
// // //         ctx.strokeRect(x, y, width, height);

// // //         // Draw label background
// // //         ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
// // //         const label = `Vehicle ${detection.confidence.toFixed(2)}`;
// // //         ctx.font = '12px Arial';
// // //         const labelWidth = ctx.measureText(label).width;
// // //         ctx.fillRect(x, y - 20, labelWidth + 8, 18);

// // //         // Draw label text
// // //         ctx.fillStyle = '#ffffff';
// // //         ctx.fillText(label, x + 4, y - 6);
// // //       });

// // //       // Restore context state
// // //       ctx.restore();
// // //     };

// // //     // Use requestAnimationFrame for smooth updates
// // //     const animate = () => {
// // //       drawOverlay();
// // //       animationFrameRef.current = requestAnimationFrame(animate);
// // //     };

// // //     animationFrameRef.current = requestAnimationFrame(animate);

// // //     return () => {
// // //       if (animationFrameRef.current) {
// // //         cancelAnimationFrame(animationFrameRef.current);
// // //         animationFrameRef.current = null;
// // //       }
// // //     };
// // //   }, [zones, vehicleDetections, isDrawingZone, currentZonePoints, videoReady, videoDimensions, videoOffset]);

// // //   const getStatusMessage = () => {
// // //     if (isLoading) return 'Loading stream...';
// // //     if (error) return error;
// // //     if (retryCount > 0) return `Retrying connection... (${retryCount}/${MAX_RETRIES})`;
// // //     return null;
// // //   };

// // //   return (
// // //     <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
// // //       <video
// // //         ref={videoRef}
// // //         className="w-full h-full object-contain"
// // //         controls={false}
// // //         muted
// // //         playsInline
// // //         onContextMenu={(e) => e.preventDefault()}
// // //       />

// // //       <canvas
// // //         ref={canvasRef}
// // //         className="absolute cursor-crosshair"
// // //         onClick={handleCanvasClick}
// // //         style={{ pointerEvents: isDrawingZone ? 'auto' : 'none' }}
// // //       />

// // //       {(isLoading || error || retryCount > 0) && (
// // //         <div className="absolute inset-0 flex items-center justify-center bg-black/50">
// // //           <div className="text-white text-center">
// // //             {isLoading && (
// // //               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
// // //             )}
// // //             <p className={error ? 'text-red-400' : 'text-white'}>
// // //               {getStatusMessage()}
// // //             </p>
// // //             {retryCount > 0 && (
// // //               <p className="text-sm text-gray-400 mt-1">
// // //                 Stream may take a moment to stabilize...
// // //               </p>
// // //             )}
// // //           </div>
// // //         </div>
// // //       )}

// // //       {videoReady && !error && (
// // //         <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">

// // //           {retryCount > 0 && (
// // //             <span className="ml-2 text-yellow-400">
// // //               (Reconnecting...)
// // //             </span>
// // //           )}
// // //         </div>
// // //       )}

// // //       {/* Zone drawing instructions */}
// // //       {isDrawingZone && (
// // //         <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-3 py-2 rounded">
// // //           <p>Click to add points • {currentZonePoints.length} points added</p>
// // //           <p className="text-green-400">Need at least 3 points to create zone</p>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default VideoPlayer;

// // // import React, { useRef, useEffect, useState, useCallback } from 'react';
// // // import Hls from 'hls.js';
// // // import { Zone, VehicleDetection } from '@/types/monitoring';

// // // interface VideoPlayerProps {
// // //   rtspUrl: string;
// // //   zones: Zone[];
// // //   vehicleDetections: VehicleDetection[];
// // //   isDrawingZone: boolean;
// // //   currentZonePoints: { x: number; y: number }[];
// // //   onVideoClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
// // // }

// // // const VideoPlayer: React.FC<VideoPlayerProps> = ({
// // //   rtspUrl,
// // //   zones,
// // //   vehicleDetections,
// // //   isDrawingZone,
// // //   currentZonePoints,
// // //   onVideoClick,
// // // }) => {
// // //   const videoRef = useRef<HTMLVideoElement>(null);
// // //   const canvasRef = useRef<HTMLCanvasElement>(null);
// // //   const hlsRef = useRef<Hls | null>(null);
// // //   const [isLoading, setIsLoading] = useState(true);
// // //   const [error, setError] = useState<string>('');
// // //   const [videoReady, setVideoReady] = useState(false);
// // //   const [retryCount, setRetryCount] = useState(0);
// // //   const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
// // //   const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
// // //   const [videoOffset, setVideoOffset] = useState({ x: 0, y: 0 });
// // //   const animationFrameRef = useRef<number | null>(null);

// // //   const MAX_RETRIES = 5;
// // //   const RETRY_DELAY = 2000;

// // //   const calculateVideoAndCanvasDimensions = useCallback(() => {
// // //     const video = videoRef.current;
// // //     const canvas = canvasRef.current;
// // //     if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return;

// // //     const videoAspectRatio = video.videoWidth / video.videoHeight;
// // //     const containerWidth = video.clientWidth;
// // //     const containerHeight = video.clientHeight;
// // //     const containerAspectRatio = containerWidth / containerHeight;

// // //     let actualVideoWidth = containerWidth;
// // //     let actualVideoHeight = containerHeight;
// // //     let offsetX = 0;
// // //     let offsetY = 0;

// // //     if (videoAspectRatio > containerAspectRatio) {
// // //       actualVideoHeight = containerWidth / videoAspectRatio;
// // //       offsetY = (containerHeight - actualVideoHeight) / 2;
// // //     } else {
// // //       actualVideoWidth = containerHeight * videoAspectRatio;
// // //       offsetX = (containerWidth - actualVideoWidth) / 2;
// // //     }

// // //     setVideoDimensions({ width: actualVideoWidth, height: actualVideoHeight });
// // //     setVideoOffset({ x: offsetX, y: offsetY });

// // //     canvas.width = actualVideoWidth;
// // //     canvas.height = actualVideoHeight;
// // //     canvas.style.left = `${offsetX}px`;
// // //     canvas.style.top = `${offsetY}px`;
// // //   }, []);

// // //   const handleCanvasClick = useCallback(
// // //     (event: React.MouseEvent<HTMLCanvasElement>) => {
// // //       if (!isDrawingZone) return;

// // //       const canvas = canvasRef.current;
// // //       if (!canvas) return;

// // //       const rect = canvas.getBoundingClientRect();
// // //       const syntheticEvent = {
// // //         ...event,
// // //         currentTarget: {
// // //           ...event.currentTarget,
// // //           getBoundingClientRect: () => rect,
// // //         },
// // //       } as React.MouseEvent<HTMLCanvasElement>;

// // //       onVideoClick(syntheticEvent);
// // //     },
// // //     [isDrawingZone, onVideoClick]
// // //   );

// // //   useEffect(() => {
// // //     const video = videoRef.current;
// // //     if (!video || !rtspUrl) return;

// // //     setIsLoading(true);
// // //     setError('');
// // //     setVideoReady(false);

// // //     if (hlsRef.current) {
// // //       hlsRef.current.destroy();
// // //       hlsRef.current = null;
// // //     }

// // //     if (retryTimeoutRef.current) {
// // //       clearTimeout(retryTimeoutRef.current);
// // //       retryTimeoutRef.current = null;
// // //     }

// // //     if (Hls.isSupported()) {
// // //       const hls = new Hls({
// // //         lowLatencyMode: false,
// // //         startLevel: 0,
// // //         backBufferLength: 10,
// // //         maxBufferLength: 30,
// // //         liveSyncDuration: 5,
// // //         liveMaxLatencyDuration: 10,
// // //       });

// // //       hlsRef.current = hls;

// // //       hls.attachMedia(video);
// // //       hls.loadSource(rtspUrl);

// // //       hls.on(Hls.Events.MANIFEST_PARSED, () => {
// // //         let startTime = hls.liveSyncPosition ?? 0;
// // //         try {
// // //           if (video.buffered.length > 0) {
// // //             startTime = video.buffered.start(0);
// // //           }
// // //         } catch (err) {
// // //           console.warn("Safe fallback to 0 due to buffered index error", err);
// // //         }
// // //         video.currentTime = startTime;
// // //         setIsLoading(false);
// // //         video.play().catch(console.error);
// // //       });

// // //       hls.on(Hls.Events.LEVEL_LOADED, () => {
// // //         const livePos = hls.liveSyncPosition;
// // //         if (livePos && !isNaN(livePos)) {
// // //           video.currentTime = livePos;
// // //         }
// // //         setVideoReady(true);
// // //       });

// // //       hls.on(Hls.Events.ERROR, (event, data) => {
// // //         console.warn('HLS Error:', data);
// // //         if (data.details === 'bufferStalledError') {
// // //           const liveEdge = hls.liveSyncPosition;
// // //           if (liveEdge && !isNaN(liveEdge)) {
// // //             video.currentTime = liveEdge;
// // //             return;
// // //           }
// // //         }

// // //         if (data.fatal) {
// // //           if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
// // //             hls.recoverMediaError();
// // //           } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryCount < MAX_RETRIES) {
// // //             setRetryCount(prev => prev + 1);
// // //             retryTimeoutRef.current = setTimeout(() => {
// // //               hls.startLoad();
// // //             }, RETRY_DELAY);
// // //           } else {
// // //             setError(`Fatal Error: ${data.details}`);
// // //           }
// // //         }
// // //       });
// // //     } else {
// // //       video.src = rtspUrl;
// // //       video.addEventListener('loadedmetadata', () => {
// // //         setIsLoading(false);
// // //         setVideoReady(true);
// // //         video.play().catch(console.error);
// // //       });
// // //     }

// // //     return () => {
// // //       if (hlsRef.current) hlsRef.current.destroy();
// // //       if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
// // //     };
// // //   }, [rtspUrl, retryCount]);

// // //   useEffect(() => {
// // //     const canvas = canvasRef.current;
// // //     const video = videoRef.current;
// // //     if (!canvas || !video || !videoReady || videoDimensions.width === 0) return;

// // //     const ctx = canvas.getContext('2d');
// // //     if (!ctx) return;

// // //     const drawOverlay = () => {
// // //       ctx.clearRect(0, 0, canvas.width, canvas.height);
// // //       ctx.save();

// // //       zones.forEach(zone => {
// // //         if (zone.points.length < 3) return;

// // //         ctx.beginPath();
// // //         ctx.moveTo(zone.points[0].x, zone.points[0].y);
// // //         zone.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
// // //         ctx.closePath();

// // //         ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
// // //         ctx.fill();
// // //         ctx.strokeStyle = '#ffffff';
// // //         ctx.lineWidth = 2;
// // //         ctx.stroke();

// // //         const minX = Math.min(...zone.points.map(p => p.x));
// // //         const minY = Math.min(...zone.points.map(p => p.y));
// // //         const maxX = Math.max(...zone.points.map(p => p.x));
// // //         const maxY = Math.max(...zone.points.map(p => p.y));
// // //         const labelX = (minX + maxX) / 2;
// // //         const labelY = (minY + maxY) / 2;

// // //         ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
// // //         ctx.fillRect(labelX - 30, labelY - 10, 60, 20);

// // //         ctx.fillStyle = '#ffffff';
// // //         ctx.font = 'bold 14px Arial';
// // //         ctx.textAlign = 'center';
// // //         ctx.fillText(zone.name, labelX, labelY + 5);
// // //       });

// // //       animationFrameRef.current = requestAnimationFrame(drawOverlay);
// // //     };

// // //     animationFrameRef.current = requestAnimationFrame(drawOverlay);
// // //     return () => {
// // //       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
// // //     };
// // //   }, [zones, videoReady, videoDimensions]);

// // //   return (
// // //     <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
// // //       <video
// // //         ref={videoRef}
// // //         className="w-full h-full object-contain"
// // //         controls={false}
// // //         muted
// // //         playsInline
// // //         onContextMenu={e => e.preventDefault()}
// // //       />
// // //       <canvas
// // //         ref={canvasRef}
// // //         className="absolute cursor-crosshair"
// // //         onClick={handleCanvasClick}
// // //         style={{ pointerEvents: isDrawingZone ? 'auto' : 'none' }}
// // //       />
// // //       {(isLoading || error || retryCount > 0) && (
// // //         <div className="absolute inset-0 flex items-center justify-center bg-black/50">
// // //           <div className="text-white text-center">
// // //             {isLoading && <div className="animate-spin h-8 w-8 border-b-2 border-white mx-auto mb-2 rounded-full" />}
// // //             <p className={error ? 'text-red-400' : 'text-white'}>
// // //               {isLoading ? 'Loading stream...' : error || `Retrying... (${retryCount}/${MAX_RETRIES})`}
// // //             </p>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default VideoPlayer;


// // import React, { useRef, useEffect, useState, useCallback } from 'react';
// // import Hls from 'hls.js';
// // import { Zone, VehicleDetection } from '@/types/monitoring';

// // interface VideoPlayerProps {
// //   rtspUrl: string;
// //   zones: Zone[];
// //   vehicleDetections: VehicleDetection[];
// //   isDrawingZone: boolean;
// //   currentZonePoints: { x: number; y: number }[];
// //   onVideoClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
// // }

// // const VideoPlayer: React.FC<VideoPlayerProps> = ({
// //   rtspUrl,
// //   zones,
// //   vehicleDetections,
// //   isDrawingZone,
// //   currentZonePoints,
// //   onVideoClick
// // }) => {
// //   const videoRef = useRef<HTMLVideoElement>(null);
// //   const canvasRef = useRef<HTMLCanvasElement>(null);
// //   const hlsRef = useRef<Hls | null>(null);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState<string>('');
// //   const [videoReady, setVideoReady] = useState(false);
// //   const [retryCount, setRetryCount] = useState(0);
// //   const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
// //   const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
// //   const [videoOffset, setVideoOffset] = useState({ x: 0, y: 0 });
// //   const animationFrameRef = useRef<number | null>(null);

// //   const MAX_RETRIES = 5;
// //   const RETRY_DELAY = 2000;

// //   // Function to calculate and set video and canvas dimensions/offsets
// //   const calculateVideoAndCanvasDimensions = useCallback(() => {
// //     const video = videoRef.current;
// //     const canvas = canvasRef.current;
// //     if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
// //       console.log('calculateVideoAndCanvasDimensions: Video or canvas not ready or video dimensions are zero.');
// //       return;
// //     }

// //     const videoAspectRatio = video.videoWidth / video.videoHeight;
// //     const containerWidth = video.clientWidth;
// //     const containerHeight = video.clientHeight;
// //     const containerAspectRatio = containerWidth / containerHeight;

// //     let actualVideoWidth = containerWidth;
// //     let actualVideoHeight = containerHeight;
// //     let offsetX = 0;
// //     let offsetY = 0;

// //     if (videoAspectRatio > containerAspectRatio) {
// //       actualVideoHeight = containerWidth / videoAspectRatio;
// //       offsetY = (containerHeight - actualVideoHeight) / 2;
// //     } else {
// //       actualVideoWidth = containerHeight * videoAspectRatio;
// //       offsetX = (containerWidth - actualVideoWidth) / 2;
// //     }

// //     setVideoDimensions({ width: actualVideoWidth, height: actualVideoHeight });
// //     setVideoOffset({ x: offsetX, y: offsetY });

// //     canvas.width = actualVideoWidth;
// //     canvas.height = actualVideoHeight;
// //     canvas.style.left = `${offsetX}px`;
// //     canvas.style.top = `${offsetY}px`;

// //     // Debugging: Log calculated dimensions and offsets
// //     console.log('Video Dimensions:', { videoWidth: video.videoWidth, videoHeight: video.videoHeight });
// //     console.log('Container Dimensions:', { containerWidth, containerHeight });
// //     console.log('Calculated Canvas Dimensions:', { actualVideoWidth, actualVideoHeight });
// //     console.log('Calculated Canvas Offset:', { offsetX, offsetY });
// //   }, []);

// //   // Enhanced click handler that properly converts coordinates
// //   const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
// //     // Debugging: Check if drawing mode is active
// //     if (!isDrawingZone) {
// //       console.log('handleCanvasClick: Not in drawing zone mode.');
// //       return;
// //     }

// //     const canvas = canvasRef.current;
// //     if (!canvas) {
// //       console.log('handleCanvasClick: Canvas ref is null.');
// //       return;
// //     }

// //     const rect = canvas.getBoundingClientRect();
// //     const x = event.clientX - rect.left;
// //     const y = event.clientY - rect.top;

// //     // Debugging: Log clicked coordinates
// //     console.log(`Clicked on canvas at: x=${x}, y=${y}`);

// //     // Create a synthetic event for the parent component
// //     const syntheticEvent = {
// //       ...event,
// //       currentTarget: {
// //         ...event.currentTarget,
// //         getBoundingClientRect: () => ({
// //           left: rect.left,
// //           top: rect.top,
// //           width: rect.width,
// //           height: rect.height,
// //           right: rect.right,
// //           bottom: rect.bottom,
// //           x: rect.x,
// //           y: rect.y
// //         })
// //       }
// //     } as React.MouseEvent<HTMLCanvasElement>; // Correct type assertion

// //     onVideoClick(syntheticEvent);
// //   }, [isDrawingZone, onVideoClick]);

// //   useEffect(() => {
// //     const video = videoRef.current;
// //     if (!video || !rtspUrl) {
// //       console.log('useEffect (HLS setup): Video ref or rtspUrl is missing.');
// //       return;
// //     }

// //     setIsLoading(true);
// //     setError('');
// //     setVideoReady(false);

// //     if (hlsRef.current) {
// //       hlsRef.current.destroy();
// //       hlsRef.current = null;
// //     }

// //     if (retryTimeoutRef.current) {
// //       clearTimeout(retryTimeoutRef.current);
// //       retryTimeoutRef.current = null;
// //     }

// //     if (Hls.isSupported()) {
// //       const hls = new Hls({
// //         enableWorker: false,
// //         lowLatencyMode: true,
// //         // Reduced buffer sizes to prevent buffer full errors
// //         backBufferLength: 10,
// //         maxBufferLength: 20,
// //         maxMaxBufferLength: 30,
// //         maxBufferSize: 20 * 1000 * 1000, // 20MB instead of 60MB
// //         maxBufferHole: 0.5,
// //         highBufferWatchdogPeriod: 1,
// //         nudgeOffset: 0.1,
// //         nudgeMaxRetry: 3,
// //         maxFragLookUpTolerance: 0.25,
// //         liveSyncDurationCount: 2, // Reduced from 3
// //         liveMaxLatencyDurationCount: 5, // Reduced from 10
// //         fragLoadingTimeOut: 15000, // Reduced from 20000
// //         fragLoadingMaxRetry: 4, // Reduced from 6
// //         fragLoadingRetryDelay: 500, // Reduced from 1000
// //         fragLoadingMaxRetryTimeout: 32000, // Reduced from 64000
// //         maxStarvationDelay: 2, // Reduced from 4
// //         maxLoadingDelay: 2, // Reduced from 4
// //         startLevel: -1,
// //         capLevelToPlayerSize: true, // Enable to reduce quality if needed
// //         manifestLoadingTimeOut: 8000, // Reduced from 10000
// //         manifestLoadingMaxRetry: 4, // Reduced from 6
// //         manifestLoadingRetryDelay: 500, // Reduced from 1000
// //         levelLoadingTimeOut: 8000, // Reduced from 10000
// //         levelLoadingMaxRetry: 4, // Reduced from 6
// //         levelLoadingRetryDelay: 500, // Reduced from 1000
// //       });

// //       hlsRef.current = hls;

// //       hls.on(Hls.Events.MEDIA_ATTACHED, () => {
// //         console.log('HLS: Media attached');
// //       });

// //       hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
// //         console.log('HLS: Manifest parsed, levels:', data.levels);
// //         setIsLoading(false);
// //         setRetryCount(0);
// //         video.play().catch(e => console.error('Video play error:', e)); // Added error handling for play
// //       });

// //       hls.on(Hls.Events.LEVEL_LOADED, () => {
// //         if (!videoReady) {
// //           console.log('HLS: Level loaded, setting videoReady to true.');
// //           setVideoReady(true);
// //         }
// //       });

// //       hls.on(Hls.Events.FRAG_LOADED, () => {
// //         if (error) {
// //           console.log('HLS: Fragment loaded, clearing error.');
// //           setError('');
// //         }
// //       });

// //       // Enhanced buffer management
// //       hls.on(Hls.Events.BUFFER_FULL, () => {
// //         console.log('Buffer full, attempting to free space...');
// //         try {
// //           // Try to remove old buffered data
// //           const currentTime = video.currentTime;
// //           if (currentTime > 10) {
// //             // Remove data older than 5 seconds
// //             hls.trigger(Hls.Events.BUFFER_FLUSHING, {
// //               startOffset: 0,
// //               endOffset: currentTime - 5,
// //               type: 'video'
// //             });
// //           }
// //         } catch (e) {
// //           console.warn('Failed to flush buffer:', e);
// //         }
// //       });

// //       hls.on(Hls.Events.ERROR, (event, data) => {
// //         console.log('HLS Error:', data);

// //         // Handle buffer full errors specifically
// //         if (data.details === 'bufferFullError') {
// //           console.log('Buffer full error detected, attempting recovery...');
// //           try {
// //             const currentTime = video.currentTime;
// //             // More aggressive buffer cleanup for buffer full errors
// //             hls.trigger(Hls.Events.BUFFER_FLUSHING, {
// //               startOffset: 0,
// //               endOffset: currentTime - 2,
// //               type: 'video'
// //             });
// //             // Also try to flush audio buffer
// //             hls.trigger(Hls.Events.BUFFER_FLUSHING, {
// //               startOffset: 0,
// //               endOffset: currentTime - 2,
// //               type: 'audio'
// //             });
// //           } catch (e) {
// //             console.warn('Failed to recover from buffer full error:', e);
// //           }
// //           return; // Don't treat as fatal error
// //         }

// //         if (data.fatal) {
// //           console.error('Fatal HLS Error:', data);
// //           setError(`Fatal Error: ${data.details}`);
// //           setIsLoading(false);

// //           switch (data.type) {
// //             case Hls.ErrorTypes.NETWORK_ERROR:
// //               console.log('Network error, trying to recover...');
// //               if (retryCount < MAX_RETRIES) {
// //                 setRetryCount(prev => prev + 1);
// //                 retryTimeoutRef.current = setTimeout(() => {
// //                   hls.startLoad();
// //                 }, RETRY_DELAY);
// //               } else {
// //                 setError('Network error: Unable to connect to stream after multiple attempts');
// //               }
// //               break;
// //             case Hls.ErrorTypes.MEDIA_ERROR:
// //               console.log('Media error, trying to recover...');
// //               hls.recoverMediaError();
// //               break;
// //             default:
// //               console.log('Other fatal error, destroying HLS...');
// //               hls.destroy();
// //               break;
// //           }
// //         } else {
// //           switch (data.details) {
// //             case 'fragGap':
// //               console.log('Fragment gap detected, this is normal for live streams starting up');
// //               break;
// //             case 'fragLoadError':
// //               console.log('Fragment load error, HLS will retry automatically');
// //               break;
// //             case 'fragLoadTimeOut':
// //               console.log('Fragment load timeout, retrying...');
// //               break;
// //             case 'levelLoadError':
// //               console.log('Level load error, retrying...');
// //               if (retryCount < MAX_RETRIES) {
// //                 setRetryCount(prev => prev + 1);
// //                 retryTimeoutRef.current = setTimeout(() => {
// //                   hls.startLoad();
// //                 }, RETRY_DELAY);
// //               }
// //               break;
// //             default:
// //               console.log('Non-fatal HLS error:', data.details);
// //               if (!['fragGap', 'fragLoadError', 'fragLoadTimeOut', 'bufferFullError'].includes(data.details)) {
// //                 setError(`Stream Error: ${data.details}`);
// //               }
// //               break;
// //           }
// //         }
// //       });

// //       hls.attachMedia(video);
// //       hls.loadSource(rtspUrl);

// //     } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
// //       video.src = rtspUrl;
// //       video.addEventListener('loadedmetadata', () => {
// //         setIsLoading(false);
// //         setVideoReady(true);
// //         setRetryCount(0);
// //         video.play().catch(e => console.error('Video play error (native HLS):', e));
// //       });
// //       video.addEventListener('error', () => {
// //         setError('Failed to load video stream');
// //         setIsLoading(false);
// //       });
// //     } else {
// //       setError('HLS is not supported in this browser');
// //       setIsLoading(false);
// //     }

// //     const handleLoadStart = () => {
// //       setIsLoading(true);
// //       console.log('Video: loadstart event');
// //     };
// //     const handleCanPlay = () => {
// //       setIsLoading(false);
// //       setVideoReady(true);
// //       calculateVideoAndCanvasDimensions();
// //       console.log('Video: canplay event, videoReady set to true.');
// //     };
// //     const handleError = (e: Event) => {
// //       const target = e.target as HTMLVideoElement;
// //       console.error('Video playback error event:', target.error);
// //       setError(`Video playback error: ${target.error?.message || 'Unknown error'}`);
// //       setIsLoading(false);
// //     };
// //     const handleWaiting = () => {
// //       console.log('Video is buffering...');
// //     };
// //     const handlePlaying = () => {
// //       console.log('Video is playing');
// //       if (error && error.includes('Stream Error')) {
// //         setError('');
// //       }
// //     };

// //     video.addEventListener('loadstart', handleLoadStart);
// //     video.addEventListener('canplay', handleCanPlay);
// //     video.addEventListener('error', handleError);
// //     video.addEventListener('waiting', handleWaiting);
// //     video.addEventListener('playing', handlePlaying);
// //     video.addEventListener('loadedmetadata', calculateVideoAndCanvasDimensions);
// //     window.addEventListener('resize', calculateVideoAndCanvasDimensions);

// //     return () => {
// //       console.log('Cleaning up video player effects.');
// //       if (hlsRef.current) {
// //         hlsRef.current.destroy();
// //         hlsRef.current = null;
// //       }
// //       if (retryTimeoutRef.current) {
// //         clearTimeout(retryTimeoutRef.current);
// //         retryTimeoutRef.current = null;
// //       }
// //       video.removeEventListener('loadstart', handleLoadStart);
// //       video.removeEventListener('canplay', handleCanPlay);
// //       video.removeEventListener('error', handleError);
// //       video.removeEventListener('waiting', handleWaiting);
// //       video.removeEventListener('playing', handlePlaying);
// //       video.removeEventListener('loadedmetadata', calculateVideoAndCanvasDimensions);
// //       window.removeEventListener('resize', calculateVideoAndCanvasDimensions);
// //     };
// //   }, [rtspUrl, calculateVideoAndCanvasDimensions, error, retryCount]); // Added error and retryCount to dependencies for clarity, though not strictly necessary for this effect's logic.

// //   // Drawing effect
// //   useEffect(() => {
// //     const canvas = canvasRef.current;
// //     const video = videoRef.current;
// //     const ctx = canvas?.getContext('2d');

// //     // Debugging: Check drawing prerequisites
// //     if (!canvas || !video || !ctx) {
// //       console.log('Drawing effect: Canvas, video or context not available.');
// //       return;
// //     }
// //     if (!videoReady) {
// //       console.log('Drawing effect: Video not ready.');
// //       return;
// //     }
// //     if (videoDimensions.width === 0) {
// //       console.log('Drawing effect: Video dimensions are zero.');
// //       return;
// //     }

// //     const drawOverlay = () => {
// //       ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

// //       ctx.save(); // Save context state

// //       // Draw existing zones
// //       zones.forEach(zone => {
// //         if (zone.points.length < 3) {
// //           console.log(`Skipping zone "${zone.name}" as it has less than 3 points.`);
// //           return;
// //         }

// //         ctx.beginPath();
// //         ctx.moveTo(zone.points[0].x, zone.points[0].y);
// //         zone.points.slice(1).forEach(point => {
// //           ctx.lineTo(point.x, point.y);
// //         });
// //         ctx.closePath();

// //         // Fill zone
// //         ctx.fillStyle = zone.color + '33'; // Semi-transparent
// //         ctx.fill();

// //         // Stroke zone border
// //         ctx.strokeStyle = zone.color;
// //         ctx.lineWidth = 2;
// //         ctx.stroke();

// //         // Draw zone label
// //         // Calculate the bounding box for the zone points
// //         const xs = zone.points.map(p => p.x);
// //         const ys = zone.points.map(p => p.y);
// //         const minX = Math.min(...xs);
// //         const minY = Math.min(...ys);
// //         const maxX = Math.max(...xs);
// //         const maxY = Math.max(...ys);
// //         const labelX = (minX + maxX) / 2;
// //         const labelY = (minY + maxY) / 2;

// //         ctx.font = 'bold 14px Arial';
// //         ctx.textAlign = 'center';
// //         ctx.textBaseline = 'middle';

// //         // Add text background for better visibility
// //         const textMetrics = ctx.measureText(zone.name);
// //         const textWidth = textMetrics.width;
// //         const textHeight = 16; // Approximate height for 14px font

// //         ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Dark background
// //         ctx.fillRect(labelX - textWidth / 2 - 4, labelY - textHeight / 2 - 2, textWidth + 8, textHeight + 4);

// //         ctx.fillStyle = zone.color;
// //         ctx.fillText(zone.name, labelX, labelY);

// //         // Debugging: Log drawn zone
// //         console.log(`Drawing existing zone: ${zone.name} with points:`, zone.points);
// //       });

// //       // Draw current zone being drawn
// //       if (isDrawingZone && currentZonePoints.length > 0) {
// //         ctx.strokeStyle = '#00ff00';
// //         ctx.lineWidth = 3;
// //         ctx.fillStyle = '#00ff0033';
// //         ctx.setLineDash([5, 5]); // Dashed line for current zone

// //         if (currentZonePoints.length === 1) {
// //           // Draw single point
// //           ctx.beginPath();
// //           ctx.arc(currentZonePoints[0].x, currentZonePoints[0].y, 4, 0, 2 * Math.PI);
// //           ctx.fillStyle = '#00ff00';
// //           ctx.fill();
// //           console.log('Drawing single current zone point:', currentZonePoints[0]);
// //         } else {
// //           // Draw lines between points
// //           ctx.beginPath();
// //           ctx.moveTo(currentZonePoints[0].x, currentZonePoints[0].y);
// //           currentZonePoints.slice(1).forEach(point => {
// //             ctx.lineTo(point.x, point.y);
// //           });

// //           if (currentZonePoints.length > 2) {
// //             ctx.closePath();
// //             ctx.fill();
// //           }
// //           ctx.stroke();

// //           // Draw points (circles)
// //           currentZonePoints.forEach((point, index) => {
// //             ctx.beginPath();
// //             ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
// //             ctx.fillStyle = index === 0 ? '#ff0000' : '#00ff00'; // First point in red
// //             ctx.fill();
// //             ctx.strokeStyle = '#ffffff';
// //             ctx.lineWidth = 1;
// //             ctx.stroke();
// //           });
// //           console.log('Drawing current zone in progress with points:', currentZonePoints);
// //         }

// //         ctx.setLineDash([]); // Reset line dash
// //       }

// //       // Draw vehicle detections
// //       vehicleDetections.forEach(detection => {
// //         // IMPORTANT: The detection coordinates (x, y, width, height) are usually relative to the original
// //         // video resolution. You need to scale them to the actual `canvas.width` and `canvas.height`.
// //         // The `videoDimensions` state holds the `actualVideoWidth` and `actualVideoHeight` which are
// //         // the canvas dimensions.
// //         // Assuming `detection.x, y, width, height` are normalized (0-1) or relative to `video.videoWidth/Height`.
// //         // If they are raw pixel values from the original stream, you must scale them.
// //         // The current scaling uses `video.videoWidth` and `video.videoHeight`. This is correct.
// //         const scaleX = videoDimensions.width / (video.videoWidth || 1);
// //         const scaleY = videoDimensions.height / (video.videoHeight || 1);

// //         const x = detection.x * scaleX;
// //         const y = detection.y * scaleY;
// //         const width = detection.width * scaleX;
// //         const height = detection.height * scaleY;

// //         // Draw detection box
// //         ctx.strokeStyle = '#ff0000';
// //         ctx.lineWidth = 3;
// //         ctx.strokeRect(x, y, width, height);

// //         // Draw label background
// //         ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
// //         const label = `Vehicle ${detection.confidence.toFixed(2)}`;
// //         ctx.font = '12px Arial';
// //         const labelWidth = ctx.measureText(label).width;
// //         ctx.fillRect(x, y - 20, labelWidth + 8, 18); // Position above the box

// //         // Draw label text
// //         ctx.fillStyle = '#ffffff';
// //         ctx.fillText(label, x + 4, y - 6); // Adjust text position
// //         console.log('Drawing vehicle detection:', detection);
// //       });

// //       ctx.restore(); // Restore context state
// //     };

// //     // Use requestAnimationFrame for smooth updates
// //     const animate = () => {
// //       drawOverlay();
// //       animationFrameRef.current = requestAnimationFrame(animate);
// //     };

// //     animationFrameRef.current = requestAnimationFrame(animate);

// //     return () => {
// //       console.log('Cleaning up animation frame.');
// //       if (animationFrameRef.current) {
// //         cancelAnimationFrame(animationFrameRef.current);
// //         animationFrameRef.current = null;
// //       }
// //     };
// //   }, [zones, vehicleDetections, isDrawingZone, currentZonePoints, videoReady, videoDimensions]); // videoOffset is not directly used in drawing, but videoDimensions is.

// //   const getStatusMessage = () => {
// //     if (isLoading) return 'Loading stream...';
// //     if (error) return error;
// //     if (retryCount > 0) return `Retrying connection... (${retryCount}/${MAX_RETRIES})`;
// //     return null;
// //   };

// //   return (
// //     <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
// //       <video
// //         ref={videoRef}
// //         className="w-full h-full object-contain"
// //         controls={false}
// //         muted
// //         playsInline
// //         onContextMenu={(e) => e.preventDefault()}
// //       />

// //       <canvas
// //         ref={canvasRef}
// //         className="absolute cursor-crosshair"
// //         onClick={handleCanvasClick}
// //         // Only allow pointer events on the canvas when drawing a zone
// //         style={{ pointerEvents: isDrawingZone ? 'auto' : 'none' }}
// //       />

// //       {(isLoading || error || retryCount > 0) && (
// //         <div className="absolute inset-0 flex items-center justify-center bg-black/50">
// //           <div className="text-white text-center">
// //             {isLoading && (
// //               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
// //             )}
// //             <p className={error ? 'text-red-400' : 'text-white'}>
// //               {getStatusMessage()}
// //             </p>
// //             {retryCount > 0 && (
// //               <p className="text-sm text-gray-400 mt-1">
// //                 Stream may take a moment to stabilize...
// //               </p>
// //             )}
// //           </div>
// //         </div>
// //       )}

// //       {videoReady && !error && (
// //         <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
// //           Active
// //           {retryCount > 0 && (
// //             <span className="ml-2 text-yellow-400">
// //               (Reconnecting...)
// //             </span>
// //           )}
// //         </div>
// //       )}

// //       {/* Zone drawing instructions */}
// //       {isDrawingZone && (
// //         <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-3 py-2 rounded">
// //           <p>Click to add points • {currentZonePoints.length} points added</p>
// //           <p className="text-green-400">Need at least 3 points to create zone</p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default VideoPlayer;

// import React, { useRef, useEffect, useState, useCallback } from 'react';
// import Hls from 'hls.js';
// import { Zone, VehicleDetection } from '@/types/monitoring';

// interface VideoPlayerProps {
//   rtspUrl: string;
//   zones: Zone[];
//   vehicleDetections: VehicleDetection[];
//   isDrawingZone: boolean;
//   currentZonePoints: { x: number; y: number }[];
//   onVideoClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
// }

// const VideoPlayer: React.FC<VideoPlayerProps> = ({
//   rtspUrl,
//   zones,
//   vehicleDetections,
//   isDrawingZone,
//   currentZonePoints,
//   onVideoClick
// }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const hlsRef = useRef<Hls | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string>('');
//   const [videoReady, setVideoReady] = useState(false);
//   const [retryCount, setRetryCount] = useState(0);
//   const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
//   // videoOffset is derived from videoDimensions, no need for separate state for it.
//   const animationFrameRef = useRef<number | null>(null);

//   const MAX_RETRIES = 10; // Increased retries for more resilience
//   const RETRY_DELAY = 3000; // Increased delay to avoid overwhelming server on retry

//   // Function to calculate and set video and canvas dimensions/offsets
//   const calculateVideoAndCanvasDimensions = useCallback(() => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
//       console.debug('calculateVideoAndCanvasDimensions: Video or canvas not ready or video dimensions are zero.');
//       return;
//     }

//     const videoAspectRatio = video.videoWidth / video.videoHeight;
//     const containerWidth = video.clientWidth;
//     const containerHeight = video.clientHeight;
//     const containerAspectRatio = containerWidth / containerHeight;

//     let actualVideoWidth = containerWidth;
//     let actualVideoHeight = containerHeight;
//     let offsetX = 0;
//     let offsetY = 0;

//     if (videoAspectRatio > containerAspectRatio) {
//       actualVideoHeight = containerWidth / videoAspectRatio;
//       offsetY = (containerHeight - actualVideoHeight) / 2;
//     } else {
//       actualVideoWidth = containerHeight * videoAspectRatio;
//       offsetX = (containerWidth - actualVideoWidth) / 2;
//     }

//     setVideoDimensions({ width: actualVideoWidth, height: actualVideoHeight });
//     // canvas.width and height should match the video's displayed size for accurate overlay
//     canvas.width = actualVideoWidth;
//     canvas.height = actualVideoHeight;
//     // Position the canvas exactly over the video, accounting for object-contain
//     canvas.style.left = `${offsetX}px`;
//     canvas.style.top = `${offsetY}px`;

//     console.debug('Video Dimensions:', { videoWidth: video.videoWidth, videoHeight: video.videoHeight });
//     console.debug('Container Dimensions:', { containerWidth, containerHeight });
//     console.debug('Calculated Canvas Dimensions:', { actualVideoWidth, actualVideoHeight });
//     console.debug('Calculated Canvas Offset:', { offsetX, offsetY });
//   }, []);

//   // Enhanced click handler that properly converts coordinates
//   const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
//     if (!isDrawingZone) {
//       return;
//     }

//     const canvas = canvasRef.current;
//     const video = videoRef.current;
//     if (!canvas || !video || videoDimensions.width === 0) {
//       console.warn('handleCanvasClick: Canvas, video or video dimensions not ready.');
//       return;
//     }

//     // Calculate original video coordinates
//     // Get click position relative to the canvas itself (which is already scaled and positioned)
//     const rect = canvas.getBoundingClientRect();
//     const clickXOnCanvas = event.clientX - rect.left;
//     const clickYOnCanvas = event.clientY - rect.top;

//     // Scale these back to the original video's intrinsic dimensions
//     // video.videoWidth and video.videoHeight are the intrinsic dimensions of the video stream.
//     const originalVideoWidth = video.videoWidth;
//     const originalVideoHeight = video.videoHeight;

//     // Use videoDimensions (actual displayed video area) for scaling
//     const scaleFactorX = originalVideoWidth / videoDimensions.width;
//     const scaleFactorY = originalVideoHeight / videoDimensions.height;

//     const originalVideoX = clickXOnCanvas * scaleFactorX;
//     const originalVideoY = clickYOnCanvas * scaleFactorY;

//     // Pass the original video coordinates to the parent
//     const syntheticEvent = {
//       ...event,
//       clientX: originalVideoX, // Overwriting clientX/Y with scaled coordinates
//       clientY: originalVideoY,
//       // Provide a getBoundingClientRect that reflects the original video dimensions for consistency
//       currentTarget: {
//         ...event.currentTarget,
//         getBoundingClientRect: () => ({
//           left: 0, top: 0, width: originalVideoWidth, height: originalVideoHeight,
//           x: 0, y: 0, right: originalVideoWidth, bottom: originalVideoHeight
//         })
//       }
//     } as React.MouseEvent<HTMLCanvasElement>;

//     onVideoClick(syntheticEvent);
//     console.debug(`Clicked on canvas. Scaled to original video: x=${originalVideoX}, y=${originalVideoY}`);
//   }, [isDrawingZone, onVideoClick, videoDimensions]);


//   // HLS setup and event handling
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video || !rtspUrl) {
//       console.log('useEffect (HLS setup): Video ref or rtspUrl is missing.');
//       return;
//     }

//     setIsLoading(true);
//     setError('');
//     setVideoReady(false);

//     // Clean up any existing HLS instance or timeout
//     if (hlsRef.current) {
//       hlsRef.current.destroy();
//       hlsRef.current = null;
//       console.log('HLS: Existing instance destroyed.');
//     }
//     if (retryTimeoutRef.current) {
//       clearTimeout(retryTimeoutRef.current);
//       retryTimeoutRef.current = null;
//     }

//     // Function to initialize HLS
//     const initializeHls = (attemptRetry = false) => {
//       if (attemptRetry && retryCount >= MAX_RETRIES) {
//         setError('Failed to load video stream after multiple attempts.');
//         setIsLoading(false);
//         console.error('Max retries reached. Stopping attempts.');
//         return;
//       }

//       console.log(`HLS: Initializing Hls.js (Attempt ${retryCount + 1}/${MAX_RETRIES})`);

//       if (Hls.isSupported()) {
//         const hls = new Hls({
//           enableWorker: true, // Re-enabled for better performance
//           lowLatencyMode: true,
//           // Reverted some buffer values to more standard, less aggressive ones.
//           // These provide a bit more wiggle room for slight stream imperfections.
//           backBufferLength: 30, // Default is usually 30-90s for VOD, but shorter for live.
//           maxBufferLength: 60, // Default is 60s
//           maxMaxBufferLength: 120, // Default is 120s
//           maxBufferSize: 60 * 1000 * 1000, // 60MB default
//           maxBufferHole: 0.5,
//           liveSyncDurationCount: 3, // Default is 3
//           liveMaxLatencyDurationCount: 10, // Default is 10
//           fragLoadingTimeOut: 20000, // Default is 20s
//           fragLoadingMaxRetry: 6, // Default is 6
//           fragLoadingRetryDelay: 1000, // Default is 1000ms
//           fragLoadingMaxRetryTimeout: 64000, // Default is 64s
//           maxStarvationDelay: 4, // Default is 4s
//           maxLoadingDelay: 4, // Default is 4s
//           startLevel: -1, // Auto-detect best quality
//           capLevelToPlayerSize: true,
//           manifestLoadingTimeOut: 10000, // Default 10s
//           manifestLoadingMaxRetry: 6, // Default 6
//           manifestLoadingRetryDelay: 1000, // Default 1000ms
//           levelLoadingTimeOut: 10000, // Default 10s
//           levelLoadingMaxRetry: 6, // Default 6
//           levelLoadingRetryDelay: 1000, // Default 1000ms
//         });

//         hlsRef.current = hls;

//         hls.on(Hls.Events.MEDIA_ATTACHED, () => {
//           console.log('HLS: Media attached');
//           hls.loadSource(rtspUrl); // Load source *after* media is attached
//         });

//         hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
//           console.log('HLS: Manifest parsed, levels:', data.levels);
//           setIsLoading(false);
//           setRetryCount(0); // Reset retry count on successful manifest parse
//           video.play().catch(e => {
//             console.error('Video play error on manifest parsed:', e);
//             // This AbortError is common if play() is called too early or repeatedly.
//             // It's usually not fatal to the stream itself, but indicates a race condition.
//             if (e.name !== 'AbortError') {
//               setError(`Video playback issue: ${e.message}`);
//             }
//           });
//         });

//         hls.on(Hls.Events.LEVEL_LOADED, () => {
//           if (!videoReady) {
//             console.log('HLS: Level loaded, setting videoReady to true.');
//             setVideoReady(true);
//           }
//         });

//         hls.on(Hls.Events.FRAG_LOADED, () => {
//           if (error && error.includes('Stream Error') && !isLoading) { // Only clear if it was a stream error
//             console.log('HLS: Fragment loaded, clearing stream-related error.');
//             setError('');
//           }
//         });

//         hls.on(Hls.Events.ERROR, (event, data) => {
//           console.error('HLS Error Event:', data); // Always log full error data for debugging

//           if (data.fatal) {
//             setError(`Fatal Error: ${data.details}`);
//             setIsLoading(false);

//             switch (data.type) {
//               case Hls.ErrorTypes.NETWORK_ERROR:
//                 // For network errors, we retry.
//                 console.log('Fatal Network error, attempting to re-attach and reload...');
//                 setRetryCount(prev => prev + 1);
//                 retryTimeoutRef.current = setTimeout(() => initializeHls(true), RETRY_DELAY);
//                 break;
//               case Hls.ErrorTypes.MEDIA_ERROR:
//                 console.log('Fatal Media error, attempting to recover...');
//                 // Specifically for bufferAppendingError on audio, try more robust recovery
//                 if (data.details === Hls.ErrorDetails.BUFFER_APPEND_ERROR && data.parent === 'audio') {
//                     console.warn('Fatal audio buffer append error. Trying to swap audio codec or re-initialize HLS.');
//                     // Option 1: Try swapping audio codec (if source has alternatives)
//                     // hls.swapAudioCodec(); // This might help in rare cases
//                     // Option 2 (More robust): Destroy and re-initialize HLS
//                     hls.destroy();
//                     hlsRef.current = null; // Clear reference immediately
//                     setRetryCount(prev => prev + 1); // Increment retry count for this kind of fatal error
//                     retryTimeoutRef.current = setTimeout(() => initializeHls(true), RETRY_DELAY);
//                 } else {
//                     // For other media errors, try standard HLS recovery
//                     hls.recoverMediaError();
//                 }
//                 break;
//               default:
//                 console.log('Other fatal error, destroying HLS and trying to re-initialize...');
//                 hls.destroy();
//                 hlsRef.current = null; // Clear reference immediately
//                 setRetryCount(prev => prev + 1);
//                 retryTimeoutRef.current = setTimeout(() => initializeHls(true), RETRY_DELAY);
//                 break;
//             }
//           } else {
//             // Non-fatal errors
//             switch (data.details) {
//               case Hls.ErrorDetails.FRAG_GAP:
//                 console.log('Fragment gap detected (non-fatal, common for live streams startup).');
//                 // No specific action needed, HLS.js usually handles this
//                 break;
//               case Hls.ErrorDetails.BUFFER_APPENDING_ERROR:
//                 // This is the error we see frequently. If it's non-fatal, HLS.js might attempt recovery.
//                 // Log it, but don't set a hard error state unless it becomes fatal.
//                 console.warn(`Non-fatal buffer appending error (${data.sourceBufferName}):`, data.error);
//                 break;
//               case Hls.ErrorDetails.BUFFER_FULL_ERROR:
//                 console.warn('Buffer full error detected (non-fatal). HLS.js should handle eviction.');
//                 // Your manual flush attempt for BUFFER_FULL might be redundant or even disruptive if HLS.js is already doing it.
//                 // I've removed the explicit trigger for BUFFER_FLUSHING here, as HLS.js's internal buffer
//                 // management is usually quite good. If it truly becomes a problem, consider re-adding
//                 // this or looking into HLS.js source for how it handles full buffers.
//                 break;
//               case Hls.ErrorDetails.FRAG_LOAD_ERROR:
//               case Hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
//               case Hls.ErrorDetails.LEVEL_LOAD_ERROR:
//                 console.warn(`Non-fatal load error (${data.details}). HLS.js will retry automatically.`);
//                 break;
//               default:
//                 console.warn('Other non-fatal HLS error:', data.details);
//                 // Set a non-blocking error message if it's not a common transient warning.
//                 if (!['fragGap', 'fragLoadError', 'fragLoadTimeOut', 'bufferFullError', 'bufferAppendingError'].includes(data.details)) {
//                   setError(`Stream Warning: ${data.details}`);
//                 }
//                 break;
//             }
//           }
//         });

//         hls.attachMedia(video);
//         // Source is loaded after media is attached in MEDIA_ATTACHED event.
//       } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
//         // Native HLS playback for Safari/iOS
//         video.src = rtspUrl;
//         video.addEventListener('loadedmetadata', () => {
//           setIsLoading(false);
//           setVideoReady(true);
//           setRetryCount(0);
//           video.play().catch(e => console.error('Video play error (native HLS):', e));
//         });
//         video.addEventListener('error', (e) => {
//           const target = e.target as HTMLVideoElement;
//           setError(`Failed to load video stream (native HLS): ${target.error?.message || 'Unknown error'}`);
//           setIsLoading(false);
//         });
//       } else {
//         setError('HLS is not supported in this browser');
//         setIsLoading(false);
//       }
//     };

//     // Initial HLS setup
//     initializeHls();

//     // Video element event listeners
//     const handleLoadStart = () => {
//       setIsLoading(true);
//       console.log('Video: loadstart event');
//     };
//     const handleCanPlay = () => {
//       setIsLoading(false);
//       setVideoReady(true);
//       calculateVideoAndCanvasDimensions(); // Ensure dimensions are calculated when video is ready to play
//       console.log('Video: canplay event, videoReady set to true.');
//       video.play().catch(e => {
//         // This is fine, just log if another play request interrupts
//         if (e.name !== 'AbortError') {
//           console.warn('Video play error on canplay:', e);
//         }
//       });
//     };
//     const handleError = (e: Event) => {
//       const target = e.target as HTMLVideoElement;
//       console.error('Video playback error event (HTMLVideoElement):', target.error);
//       setError(`Video playback error: ${target.error?.message || 'Unknown error'}`);
//       setIsLoading(false);
//       // For persistent errors, consider re-initializing HLS after a delay here as well
//       if (hlsRef.current) { // Only if HLS was being used
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }
//       setRetryCount(prev => prev + 1);
//       retryTimeoutRef.current = setTimeout(() => initializeHls(true), RETRY_DELAY);
//     };
//     const handleWaiting = () => {
//       console.log('Video is buffering...');
//       setIsLoading(true); // Indicate buffering to user
//     };
//     const handlePlaying = () => {
//       console.log('Video is playing');
//       setIsLoading(false); // Clear buffering indicator
//       if (error && error.includes('Stream Error') || error.includes('Warning')) {
//         setError(''); // Clear stream-related warnings/errors if playback resumes
//       }
//     };
//     const handleMetadataLoaded = () => {
//         console.log('Video: loadedmetadata event. Recalculating dimensions.');
//         calculateVideoAndCanvasDimensions();
//     }

//     video.addEventListener('loadstart', handleLoadStart);
//     video.addEventListener('canplay', handleCanPlay);
//     video.addEventListener('error', handleError);
//     video.addEventListener('waiting', handleWaiting);
//     video.addEventListener('playing', handlePlaying);
//     video.addEventListener('loadedmetadata', handleMetadataLoaded); // Listen for metadata load to get intrinsic size
//     window.addEventListener('resize', calculateVideoAndCanvasDimensions);

//     return () => {
//       console.log('Cleaning up video player effects.');
//       if (hlsRef.current) {
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }
//       if (retryTimeoutRef.current) {
//         clearTimeout(retryTimeoutRef.current);
//         retryTimeoutRef.current = null;
//       }
//       // Remove all event listeners
//       video.removeEventListener('loadstart', handleLoadStart);
//       video.removeEventListener('canplay', handleCanPlay);
//       video.removeEventListener('error', handleError);
//       video.removeEventListener('waiting', handleWaiting);
//       video.removeEventListener('playing', handlePlaying);
//       video.removeEventListener('loadedmetadata', handleMetadataLoaded);
//       window.removeEventListener('resize', calculateVideoAndCanvasDimensions);
//     };
//   }, [rtspUrl, calculateVideoAndCanvasDimensions, retryCount, error]); // Added error and retryCount to dependencies for reactivity in initializeHls calls.

//   // Drawing effect (no major changes needed here, as the logic is robust)
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const video = videoRef.current;
//     const ctx = canvas?.getContext('2d');

//     if (!canvas || !video || !ctx || videoDimensions.width === 0 || !videoReady) {
//       console.debug('Drawing effect: Prerequisites not met (canvas/video/context/dimensions/ready).');
//       return;
//     }

//     const drawOverlay = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       ctx.save(); // Save context state

//       // Draw existing zones
//       zones.forEach(zone => {
//         if (zone.points.length < 3) {
//           console.debug(`Skipping zone "${zone.name}" as it has less than 3 points.`);
//           return;
//         }

//         ctx.beginPath();
//         ctx.moveTo(zone.points[0].x, zone.points[0].y);
//         zone.points.slice(1).forEach(point => {
//           ctx.lineTo(point.x, point.y);
//         });
//         ctx.closePath();

//         ctx.fillStyle = zone.color + '33'; // Semi-transparent
//         ctx.fill();

//         ctx.strokeStyle = zone.color;
//         ctx.lineWidth = 2;
//         ctx.stroke();

//         const xs = zone.points.map(p => p.x);
//         const ys = zone.points.map(p => p.y);
//         const minX = Math.min(...xs);
//         const minY = Math.min(...ys);
//         const maxX = Math.max(...xs);
//         const maxY = Math.max(...ys);
//         const labelX = (minX + maxX) / 2;
//         const labelY = (minY + maxY) / 2;

//         ctx.font = 'bold 14px Arial';
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';

//         const textMetrics = ctx.measureText(zone.name);
//         const textWidth = textMetrics.width;
//         const textHeight = 16;

//         ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
//         ctx.fillRect(labelX - textWidth / 2 - 4, labelY - textHeight / 2 - 2, textWidth + 8, textHeight + 4);

//         ctx.fillStyle = zone.color;
//         ctx.fillText(zone.name, labelX, labelY);
//         // console.debug(`Drawing existing zone: ${zone.name}`); // Moved to debug
//       });

//       // Draw current zone being drawn
//       if (isDrawingZone && currentZonePoints.length > 0) {
//         ctx.strokeStyle = '#00ff00';
//         ctx.lineWidth = 3;
//         ctx.fillStyle = '#00ff0033';
//         ctx.setLineDash([5, 5]);

//         if (currentZonePoints.length === 1) {
//           ctx.beginPath();
//           ctx.arc(currentZonePoints[0].x, currentZonePoints[0].y, 4, 0, 2 * Math.PI);
//           ctx.fillStyle = '#00ff00';
//           ctx.fill();
//         } else {
//           ctx.beginPath();
//           ctx.moveTo(currentZonePoints[0].x, currentZonePoints[0].y);
//           currentZonePoints.slice(1).forEach(point => {
//             ctx.lineTo(point.x, point.y);
//           });

//           if (currentZonePoints.length > 2) {
//             ctx.closePath();
//             ctx.fill();
//           }
//           ctx.stroke();

//           currentZonePoints.forEach((point, index) => {
//             ctx.beginPath();
//             ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
//             ctx.fillStyle = index === 0 ? '#ff0000' : '#00ff00';
//             ctx.fill();
//             ctx.strokeStyle = '#ffffff';
//             ctx.lineWidth = 1;
//             ctx.stroke();
//           });
//         }
//         ctx.setLineDash([]);
//         // console.debug('Drawing current zone in progress'); // Moved to debug
//       }

//       // Draw vehicle detections
//       vehicleDetections.forEach(detection => {
//         const originalVideoWidth = video.videoWidth || 1;
//         const originalVideoHeight = video.videoHeight || 1;

//         const scaleX = videoDimensions.width / originalVideoWidth;
//         const scaleY = videoDimensions.height / originalVideoHeight;

//         const x = detection.x * scaleX;
//         const y = detection.y * scaleY;
//         const width = detection.width * scaleX;
//         const height = detection.height * scaleY;

//         ctx.strokeStyle = '#ff0000';
//         ctx.lineWidth = 3;
//         ctx.strokeRect(x, y, width, height);

//         ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
//         const label = `Vehicle ${detection.confidence.toFixed(2)}`;
//         ctx.font = '12px Arial';
//         const labelWidth = ctx.measureText(label).width;
//         ctx.fillRect(x, y - 20, labelWidth + 8, 18);

//         ctx.fillStyle = '#ffffff';
//         ctx.fillText(label, x + 4, y - 6);
//         // console.debug('Drawing vehicle detection:', detection); // Moved to debug
//       });

//       ctx.restore();
//     };

//     const animate = () => {
//       drawOverlay();
//       animationFrameRef.current = requestAnimationFrame(animate);
//     };

//     animationFrameRef.current = requestAnimationFrame(animate);

//     return () => {
//       console.log('Cleaning up animation frame.');
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//         animationFrameRef.current = null;
//       }
//     };
//   }, [zones, vehicleDetections, isDrawingZone, currentZonePoints, videoReady, videoDimensions]);

//   const getStatusMessage = () => {
//     if (isLoading) {
//       if (error) return error; // Show error even if loading
//       return 'Loading stream...';
//     }
//     if (error) return error;
//     if (retryCount > 0) return `Retrying connection... (${retryCount}/${MAX_RETRIES})`;
//     return null;
//   };

//   return (
//     <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
//       <video
//         ref={videoRef}
//         className="w-full h-full object-contain"
//         controls={false}
//         muted
//         playsInline
//         onContextMenu={(e) => e.preventDefault()}
//       />

//       <canvas
//         ref={canvasRef}
//         className="absolute cursor-crosshair"
//         onClick={handleCanvasClick}
//         style={{ pointerEvents: isDrawingZone ? 'auto' : 'none' }}
//       />

//       {(isLoading || error || retryCount > 0) && (
//         <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"> {/* Added z-10 */}
//           <div className="text-white text-center">
//             {isLoading && !error && ( // Only show spinner if genuinely loading and no error
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
//             )}
//             <p className={error ? 'text-red-400' : 'text-white'}>
//               {getStatusMessage()}
//             </p>
//             {retryCount > 0 && (
//               <p className="text-sm text-gray-400 mt-1">
//                 Stream may take a moment to stabilize...
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//       {videoReady && !error && (
//         <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10"> {/* Added z-10 */}
//           Active
//           {retryCount > 0 && (
//             <span className="ml-2 text-yellow-400">
//               (Reconnecting...)
//             </span>
//           )}
//         </div>
//       )}

//       {isDrawingZone && (
//         <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-3 py-2 rounded z-10"> {/* Added z-10 */}
//           <p>Click to add points • {currentZonePoints.length} points added</p>
//           <p className="text-green-400">Need at least 3 points to create zone</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoPlayer;

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Zone, VehicleDetection } from '@/types/monitoring';

interface VideoPlayerProps {
  rtspUrl: string;
  zones: Zone[];
  vehicleDetections: VehicleDetection[];
  isDrawingZone: boolean;
  currentZonePoints: { x: number; y: number }[];
  onVideoClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  rtspUrl,
  zones,
  vehicleDetections,
  isDrawingZone,
  currentZonePoints,
  onVideoClick
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [videoReady, setVideoReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number | null>(null);

  const MAX_RETRIES = 10;
  const RETRY_DELAY = 3000;

  const calculateVideoAndCanvasDimensions = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const containerWidth = video.clientWidth;
    const containerHeight = video.clientHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let actualVideoWidth = containerWidth;
    let actualVideoHeight = containerHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (videoAspectRatio > containerAspectRatio) {
      actualVideoHeight = containerWidth / videoAspectRatio;
      offsetY = (containerHeight - actualVideoHeight) / 2;
    } else {
      actualVideoWidth = containerHeight * videoAspectRatio;
      offsetX = (containerWidth - actualVideoWidth) / 2;
    }

    setVideoDimensions({ width: actualVideoWidth, height: actualVideoHeight });
    canvas.width = actualVideoWidth;
    canvas.height = actualVideoHeight;
    canvas.style.left = `${offsetX}px`;
    canvas.style.top = `${offsetY}px`;
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingZone) {
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || videoDimensions.width === 0) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const clickXOnCanvas = event.clientX - rect.left;
    const clickYOnCanvas = event.clientY - rect.top;

    const originalVideoWidth = video.videoWidth;
    const originalVideoHeight = video.videoHeight;

    const scaleFactorX = originalVideoWidth / videoDimensions.width;
    const scaleFactorY = originalVideoHeight / videoDimensions.height;

    const originalVideoX = clickXOnCanvas * scaleFactorX;
    const originalVideoY = clickYOnCanvas * scaleFactorY;

    const syntheticEvent = {
      ...event,
      clientX: originalVideoX,
      clientY: originalVideoY,
      currentTarget: {
        ...event.currentTarget,
        getBoundingClientRect: () => ({
          left: 0, top: 0, width: originalVideoWidth, height: originalVideoHeight,
          x: 0, y: 0, right: originalVideoWidth, bottom: originalVideoHeight
        })
      }
    } as React.MouseEvent<HTMLCanvasElement>;

    onVideoClick(syntheticEvent);
  }, [isDrawingZone, onVideoClick, videoDimensions]);


  useEffect(() => {
    const video = videoRef.current;
    if (!video || !rtspUrl) {
      return;
    }

    setIsLoading(true);
    setError('');
    setVideoReady(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const initializeHls = (attemptRetry = false) => {
      if (attemptRetry && retryCount >= MAX_RETRIES) {
        setError('Failed to load video stream after multiple attempts.');
        setIsLoading(false);
        return;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 1000,
          fragLoadingMaxRetryTimeout: 64000,
          maxStarvationDelay: 4,
          maxLoadingDelay: 4,
          startLevel: -1,
          capLevelToPlayerSize: true,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 6,
          manifestLoadingRetryDelay: 1000,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 6,
          levelLoadingRetryDelay: 1000,
        });

        hlsRef.current = hls;

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(rtspUrl);
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          setIsLoading(false);
          setRetryCount(0);
          video.play().catch(e => {
            if (e.name !== 'AbortError') {
              setError(`Video playback issue: ${e.message}`);
            }
          });
        });

        hls.on(Hls.Events.LEVEL_LOADED, () => {
          if (!videoReady) {
            setVideoReady(true);
          }
        });

        hls.on(Hls.Events.FRAG_LOADED, () => {
          if (error && error.includes('Stream Error') && !isLoading) {
            setError('');
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setError(`Fatal Error: ${data.details}`);
            setIsLoading(false);

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setRetryCount(prev => prev + 1);
                retryTimeoutRef.current = setTimeout(() => initializeHls(true), RETRY_DELAY);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                if (data.details === Hls.ErrorDetails.BUFFER_APPEND_ERROR && data.parent === 'audio') {
                    hls.destroy();
                    hlsRef.current = null;
                    setRetryCount(prev => prev + 1);
                    retryTimeoutRef.current = setTimeout(() => initializeHls(true), RETRY_DELAY);
                } else {
                    hls.recoverMediaError();
                }
                break;
              default:
                hls.destroy();
                hlsRef.current = null;
                setRetryCount(prev => prev + 1);
                retryTimeoutRef.current = setTimeout(() => initializeHls(true), RETRY_DELAY);
                break;
            }
          } else {
            switch (data.details) {
              case Hls.ErrorDetails.FRAG_GAP:
                break;
              case Hls.ErrorDetails.BUFFER_APPENDING_ERROR:
                break;
              case Hls.ErrorDetails.BUFFER_FULL_ERROR:
                break;
              case Hls.ErrorDetails.FRAG_LOAD_ERROR:
              case Hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
              case Hls.ErrorDetails.LEVEL_LOAD_ERROR:
                break;
              default:
                if (!['fragGap', 'fragLoadError', 'fragLoadTimeOut', 'bufferFullError', 'bufferAppendingError'].includes(data.details)) {
                  setError(`Stream Warning: ${data.details}`);
                }
                break;
            }
          }
        });

        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = rtspUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          setVideoReady(true);
          setRetryCount(0);
          video.play().catch(e => {});
        });
        video.addEventListener('error', (e) => {
          const target = e.target as HTMLVideoElement;
          setError(`Failed to load video stream (native HLS): ${target.error?.message || 'Unknown error'}`);
          setIsLoading(false);
        });
      } else {
        setError('HLS is not supported in this browser');
        setIsLoading(false);
      }
    };

    initializeHls();

    const handleLoadStart = () => {
      setIsLoading(true);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setVideoReady(true);
      calculateVideoAndCanvasDimensions();
      video.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.warn('Video play error on canplay:', e);
        }
      });
    };
    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      setError(`Video playback error: ${target.error?.message || 'Unknown error'}`);
      setIsLoading(false);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setRetryCount(prev => prev + 1);
      retryTimeoutRef.current = setTimeout(() => initializeHls(true), RETRY_DELAY);
    };
    const handleWaiting = () => {
      setIsLoading(true);
    };
    const handlePlaying = () => {
      setIsLoading(false);
      if (error && error.includes('Stream Error') || error.includes('Warning')) {
        setError('');
      }
    };
    const handleMetadataLoaded = () => {
        calculateVideoAndCanvasDimensions();
    }

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('loadedmetadata', handleMetadataLoaded);
    window.addEventListener('resize', calculateVideoAndCanvasDimensions);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('loadedmetadata', handleMetadataLoaded);
      window.removeEventListener('resize', calculateVideoAndCanvasDimensions);
    };
  }, [rtspUrl, calculateVideoAndCanvasDimensions, retryCount, error]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !video || !ctx || videoDimensions.width === 0 || !videoReady) {
      return;
    }

    const drawOverlay = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();

      zones.forEach(zone => {
        if (zone.points.length < 3) {
          return;
        }

        ctx.beginPath();
        ctx.moveTo(zone.points[0].x, zone.points[0].y);
        zone.points.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();

        ctx.fillStyle = zone.color + '33';
        ctx.fill();

        ctx.strokeStyle = zone.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        const xs = zone.points.map(p => p.x);
        const ys = zone.points.map(p => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        const labelX = (minX + maxX) / 2;
        const labelY = (minY + maxY) / 2;

        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textMetrics = ctx.measureText(zone.name);
        const textWidth = textMetrics.width;
        const textHeight = 16;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(labelX - textWidth / 2 - 4, labelY - textHeight / 2 - 2, textWidth + 8, textHeight + 4);

        ctx.fillStyle = zone.color;
        ctx.fillText(zone.name, labelX, labelY);
      });

      if (isDrawingZone && currentZonePoints.length > 0) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.fillStyle = '#00ff0033';
        ctx.setLineDash([5, 5]);

        if (currentZonePoints.length === 1) {
          ctx.beginPath();
          ctx.arc(currentZonePoints[0].x, currentZonePoints[0].y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#00ff00';
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(currentZonePoints[0].x, currentZonePoints[0].y);
          currentZonePoints.slice(1).forEach(point => {
            ctx.lineTo(point.x, point.y);
          });

          if (currentZonePoints.length > 2) {
            ctx.closePath();
            ctx.fill();
          }
          ctx.stroke();

          currentZonePoints.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = index === 0 ? '#ff0000' : '#00ff00';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        }
        ctx.setLineDash([]);
      }

      vehicleDetections.forEach(detection => {
        const originalVideoWidth = video.videoWidth || 1;
        const originalVideoHeight = video.videoHeight || 1;

        const scaleX = videoDimensions.width / originalVideoWidth;
        const scaleY = videoDimensions.height / originalVideoHeight;

        const x = detection.x * scaleX;
        const y = detection.y * scaleY;
        const width = detection.width * scaleX;
        const height = detection.height * scaleY;

        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        const label = `Vehicle ${detection.confidence.toFixed(2)}`;
        ctx.font = '12px Arial';
        const labelWidth = ctx.measureText(label).width;
        ctx.fillRect(x, y - 20, labelWidth + 8, 18);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 4, y - 6);
      });

      ctx.restore();
    };

    const animate = () => {
      drawOverlay();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [zones, vehicleDetections, isDrawingZone, currentZonePoints, videoReady, videoDimensions]);

  const getStatusMessage = () => {
    if (isLoading) {
      if (error) return error;
      return 'Loading stream...';
    }
    if (error) return error;
    if (retryCount > 0) return `Retrying connection... (${retryCount}/${MAX_RETRIES})`;
    return null;
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={false}
        muted
        playsInline
        onContextMenu={(e) => e.preventDefault()}
      />

      <canvas
        ref={canvasRef}
        className="absolute cursor-crosshair"
        onClick={handleCanvasClick}
        style={{ pointerEvents: isDrawingZone ? 'auto' : 'none' }}
      />

      {(isLoading || error || retryCount > 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white text-center">
            {isLoading && !error && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            )}
            <p className={error ? 'text-red-400' : 'text-white'}>
              {getStatusMessage()}
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Stream may take a moment to stabilize...
              </p>
            )}
          </div>
        </div>
      )}

      {videoReady && !error && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
          Active
          {retryCount > 0 && (
            <span className="ml-2 text-yellow-400">
              (Reconnecting...)
            </span>
          )}
        </div>
      )}

      {isDrawingZone && (
        <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-3 py-2 rounded z-10">
          <p>Click to add points • {currentZonePoints.length} points added</p>
          <p className="text-green-400">Need at least 3 points to create zone</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;