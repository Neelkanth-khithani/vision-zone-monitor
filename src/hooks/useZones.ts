
import { useState, useEffect } from 'react';
import { ApiService } from '@/services/api';
import { Zone } from '@/types/monitoring';

export const useZones = (cameraId: string) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = async () => {
    if (!cameraId) return;
    
    try {
      setIsLoading(true);
      const response = await ApiService.getZones(cameraId);
      setZones(response.zones);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zones');
    } finally {
      setIsLoading(false);
    }
  };

  const createZone = async (zone: Omit<Zone, 'id'>) => {
    try {
      const response = await ApiService.createZone(cameraId, zone);
      setZones(prev => [...prev, response.zone]);
      return response.zone;
    } catch (err) {
      throw err;
    }
  };

  const updateZone = async (zoneId: string, updates: Partial<Zone>) => {
    try {
      const response = await ApiService.updateZone(cameraId, zoneId, updates);
      setZones(prev => prev.map(zone => 
        zone.id === zoneId ? { ...zone, ...response.zone } : zone
      ));
      return response.zone;
    } catch (err) {
      throw err;
    }
  };

  const deleteZone = async (zoneId: string) => {
    try {
      await ApiService.deleteZone(cameraId, zoneId);
      setZones(prev => prev.filter(zone => zone.id !== zoneId));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchZones();
  }, [cameraId]);

  return {
    zones,
    isLoading,
    error,
    createZone,
    updateZone,
    deleteZone,
    refetch: fetchZones,
  };
};
