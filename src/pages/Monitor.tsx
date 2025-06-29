

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { ArrowLeft, AlertCircle } from 'lucide-react';
// import { toast } from '@/hooks/use-toast';
// import VideoPlayer from '@/components/VideoPlayer';
// import ZonePanel from '@/components/ZonePanel';
// import { Zone, VehicleDetection } from '@/types/monitoring';
// import Hls from 'hls.js'; // Import Hls for VideoPlayer

// const Monitor = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { camera } = location.state || {};

//   const [rtspInput, setRtspInput] = useState(camera?.rtspUrl || '');
//   const [streamUrl, setStreamUrl] = useState('');
//   const [zones, setZones] = useState<Zone[]>([]);
//   const [isDrawingZone, setIsDrawingZone] = useState(false);
//   const [currentZonePoints, setCurrentZonePoints] = useState<{ x: number; y: number }[]>([]);
//   const [newZoneName, setNewZoneName] = useState('');
//   const [vehicleDetections, setVehicleDetections] = useState<VehicleDetection[]>([]);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [streamError, setStreamError] = useState('');

//   useEffect(() => {
//     if (!camera) {
//       navigate('/dashboard');
//       return;
//     }

//     const storedZones = localStorage.getItem(`zones_${camera.id}`);
//     if (storedZones) {
//       try {
//         setZones(JSON.parse(storedZones));
//       } catch (error) {
//         console.error('Failed to load stored zones:', error);
//         setZones([]);
//       }
//     }

//     if (camera.rtspUrl) {
//       handleRTSPSubmit(camera.rtspUrl);
//     }
//   }, [camera, navigate]);

//   const handleVideoClick = (event: React.MouseEvent<HTMLDivElement>) => {
//     if (!isDrawingZone) return;

//     // Get the bounding rectangle of the canvas element
//     const rect = event.currentTarget.getBoundingClientRect();
//     // Calculate coordinates relative to the canvas
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;

//     console.log('Adding zone point:', { x, y });
//     setCurrentZonePoints(prev => [...prev, { x, y }]);
//   };

//   const finishDrawingZone = () => {
//     if (currentZonePoints.length < 3) {
//       toast({
//         title: 'Invalid zone',
//         description: 'Zone must have at least 3 points',
//         variant: 'destructive'
//       });
//       return;
//     }

//     if (!newZoneName.trim()) {
//       toast({
//         title: 'Zone name required',
//         description: 'Please enter a name for the zone',
//         variant: 'destructive'
//       });
//       return;
//     }

//     // Generate a random color for the zone
//     const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];
//     const randomColor = colors[Math.floor(Math.random() * colors.length)];

//     const newZone: Zone = {
//       id: Date.now().toString(),
//       name: newZoneName.trim(),
//       points: [...currentZonePoints], // Create a copy of the points
//       color: randomColor,
//       vehicleCount: 0,
//     };

//     console.log('Creating new zone:', newZone);

//     const updatedZones = [...zones, newZone];
//     setZones(updatedZones);

//     // Save to localStorage
//     try {
//       localStorage.setItem(`zones_${camera.id}`, JSON.stringify(updatedZones));
//     } catch (error) {
//       console.error('Failed to save zones to localStorage:', error);
//     }

//     // Reset drawing state
//     setIsDrawingZone(false);
//     setCurrentZonePoints([]);
//     setNewZoneName('');

//     toast({
//       title: 'Zone created',
//       description: `Zone "${newZoneName}" has been created successfully`
//     });
//   };

//   const startDrawingZone = () => {
//     console.log('Starting zone drawing mode');
//     setIsDrawingZone(true);
//     setCurrentZonePoints([]);
//     setNewZoneName('');
//   };

//   const cancelDrawingZone = () => {
//     console.log('Cancelling zone drawing');
//     setIsDrawingZone(false);
//     setCurrentZonePoints([]);
//     setNewZoneName('');
//   };

//   const handleDeleteZone = (zoneId: string) => {
//     const zoneToDelete = zones.find(zone => zone.id === zoneId);
//     const updatedZones = zones.filter(zone => zone.id !== zoneId);
//     setZones(updatedZones);

//     try {
//       localStorage.setItem(`zones_${camera.id}`, JSON.stringify(updatedZones));
//     } catch (error) {
//       console.error('Failed to save zones after deletion:', error);
//     }

//     toast({
//       title: 'Zone deleted',
//       description: `Zone "${zoneToDelete?.name || 'Unknown'}" has been removed`
//     });
//   };

//   const handleUpdateZoneName = (zoneId: string, newName: string) => {
//     const updatedZones = zones.map(zone =>
//       zone.id === zoneId ? { ...zone, name: newName.trim() } : zone
//     );
//     setZones(updatedZones);

//     try {
//       localStorage.setItem(`zones_${camera.id}`, JSON.stringify(updatedZones));
//     } catch (error) {
//       console.error('Failed to save zones after name update:', error);
//     }
//   };

//   const convertRtspToHls = (rtspUrl: string) => {
//     const urlParts = rtspUrl.split('/');
//     const streamPath = urlParts[urlParts.length - 1];
//     return `http://localhost:8888/${streamPath}/index.m3u8`;
//   };

//   const handleRTSPSubmit = (inputUrl?: string) => {
//     const url = inputUrl || rtspInput;

//     if (!url.startsWith('rtsp://')) {
//       toast({
//         title: 'Invalid URL',
//         description: 'Please enter a valid RTSP URL starting with rtsp://',
//         variant: 'destructive'
//       });
//       return;
//     }

//     setIsStreaming(true);
//     setStreamError('');

//     try {
//       const hlsUrl = convertRtspToHls(url);
//       setStreamUrl(hlsUrl);

//       toast({
//         title: 'Stream configured',
//         description: 'RTSP stream has been configured for HLS playback'
//       });

//       console.log('RTSP URL:', url);
//       console.log('HLS URL:', hlsUrl);

//     } catch (error) {
//       console.error('Failed to configure stream:', error);
//       setStreamError('Failed to configure stream');
//       toast({
//         title: 'Stream failed',
//         description: 'Failed to configure RTSP stream',
//         variant: 'destructive'
//       });
//     } finally {
//       setIsStreaming(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center">
//             <Button
//               variant="ghost"
//               onClick={() => navigate('/dashboard')}
//               className="mr-4 text-white hover:bg-white/20"
//             >
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Dashboard
//             </Button>
//             <div>
//               <h1 className="text-2xl font-bold text-white">{camera?.name || 'RTSP Stream Monitor'}</h1>
//               {rtspInput && (
//                 <p className="text-sm text-gray-400">Source: {rtspInput}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="mb-4">
//           {/* <div className="flex gap-2 mb-2">
//             <Input
//               value={rtspInput}
//               onChange={e => setRtspInput(e.target.value)}
//               placeholder="Enter RTSP stream URL (rtsp://username:password@ip:port/path)"
//               className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
//               disabled={isStreaming}
//             />
//             <Button
//               onClick={() => handleRTSPSubmit()}
//               className="bg-indigo-600 hover:bg-indigo-700"
//               disabled={isStreaming || !rtspInput.trim()}
//             >
//               {isStreaming ? 'Configuring...' : 'Configure Stream'}
//             </Button>
//           </div> */}

//           {streamError && (
//             <div className="flex items-center gap-2 text-red-400 text-sm">
//               <AlertCircle className="w-4 h-4" />
//               <span>{streamError}</span>
//             </div>
//           )}

//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             <Card className="bg-white/10 backdrop-blur-md border-white/20">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center justify-between">
//                   <span>Live Feed</span>
//                   {streamUrl && (
//                     <span className="text-sm text-green-400 flex items-center gap-1">

//                     </span>
//                   )}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {streamUrl ? (
//                   <VideoPlayer
//                     rtspUrl={streamUrl}
//                     zones={zones}
//                     vehicleDetections={vehicleDetections}
//                     isDrawingZone={isDrawingZone}
//                     currentZonePoints={currentZonePoints}
//                     onVideoClick={handleVideoClick}
//                   />
//                 ) : (
//                   <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center">
//                     <div className="text-center text-gray-400">
//                       <p className="text-lg mb-2">No stream active</p>
//                       <p className="text-sm">Enter an RTSP URL above to configure streaming</p>
//                     </div>
//                   </div>
//                 )}

//                 {streamUrl && (
//                   <>
//                     {isDrawingZone ? (
//                       <div className="mt-4 space-y-4">
//                         <Input
//                           placeholder="Enter zone name"
//                           value={newZoneName}
//                           onChange={e => setNewZoneName(e.target.value)}
//                           className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
//                         />
//                         <div className="flex space-x-2">
//                           <Button onClick={finishDrawingZone} className="bg-green-600 hover:bg-green-700">
//                             Finish Zone ({currentZonePoints.length} points)
//                           </Button>
//                           <Button variant="outline" onClick={cancelDrawingZone} className="border-white/20 text-white hover:bg-white/20">
//                             Cancel
//                           </Button>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="mt-4">
//                         <Button onClick={startDrawingZone} className="bg-blue-600 hover:bg-blue-700">
//                           Draw New Zone
//                         </Button>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </CardContent>
//             </Card>
//           </div>

//           <div>
//             <ZonePanel
//               zones={zones}
//               vehicleDetections={vehicleDetections}
//               onDeleteZone={handleDeleteZone}
//               onUpdateZoneName={handleUpdateZoneName}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Monitor;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import VideoPlayer from '@/components/VideoPlayer';
import ZonePanel from '@/components/ZonePanel';
import { Zone, VehicleDetection } from '@/types/monitoring';
import Hls from 'hls.js'; // Import Hls for VideoPlayer

const Monitor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { camera } = location.state || {};

  const [rtspInput, setRtspInput] = useState(camera?.rtspUrl || '');
  const [streamUrl, setStreamUrl] = useState('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const [currentZonePoints, setCurrentZonePoints] = useState<{ x: number; y: number }[]>([]);
  const [newZoneName, setNewZoneName] = useState('');
  const [vehicleDetections, setVehicleDetections] = useState<VehicleDetection[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState('');

  useEffect(() => {
    if (!camera) {
      navigate('/dashboard');
      return;
    }

    const storedZones = localStorage.getItem(`zones_${camera.id}`);
    if (storedZones) {
      try {
        setZones(JSON.parse(storedZones));
      } catch (error) {
        console.error('Failed to load stored zones:', error);
        setZones([]);
      }
    }

    if (camera.rtspUrl) {
      handleRTSPSubmit(camera.rtspUrl);
    }
  }, [camera, navigate]);

  const handleVideoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingZone) return;

    // Get the bounding rectangle of the canvas element
    const rect = event.currentTarget.getBoundingClientRect();
    // Calculate coordinates relative to the canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log('Adding zone point:', { x, y });
    setCurrentZonePoints(prev => [...prev, { x, y }]);
  };

  const finishDrawingZone = () => {
    if (currentZonePoints.length < 3) {
      toast({
        title: 'Invalid zone',
        description: 'Zone must have at least 3 points',
        variant: 'destructive'
      });
      return;
    }

    if (!newZoneName.trim()) {
      toast({
        title: 'Zone name required',
        description: 'Please enter a name for the zone',
        variant: 'destructive'
      });
      return;
    }

    // Generate a random color for the zone
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newZone: Zone = {
      id: Date.now().toString(),
      name: newZoneName.trim(),
      points: [...currentZonePoints], // Create a copy of the points
      color: randomColor,
      vehicleCount: 0,
    };

    console.log('Creating new zone:', newZone);

    const updatedZones = [...zones, newZone];
    setZones(updatedZones);

    // Save to localStorage
    try {
      localStorage.setItem(`zones_${camera.id}`, JSON.stringify(updatedZones));
    } catch (error) {
      console.error('Failed to save zones to localStorage:', error);
    }

    // Reset drawing state
    setIsDrawingZone(false);
    setCurrentZonePoints([]);
    setNewZoneName('');

    toast({
      title: 'Zone created',
      description: `Zone "${newZoneName}" has been created successfully`
    });
  };

  const startDrawingZone = () => {
    console.log('Starting zone drawing mode');
    setIsDrawingZone(true);
    setCurrentZonePoints([]);
    setNewZoneName('');
  };

  const cancelDrawingZone = () => {
    console.log('Cancelling zone drawing');
    setIsDrawingZone(false);
    setCurrentZonePoints([]);
    setNewZoneName('');
  };

  const handleDeleteZone = (zoneId: string) => {
    const zoneToDelete = zones.find(zone => zone.id === zoneId);
    const updatedZones = zones.filter(zone => zone.id !== zoneId);
    setZones(updatedZones);

    try {
      localStorage.setItem(`zones_${camera.id}`, JSON.stringify(updatedZones));
    } catch (error) {
      console.error('Failed to save zones after deletion:', error);
    }

    toast({
      title: 'Zone deleted',
      description: `Zone "${zoneToDelete?.name || 'Unknown'}" has been removed`
    });
  };

  const handleUpdateZoneName = (zoneId: string, newName: string) => {
    const updatedZones = zones.map(zone =>
      zone.id === zoneId ? { ...zone, name: newName.trim() } : zone
    );
    setZones(updatedZones);

    try {
      localStorage.setItem(`zones_${camera.id}`, JSON.stringify(updatedZones));
    } catch (error) {
      console.error('Failed to save zones after name update:', error);
    }
  };

  const convertRtspToHls = (rtspUrl: string) => {
    try {
      const url = new URL(rtspUrl);
      const hostname = url.hostname;
      const rtspPort = url.port ? parseInt(url.port, 10) : 554; // Default RTSP port is 554

      // Assuming a consistent mapping: HLS port = RTSP port - 474
      // You might need to adjust this calculation or make it configurable
      const hlsPort = rtspPort - 474; // For example: 8554 - 474 = 8080, 8555 - 474 = 8081

      const streamPath = url.pathname.substring(1); // Remove leading slash

      return `http://${hostname}:${hlsPort}/${streamPath}/index.m3u8`;
    } catch (error) {
      console.error('Error parsing RTSP URL:', error);
      throw new Error('Invalid RTSP URL format');
    }
  };

  const handleRTSPSubmit = (inputUrl?: string) => {
    const url = inputUrl || rtspInput;

    if (!url.startsWith('rtsp://')) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid RTSP URL starting with rtsp://',
        variant: 'destructive'
      });
      return;
    }

    setIsStreaming(true);
    setStreamError('');

    try {
      const hlsUrl = convertRtspToHls(url);
      setStreamUrl(hlsUrl);

      toast({
        title: 'Stream configured',
        description: 'RTSP stream has been configured for HLS playback'
      });

      console.log('RTSP URL:', url);
      console.log('HLS URL:', hlsUrl);

    } catch (error) {
      console.error('Failed to configure stream:', error);
      setStreamError(`Failed to configure stream: ${error.message}`);
      toast({
        title: 'Stream failed',
        description: `Failed to configure RTSP stream: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{camera?.name || 'RTSP Stream Monitor'}</h1>
              {rtspInput && (
                <p className="text-sm text-gray-400">Source: {rtspInput}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          {streamError && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{streamError}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Live Feed</span>
                  {streamUrl && (
                    <span className="text-sm text-green-400 flex items-center gap-1">
                      {/* You can add a status indicator here if needed */}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {streamUrl ? (
                  <VideoPlayer
                    rtspUrl={streamUrl} // This is actually the HLS URL now
                    zones={zones}
                    vehicleDetections={vehicleDetections}
                    isDrawingZone={isDrawingZone}
                    currentZonePoints={currentZonePoints}
                    onVideoClick={handleVideoClick}
                  />
                ) : (
                  <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <p className="text-lg mb-2">No stream active</p>
                      <p className="text-sm">Enter an RTSP URL above to configure streaming</p>
                    </div>
                  </div>
                )}

                {streamUrl && (
                  <>
                    {isDrawingZone ? (
                      <div className="mt-4 space-y-4">
                        <Input
                          placeholder="Enter zone name"
                          value={newZoneName}
                          onChange={e => setNewZoneName(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                        <div className="flex space-x-2">
                          <Button onClick={finishDrawingZone} className="bg-green-600 hover:bg-green-700">
                            Finish Zone ({currentZonePoints.length} points)
                          </Button>
                          <Button variant="outline" onClick={cancelDrawingZone} className="border-white/20 text-white hover:bg-white/20">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <Button onClick={startDrawingZone} className="bg-blue-600 hover:bg-blue-700">
                          Draw New Zone
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <ZonePanel
              zones={zones}
              vehicleDetections={vehicleDetections}
              onDeleteZone={handleDeleteZone}
              onUpdateZoneName={handleUpdateZoneName}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitor;