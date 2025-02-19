import { MenuItem } from '@headlessui/react';
import { IoArrowBack, IoTime } from 'react-icons/io5';

interface AudioOffsetMenuProps {
  offset: number;
  onOffsetChange: (offset: number) => void;
  onBack: () => void;
}

export const AudioOffsetMenu = ({ offset, onOffsetChange, onBack }: AudioOffsetMenuProps) => {
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
                Audio Offset
              </span>
            </button>
          )}
        </MenuItem>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Offset (ms):</span>
          <input
            type="number"
            value={offset}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= -5000 && value <= 5000) {
                onOffsetChange(value);
              }
            }}
            className="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
            step="10"
            min="-5000"
            max="5000"
          />
        </div>
        <input
          type="range"
          value={offset}
          onChange={(e) => onOffsetChange(Number(e.target.value))}
          className="w-full accent-rose-600"
          step="10"
          min="-5000"
          max="5000"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">-5000ms</span>
          <span className="text-xs text-gray-500">+5000ms</span>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOffsetChange(0);
          }}
          className="w-full mt-3 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Reset to 0ms
        </button>
      </div>
    </div>
  );
};
