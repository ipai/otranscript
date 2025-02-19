import { MenuItem } from '@headlessui/react';
import { IoCloudUpload, IoPlay, IoRepeat, IoRepeatOutline, IoTime } from 'react-icons/io5';

interface MainMenuProps {
  onNewFileClick: () => void;
  onSpeedMenuOpen: () => void;
  onRepeatMenuOpen: () => void;
  onOffsetMenuOpen: () => void;
  playbackSpeed: number;
  isRepeatEnabled: boolean;
  audioOffset: number;
}

export const MainMenu = ({
  onNewFileClick,
  onSpeedMenuOpen,
  onRepeatMenuOpen,
  onOffsetMenuOpen,
  playbackSpeed,
  isRepeatEnabled,
  audioOffset,
}: MainMenuProps) => {
  return (
    <div>
      <MenuItem>
        {() => (
          <button
            onClick={onNewFileClick}
            className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 data-[focus]:bg-rose-50"
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRepeatMenuOpen();
            }}
            className={`${active ? 'bg-rose-50' : ''} group flex w-full items-center px-4 py-2 text-sm ${
              isRepeatEnabled ? 'text-rose-600 font-medium' : 'text-gray-700'
            }`}
          >
            <span className="flex items-center w-full">
              {isRepeatEnabled ? (
                <IoRepeat className="w-5 h-5 mr-2 text-rose-600" />
              ) : (
                <IoRepeatOutline className="w-5 h-5 mr-2" />
              )}
              Repeat: {isRepeatEnabled ? 'On' : 'Off'}
            </span>
          </button>
        )}
      </MenuItem>
      <MenuItem>
        {() => (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSpeedMenuOpen();
            }}
            className={`group flex w-full items-center px-4 py-2 text-sm data-[focus]:bg-rose-50 ${
              playbackSpeed !== 1 ? 'text-rose-600 font-medium' : 'text-gray-700'
            }`}
          >
            <span className="flex items-center w-full">
              <IoPlay className="w-5 h-5 mr-2" />
              Speed: {playbackSpeed}x
            </span>
          </button>
        )}
      </MenuItem>
      <MenuItem>
        {() => (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOffsetMenuOpen();
            }}
            className={`group flex w-full items-center px-4 py-2 text-sm data-[focus]:bg-rose-50 ${
              audioOffset !== 0 ? 'text-rose-600 font-medium' : 'text-gray-700'
            }`}
          >
            <span className="flex items-center w-full">
              <IoTime className="w-5 h-5 mr-2" />
              Audio Offset: {audioOffset}
            </span>
          </button>
        )}
      </MenuItem>
    </div>
  );
};
