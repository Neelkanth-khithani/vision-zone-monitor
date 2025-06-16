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
import { useZones } from '@/hooks/useZones';
import { ApiService } from '@/services/api';

const Monitor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { camera } = location.state || {};
  
  const { zones, createZone, updateZone, deleteZone } = useZones(camera?.id);
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

    // Connect to WebSocket for real-time detections
    const ws = ApiService.connectWebSocket(camera.id, (detection) => {
      setVehicleDetections(prev => [...prev.slice(-4), detection]); // Keep last 5 detections
    });

    return () => {
      ApiService.disconnectWebSocket();
    };
  }, [camera, navigate]);

  const handleVideoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingZone) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCurrentZonePoints([...currentZonePoints, { x, y }]);
  };

  const finishDrawingZone = async () => {
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

    try {
      await createZone({
        name: newZoneName,
        points: currentZonePoints,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        vehicleCount: 0,
      });

      setIsDrawingZone(false);
      setCurrentZonePoints([]);
      setNewZoneName('');

      toast({
        title: "Zone created",
        description: `Zone "${newZoneName}" has been created`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create zone",
        variant: "destructive",
      });
    }
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

  const handleDeleteZone = async (zoneId: string) => {
    try {
      await deleteZone(zoneId);
      toast({
        title: "Zone deleted",
        description: "Zone has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete zone",
        variant: "destructive",
      });
    }
  };

  const handleUpdateZoneName = async (zoneId: string, newName: string) => {
    try {
      await updateZone(zoneId, { name: newName });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update zone",
        variant: "destructive",
      });
    }
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
