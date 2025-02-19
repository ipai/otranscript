import { MenuItem } from '@headlessui/react';
import { IoArrowBack } from 'react-icons/io5';

interface RepeatMenuProps {
  isEnabled: boolean;
  onRepeatChange: (enabled: boolean) => void;
  onBack: () => void;
}

export const RepeatMenu = ({ isEnabled, onRepeatChange, onBack }: RepeatMenuProps) => {
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
                Repeat
              </span>
            </button>
          )}
        </MenuItem>
      </div>
      {[false, true].map((enabled) => (
        <MenuItem key={enabled ? 'on' : 'off'}>
          {() => (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRepeatChange(enabled);
              }}
              className={`${enabled === isEnabled ? 'text-rose-600 font-medium' : 'text-gray-700'} 
                group flex w-full items-center px-4 py-2 text-sm data-[focus]:bg-rose-50`}
            >
              <span className="flex items-center w-full pl-7">
                {enabled ? 'On' : 'Off'} {enabled === isEnabled && '(current)'}
              </span>
            </button>
          )}
        </MenuItem>
      ))}
    </div>
  );
};
