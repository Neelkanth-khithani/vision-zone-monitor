
import React, { useState } from 'react';
import { Camera, Play, Pause } from 'lucide-react';

interface VideoPreviewProps {
  rtspUrl: string;
  className?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ rtspUrl, className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock video preview - in production, you'd use WebRTC or HLS streams
  const generateMockFrame = () => {
    const patterns = [
      'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)',
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {isPlaying ? (
        <div 
          className="w-full h-full flex items-center justify-center animate-pulse"
          style={{ background: generateMockFrame() }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            LIVE
          </div>
          <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
            {rtspUrl}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Camera className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200"
      >
        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default VideoPreview;
