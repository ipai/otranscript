import { MenuItem } from '@headlessui/react';
import { IoArrowBack } from 'react-icons/io5';

interface PlaybackSpeedMenuProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  onBack: () => void;
}

export const PlaybackSpeedMenu = ({ currentSpeed, onSpeedChange, onBack }: PlaybackSpeedMenuProps) => {
  return (
    <div className="bg-white">
      <div className="border-b border-gray-100">
        <MenuItem>
          {() => (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBack();
              }}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 data-[focus]:bg-rose-50"
            >
              <span className="flex items-center w-full">
                <IoArrowBack className="w-5 h-5 mr-2" />
                Playback Speed
              </span>
            </button>
          )}
        </MenuItem>
      </div>
      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
        <MenuItem key={speed}>
          {() => (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSpeedChange(speed);
              }}
              className={`${speed === currentSpeed ? 'text-rose-600 font-medium' : 'text-gray-700'} 
                group flex w-full items-center px-4 py-2 text-sm data-[focus]:bg-rose-50`}
            >
              <span className="flex items-center w-full pl-7">
                {speed}x {speed === currentSpeed && '(current)'}
              </span>
            </button>
          )}
        </MenuItem>
      ))}
    </div>
  );
};
