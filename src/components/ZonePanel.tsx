
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { Zone, VehicleDetection } from '@/types/monitoring';

interface ZonePanelProps {
  zones: Zone[];
  vehicleDetections: VehicleDetection[];
  onDeleteZone: (zoneId: string) => void;
  onUpdateZoneName: (zoneId: string, newName: string) => void;
}

const ZonePanel: React.FC<ZonePanelProps> = ({
  zones,
  vehicleDetections,
  onDeleteZone,
  onUpdateZoneName
}) => {
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (zone: Zone) => {
    setEditingZone(zone.id);
    setEditName(zone.name);
  };

  const saveEdit = () => {
    if (editingZone && editName.trim()) {
      onUpdateZoneName(editingZone, editName.trim());
    }
    setEditingZone(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingZone(null);
    setEditName('');
  };

  // Calculate vehicles in each zone (simplified logic)
  const getVehiclesInZone = (zone: Zone) => {
    return vehicleDetections.filter(vehicle => {
      const centerX = vehicle.boundingBox.x + vehicle.boundingBox.width / 2;
      const centerY = vehicle.boundingBox.y + vehicle.boundingBox.height / 2;
      
      // Simple point-in-polygon check (simplified)
      let inside = false;
      const points = zone.points;
      
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        if (((points[i].y > centerY) !== (points[j].y > centerY)) &&
            (centerX < (points[j].x - points[i].x) * (centerY - points[i].y) / (points[j].y - points[i].y) + points[i].x)) {
          inside = !inside;
        }
      }
      
      return inside;
    });
  };

  const getVehicleTypeCount = (vehicles: VehicleDetection[]) => {
    const counts: { [key: string]: number } = {};
    vehicles.forEach(vehicle => {
      counts[vehicle.type] = (counts[vehicle.type] || 0) + 1;
    });
    return counts;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Zone Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Zones:</span>
              <Badge variant="secondary">{zones.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Total Vehicles:</span>
              <Badge variant="secondary">{vehicleDetections.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {zones.map(zone => {
        const vehiclesInZone = getVehiclesInZone(zone);
        const vehicleTypes = getVehicleTypeCount(vehiclesInZone);
        
        return (
          <Card key={zone.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {editingZone === zone.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                    />
                    <Button size="sm" onClick={saveEdit}>
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-lg">{zone.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => startEditing(zone)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDeleteZone(zone.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Vehicle Count:</span>
                  <Badge 
                    variant={vehiclesInZone.length > 0 ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {vehiclesInZone.length}
                  </Badge>
                </div>
                
                {Object.keys(vehicleTypes).length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Vehicle Types:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(vehicleTypes).map(([type, count]) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {vehiclesInZone.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Recent Activity:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {vehiclesInZone.slice(0, 3).map(vehicle => (
                        <div key={vehicle.id} className="text-xs text-gray-600 flex justify-between">
                          <span>{vehicle.type}</span>
                          <span>{vehicle.speed} km/h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div 
                  className="w-full h-2 rounded-full"
                  style={{ backgroundColor: zone.color + '40' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: zone.color,
                      width: `${Math.min((vehiclesInZone.length / Math.max(vehicleDetections.length, 1)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {zones.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No zones configured</p>
            <p className="text-sm text-gray-400 mt-1">Draw zones on the video to start monitoring</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ZonePanel;
