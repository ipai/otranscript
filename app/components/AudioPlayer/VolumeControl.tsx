import { IoVolumeHigh, IoVolumeMedium, IoVolumeMute, IoVolumeLow, IoVolumeOff } from 'react-icons/io5';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  showVolumeBar: boolean;
  onVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onVolumeBarToggle: () => void;
}

// Get the appropriate volume icon based on volume level and mute state
const getVolumeIcon = (volume: number, isMuted: boolean) => {
  const iconClass = "w-5 h-5 text-gray-700";
  
  if (isMuted) return <IoVolumeMute className={iconClass} />;
  if (volume === 0) return <IoVolumeOff className={iconClass} />;
  if (volume < 0.33) return <IoVolumeLow className={iconClass} />;
  if (volume < 0.67) return <IoVolumeMedium className={iconClass} />;
  return <IoVolumeHigh className={iconClass} />;
};

export const VolumeControl = ({ 
  volume, 
  isMuted, 
  showVolumeBar, 
  onVolumeChange, 
  onVolumeBarToggle 
}: VolumeControlProps) => {
  return (
    <div className="flex-shrink-0 relative volume-control ml-2">
      <button
        onClick={onVolumeBarToggle}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Volume"
      >
        {getVolumeIcon(volume, isMuted)}
      </button>

      {showVolumeBar && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 p-2 bg-white rounded-lg shadow-lg z-10">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={onVolumeChange}
            className="w-24 accent-rose-600"
          />
        </div>
      )}
    </div>
  );
};
