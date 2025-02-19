import { useRef, useState, useEffect } from 'react';
import { IoPause, IoPlay, IoEllipsisVertical } from 'react-icons/io5';
import { Menu, MenuButton, MenuItems } from '@headlessui/react';
import { MainMenu } from './MainMenu';
import { PlaybackSpeedMenu } from './PlaybackSpeedMenu';
import { RepeatMenu } from './RepeatMenu';
import { AudioOffsetMenu } from './AudioOffsetMenu';
import { VolumeControl } from './VolumeControl';
import { ProgressBar } from './ProgressBar';

interface AudioPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onNewFileClick?: () => void;
}

export const AudioPlayer = ({ audioUrl, onTimeUpdate, onNewFileClick }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeBar, setShowVolumeBar] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [audioOffset, setAudioOffset] = useState(0); // in milliseconds
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentSubmenu, setCurrentSubmenu] = useState<'main' | 'speed' | 'repeat' | 'offset'>('main');
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

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = event.currentTarget;
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

  const handleRepeatChange = (enabled: boolean) => {
    setIsRepeatEnabled(enabled);
    if (audioRef.current) {
      audioRef.current.loop = enabled;
    }
    setCurrentSubmenu('main');
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setCurrentSubmenu('main');
  };

  const handleOffsetChange = (offset: number) => {
    setAudioOffset(offset);
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

  // Update playback speed when it changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

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
    <div className="w-full mx-auto bg-white rounded-xl shadow-lg p-3 text-gray-800 transition-colors relative">
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

        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onProgressClick={handleProgressClick}
        />

        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          showVolumeBar={showVolumeBar}
          onVolumeChange={handleVolumeChange}
          onVolumeBarToggle={() => setShowVolumeBar(!showVolumeBar)}
        />

        {/* Menu Button */}
        <Menu>
          <div className="relative ml-1">
            <MenuButton 
              onClick={() => {
                setCurrentSubmenu('main');
              }}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <IoEllipsisVertical className="w-5 h-5" />
            </MenuButton>

            {/* Menu Items */}
            <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
              {currentSubmenu === 'main' ? (
                <MainMenu
                  onNewFileClick={onNewFileClick || (() => {})}
                  onSpeedMenuOpen={() => setCurrentSubmenu('speed')}
                  onRepeatMenuOpen={() => setCurrentSubmenu('repeat')}
                  onOffsetMenuOpen={() => setCurrentSubmenu('offset')}
                  playbackSpeed={playbackSpeed}
                  isRepeatEnabled={isRepeatEnabled}
                  audioOffset={audioOffset}
                />
              ) : currentSubmenu === 'speed' ? (
                <PlaybackSpeedMenu
                  currentSpeed={playbackSpeed}
                  onSpeedChange={handleSpeedChange}
                  onBack={() => setCurrentSubmenu('main')}
                />
              ) : currentSubmenu === 'repeat' ? (
                <RepeatMenu
                  isEnabled={isRepeatEnabled}
                  onRepeatChange={handleRepeatChange}
                  onBack={() => setCurrentSubmenu('main')}
                />
              ) : currentSubmenu === 'offset' ? (
                <AudioOffsetMenu
                  offset={audioOffset}
                  onOffsetChange={handleOffsetChange}
                  onBack={() => setCurrentSubmenu('main')}
                />
              ) : null}
            </MenuItems>
          </div>
        </Menu>
      </div>
    </div>
  );
};
