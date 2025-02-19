import { useRef, useState, useEffect } from 'react';
import { IoPlay, IoPause, IoEllipsisVertical, IoVolumeOff, IoVolumeLow, IoVolumeMedium, IoVolumeHigh, IoVolumeMute, IoRepeat, IoRepeatOutline, IoCloudUpload } from 'react-icons/io5';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

interface AudioPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onNewFileClick?: () => void;
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Get the appropriate volume icon based on volume level and mute state
const getVolumeIcon = (volume: number, isMuted: boolean) => {
  const iconClass = "w-5 h-5 text-gray-700";
  
  if (isMuted) return <IoVolumeMute className={iconClass} />;
  if (volume === 0) return <IoVolumeOff className={iconClass} />;
  if (volume < 0.33) return <IoVolumeLow className={iconClass} />;
  if (volume < 0.67) return <IoVolumeMedium className={iconClass} />;
  return <IoVolumeHigh className={iconClass} />;
};

export const AudioPlayer = ({ audioUrl, onTimeUpdate, onNewFileClick }: AudioPlayerProps) => {

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeBar, setShowVolumeBar] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [audioOffset, setAudioOffset] = useState(0); // in milliseconds

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      if (onTimeUpdate) {
        onTimeUpdate(time + (audioOffset / 1000));
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [audioUrl]);

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    if (progressBar && audioRef.current) {
      const rect = progressBar.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;
      const time = percent * duration;
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleVolumeBar = () => {
    setShowVolumeBar(!showVolumeBar);
  };

  // Close volume bar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showVolumeBar && !(event.target as Element).closest('.volume-control')) {
        setShowVolumeBar(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showVolumeBar]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-3 text-gray-800 transition-colors relative">
      <audio
        ref={audioRef}
        src={audioUrl}
        loop={isRepeatEnabled}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700 transition-colors text-white flex-shrink-0"
        >
          {isPlaying ? 
            <IoPause className="w-5 h-5" /> : 
            <IoPlay className="w-5 h-5" />
          }
        </button>

        <div className="flex-grow flex items-center space-x-2">
          {/* Time Display */}
          <div className="text-sm font-medium w-16 flex-shrink-0 text-center">
            {formatTime(currentTime)}
          </div>

          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="flex-grow h-2 bg-gray-100 rounded-full cursor-pointer relative overflow-hidden"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute h-full bg-gradient-to-r from-rose-600 to-amber-500 rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          <div className="text-sm font-medium w-16 flex-shrink-0 text-center">
            {formatTime(duration)}
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex-shrink-0 relative volume-control">
          <button
            onClick={toggleVolumeBar}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Volume"
          >
            {getVolumeIcon(volume, isMuted)}
          </button>

          {/* Volume Bar */}
          {showVolumeBar && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 p-2 bg-white rounded-lg shadow-lg z-10">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 accent-rose-600"
              />
            </div>
          )}
        </div>

        {/* Menu Button */}
        <Menu as="div" className="relative ml-1">
            <MenuButton className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors">
              <IoEllipsisVertical className="w-5 h-5" />
            </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={onNewFileClick}
                    className={`${active ? 'bg-rose-50' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <span className="flex items-center w-full">
                      <IoCloudUpload className="w-5 h-5 mr-2" />
                      Upload New File
                    </span>
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={() => {
                      setIsRepeatEnabled(!isRepeatEnabled);
                      if (audioRef.current) {
                        audioRef.current.loop = !isRepeatEnabled;
                      }
                    }}
                    className={`${active ? 'bg-rose-50' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <span className="flex items-center w-full">
                      {isRepeatEnabled ? (
                        <IoRepeat className="w-5 h-5 mr-2 text-rose-600" />
                      ) : (
                        <IoRepeatOutline className="w-5 h-5 mr-2" />
                      )}
                      Repeat {isRepeatEnabled ? 'On' : 'Off'}
                    </span>
                  </button>
                )}
              </MenuItem>
              <div className="px-4 py-2 text-sm text-gray-700 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-1">Audio Offset (ms)</label>
                <input
                  type="number"
                  value={audioOffset}
                  onChange={(e) => setAudioOffset(Number(e.target.value))}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
                  step="10"
                  min="-5000"
                  max="5000"
                />
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>
  );
};
