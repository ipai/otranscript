import { useRef } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onProgressClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const ProgressBar = ({ currentTime, duration, onProgressClick }: ProgressBarProps) => {
  const progressRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-grow flex items-center space-x-2">
      {/* Time Display */}
      <div className="text-sm font-medium w-16 flex-shrink-0 text-center">
        {formatTime(currentTime)}
      </div>

      {/* Progress Bar */}
      <div 
        ref={progressRef}
        className="flex-grow h-2 bg-gray-100 rounded-full cursor-pointer relative overflow-hidden"
        onClick={onProgressClick}
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
  );
};
