
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Camera, Trash2, LogOut, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCameras } from '@/hooks/useCameras';
import VideoPreview from '@/components/VideoPreview';

const Dashboard = () => {
  const [newCameraName, setNewCameraName] = useState('');
  const [newCameraRtsp, setNewCameraRtsp] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading cameras...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Vision Zone Monitor
            </h1>
            <p className="text-gray-300 text-lg">
              Welcome back, {user?.fullName}! Manage your CCTV cameras and monitoring zones
            </p>
          </div>
          <Button onClick={logout} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="border-dashed border-2 border-white/30 hover:border-white/50 cursor-pointer transition-all duration-300 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center h-64 text-white">
                  <Plus className="w-12 h-12 mb-4 text-purple-300" />
                  <p className="text-lg font-medium">Add New Camera</p>
                  <p className="text-sm text-gray-300">Configure RTSP source</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Camera</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cameraName" className="text-gray-300">Camera Name</Label>
                  <Input
                    id="cameraName"
                    value={newCameraName}
                    onChange={(e) => setNewCameraName(e.target.value)}
                    placeholder="e.g., Front Entrance"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="rtspUrl" className="text-gray-300">RTSP URL</Label>
                  <Input
                    id="rtspUrl"
                    value={newCameraRtsp}
                    onChange={(e) => setNewCameraRtsp(e.target.value)}
                    placeholder="rtsp://192.168.1.100/cam"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Button onClick={handleAddCamera} className="w-full bg-purple-600 hover:bg-purple-700">
                  Add Camera
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {cameras.map((camera) => (
            <Card key={camera.id} className="group hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center text-white">
                    <Video className="w-5 h-5 mr-2 text-purple-300" />
                    {camera.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCamera(camera.id);
                    }}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent onClick={() => handleCameraClick(camera)}>
                <VideoPreview 
                  rtspUrl={camera.rtspUrl} 
                  className="h-32 mb-3"
                />
                <p className="text-sm text-gray-300 truncate mb-2 font-mono bg-black/20 px-2 py-1 rounded">
                  {camera.rtspUrl}
                </p>
                <p className="text-xs text-gray-400">Added: {camera.dateAdded}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {cameras.length === 0 && (
          <div className="text-center mt-16">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No cameras configured</h3>
            <p className="text-gray-400">Add your first camera to start monitoring</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
