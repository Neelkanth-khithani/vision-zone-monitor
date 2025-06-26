
import { useState, useEffect } from 'react';

interface CameraConfig {
  id: string;
  name: string;
  rtspUrl: string;
  dateAdded: string;
}

export const useCameras = () => {
  const [cameras, setCameras] = useState<CameraConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCameras = async () => {
    try {
      setIsLoading(true);
      // Get cameras from localStorage
      const storedCameras = localStorage.getItem('cameras');
      const cameras = storedCameras ? JSON.parse(storedCameras) : [];
      setCameras(cameras);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cameras');
    } finally {
      setIsLoading(false);
    }
  };

  const createCamera = async (name: string, rtspUrl: string) => {
    try {
      const newCamera: CameraConfig = {
        id: Date.now().toString(),
        name,
        rtspUrl,
        dateAdded: new Date().toLocaleDateString()
      };
      
      const updatedCameras = [...cameras, newCamera];
      localStorage.setItem('cameras', JSON.stringify(updatedCameras));
      setCameras(updatedCameras);
      return newCamera;
    } catch (err) {
      throw err;
    }
  };

  const deleteCamera = async (cameraId: string) => {
    try {
      const updatedCameras = cameras.filter(cam => cam.id !== cameraId);
      localStorage.setItem('cameras', JSON.stringify(updatedCameras));
      setCameras(updatedCameras);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  return {
    cameras,
    isLoading,
    error,
    createCamera,
    deleteCamera,
    refetch: fetchCameras,
  };
};
