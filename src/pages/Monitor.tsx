
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import VideoPlayer from '@/components/VideoPlayer';
import ZonePanel from '@/components/ZonePanel';
import { Zone, VehicleDetection } from '@/types/monitoring';

const Monitor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { camera } = location.state || {};
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const [currentZonePoints, setCurrentZonePoints] = useState<{x: number, y: number}[]>([]);
  const [newZoneName, setNewZoneName] = useState('');
  const [vehicleDetections, setVehicleDetections] = useState<VehicleDetection[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!camera) {
      navigate('/dashboard');
      return;
    }

    // Load zones from localStorage
    const storedZones = localStorage.getItem(`zones_${camera.id}`);
    if (storedZones) {
      setZones(JSON.parse(storedZones));
    }

    // Simulate vehicle detections
    const interval = setInterval(() => {
      const mockDetection: VehicleDetection = {
        id: Date.now().toString(),
        type: ['car', 'truck', 'motorcycle', 'bus'][Math.floor(Math.random() * 4)] as any,
        confidence: 0.8 + Math.random() * 0.2,
        boundingBox: {
          x: Math.random() * 600,
          y: Math.random() * 300,
          width: 80 + Math.random() * 40,
          height: 60 + Math.random() * 30
        },
        speed: Math.floor(Math.random() * 50) + 20,
        timestamp: new Date().toISOString()
      };
      
      setVehicleDetections(prev => [...prev.slice(-4), mockDetection]);
    }, 3000);

    return () => clearInterval(interval);
  }, [camera, navigate]);

  const handleVideoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingZone) return;

    const x = (event as any).clientX;
    const y = (event as any).clientY;

    setCurrentZonePoints(prev => [...prev, { x, y }]);
  };

  const finishDrawingZone = () => {
    if (currentZonePoints.length < 3) {
      toast({
        title: "Invalid zone",
        description: "Zone must have at least 3 points",
        variant: "destructive",
      });
      return;
    }

    if (!newZoneName.trim()) {
      toast({
        title: "Zone name required",
        description: "Please enter a name for the zone",
        variant: "destructive",
      });
      return;
    }

    const newZone: Zone = {
      id: Date.now().toString(),
      name: newZoneName,
      points: currentZonePoints,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      vehicleCount: 0,
    };

    const updatedZones = [...zones, newZone];
    setZones(updatedZones);
    localStorage.setItem(`zones_${camera.id}`, JSON.stringify(updatedZones));

    setIsDrawingZone(false);
    setCurrentZonePoints([]);
    setNewZoneName('');

    toast({
      title: "Zone created",
      description: `Zone "${newZoneName}" has been created`,
    });
  };

  const startDrawingZone = () => {
    setIsDrawingZone(true);
    setCurrentZonePoints([]);
  };

  const cancelDrawingZone = () => {
    setIsDrawingZone(false);
    setCurrentZonePoints([]);
    setNewZoneName('');
  };

  const handleDeleteZone = (zoneId: string) => {
    const updatedZones = zones.filter(zone => zone.id !== zoneId);
    setZones(updatedZones);
    localStorage.setItem(`zones_${camera.id}`, JSON.stringify(updatedZones));
    
    toast({
      title: "Zone deleted",
      description: "Zone has been removed",
    });
  };

  const handleUpdateZoneName = (zoneId: string, newName: string) => {
    const updatedZones = zones.map(zone =>
      zone.id === zoneId ? { ...zone, name: newName } : zone
    );
    setZones(updatedZones);
    localStorage.setItem(`zones_${camera.id}`, JSON.stringify(updatedZones));
  };

  if (!camera) {
    return <div>Loading...</div>;
  }

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
              <h1 className="text-2xl font-bold text-white">{camera.name}</h1>
              <p className="text-gray-300">{camera.rtspUrl}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Live Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer
                  rtspUrl={camera.rtspUrl}
                  zones={zones}
                  vehicleDetections={vehicleDetections}
                  isDrawingZone={isDrawingZone}
                  currentZonePoints={currentZonePoints}
                  onVideoClick={handleVideoClick}
                  isPlaying={isPlaying}
                />
                
                {isDrawingZone && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Input
                        placeholder="Enter zone name"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={finishDrawingZone} className="bg-green-600 hover:bg-green-700">
                        Finish Zone ({currentZonePoints.length} points)
                      </Button>
                      <Button variant="outline" onClick={cancelDrawingZone} className="border-white/20 text-white hover:bg-white/20">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {!isDrawingZone && (
                  <div className="mt-4">
                    <Button onClick={startDrawingZone} className="bg-blue-600 hover:bg-blue-700">
                      Draw New Zone
                    </Button>
                  </div>
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
