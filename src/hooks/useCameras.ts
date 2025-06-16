
import { useState, useEffect } from 'react';
import { ApiService } from '@/services/api';
import { CameraConfig } from '@/types/monitoring';

export const useCameras = () => {
  const [cameras, setCameras] = useState<CameraConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCameras = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getCameras();
      setCameras(response.cameras);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cameras');
    } finally {
      setIsLoading(false);
    }
  };

  const createCamera = async (name: string, rtspUrl: string) => {
    try {
      const response = await ApiService.createCamera(name, rtspUrl);
      setCameras(prev => [...prev, response.camera]);
      return response.camera;
    } catch (err) {
      throw err;
    }
  };

  const deleteCamera = async (cameraId: string) => {
    try {
      await ApiService.deleteCamera(cameraId);
      setCameras(prev => prev.filter(cam => cam.id !== cameraId));
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
