
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Camera, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCameras } from '@/hooks/useCameras';

const Dashboard = () => {
  const [newCameraName, setNewCameraName] = useState('');
  const [newCameraRtsp, setNewCameraRtsp] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { cameras, isLoading, createCamera, deleteCamera } = useCameras();

  const handleAddCamera = async () => {
    if (!newCameraName.trim() || !newCameraRtsp.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCamera(newCameraName, newCameraRtsp);
      setNewCameraName('');
      setNewCameraRtsp('');
      setIsDialogOpen(false);
      toast({
        title: "Camera added",
        description: `${newCameraName} has been added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add camera",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCamera = async (cameraId: string) => {
    try {
      await deleteCamera(cameraId);
      toast({
        title: "Camera deleted",
        description: "Camera has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete camera",
        variant: "destructive",
      });
    }
  };

  const handleCameraClick = (camera: any) => {
    navigate('/monitor', { state: { camera } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading cameras...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Camera Dashboard</h1>
            <p className="text-gray-600">Manage your CCTV cameras and monitoring zones</p>
          </div>
          <Button onClick={logout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 cursor-pointer transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <Plus className="w-12 h-12 mb-4" />
                  <p className="text-lg font-medium">Add New Camera</p>
                  <p className="text-sm">Configure RTSP source</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Camera</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cameraName">Camera Name</Label>
                  <Input
                    id="cameraName"
                    value={newCameraName}
                    onChange={(e) => setNewCameraName(e.target.value)}
                    placeholder="e.g., Front Entrance"
                  />
                </div>
                <div>
                  <Label htmlFor="rtspUrl">RTSP URL</Label>
                  <Input
                    id="rtspUrl"
                    value={newCameraRtsp}
                    onChange={(e) => setNewCameraRtsp(e.target.value)}
                    placeholder="rtsp://192.168.1.100/cam"
                  />
                </div>
                <Button onClick={handleAddCamera} className="w-full">
                  Add Camera
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {cameras.map((camera) => (
            <Card key={camera.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    {camera.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCamera(camera.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent onClick={() => handleCameraClick(camera)}>
                <div className="bg-gray-200 h-32 rounded-lg mb-3 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{camera.rtspUrl}</p>
                <p className="text-xs text-gray-500">Added: {camera.dateAdded}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
