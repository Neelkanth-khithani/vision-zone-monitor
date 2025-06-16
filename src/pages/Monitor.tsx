
import React, { useState, useEffect, useRef } from 'react';
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
    const savedZones = localStorage.getItem(`zones_${camera.id}`);
    if (savedZones) {
      setZones(JSON.parse(savedZones));
    }

    // Start mock vehicle detection
    startMockDetection();
  }, [camera, navigate]);

  const startMockDetection = () => {
    const interval = setInterval(() => {
      if (!isPlaying) return;
      
      // Generate mock vehicle detections
      const mockDetections: VehicleDetection[] = [];
      const vehicleTypes = ['car', 'truck', 'motorcycle', 'bus'];
      
      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        mockDetections.push({
          id: `vehicle_${Date.now()}_${i}`,
          type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
          confidence: 0.7 + Math.random() * 0.3,
          boundingBox: {
            x: Math.random() * 600,
            y: Math.random() * 400,
            width: 50 + Math.random() * 100,
            height: 30 + Math.random() * 80,
          },
          speed: Math.floor(Math.random() * 60) + 10,
          timestamp: new Date().toISOString(),
        });
      }
      
      setVehicleDetections(mockDetections);
    }, 2000);

    return () => clearInterval(interval);
  };

  const handleVideoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingZone) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCurrentZonePoints([...currentZonePoints, { x, y }]);
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
      description: `Zone "${newZone.name}" has been created`,
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

  const deleteZone = (zoneId: string) => {
    const updatedZones = zones.filter(zone => zone.id !== zoneId);
    setZones(updatedZones);
    localStorage.setItem(`zones_${camera.id}`, JSON.stringify(updatedZones));
    
    toast({
      title: "Zone deleted",
      description: "Zone has been removed",
    });
  };

  const updateZoneName = (zoneId: string, newName: string) => {
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{camera.name}</h1>
              <p className="text-gray-600">{camera.rtspUrl}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Feed</CardTitle>
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
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={finishDrawingZone}>
                        Finish Zone ({currentZonePoints.length} points)
                      </Button>
                      <Button variant="outline" onClick={cancelDrawingZone}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {!isDrawingZone && (
                  <div className="mt-4">
                    <Button onClick={startDrawingZone}>
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
              onDeleteZone={deleteZone}
              onUpdateZoneName={updateZoneName}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitor;
