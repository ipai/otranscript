import { MenuItem } from '@headlessui/react';
import { IoCloudUpload, IoPlay, IoRepeat, IoRepeatOutline } from 'react-icons/io5';

interface MainMenuProps {
  onNewFileClick: () => void;
  onSpeedMenuOpen: () => void;
  onRepeatMenuOpen: () => void;
  playbackSpeed: number;
  isRepeatEnabled: boolean;
  audioOffset: number;
  onAudioOffsetChange: (offset: number) => void;
}

export const MainMenu = ({
  onNewFileClick,
  onSpeedMenuOpen,
  onRepeatMenuOpen,
  playbackSpeed,
  isRepeatEnabled,
  audioOffset,
  onAudioOffsetChange,
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
      <div className="px-4 py-2 text-sm text-gray-700 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-1">Audio Offset (ms)</label>
        <input
          type="number"
          value={audioOffset}
          onChange={(e) => onAudioOffsetChange(Number(e.target.value))}
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
          step="10"
          min="-5000"
          max="5000"
        />
      </div>
    </div>
  );
};
