import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';

interface WelcomeScreenProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  onLoadDemo: () => void;
}

export const WelcomeScreen = ({ onFileSelect, isLoading, onLoadDemo }: WelcomeScreenProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': []
    },
    multiple: false
  });

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
      <div className="space-y-12 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="space-y-6">
              <p className="text-sm font-semibold tracking-wider text-rose-700 uppercase">
                Audio Transcription Reimagined
              </p>
              <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-rose-800 via-rose-600 to-amber-500 bg-clip-text text-transparent leading-tight">
                OTranscript
              </h1>
              <p className="text-xl text-gray-700 leading-relaxed font-light">
                Transform your <span className="text-rose-700 font-medium">podcasts</span> and <span className="text-amber-700 font-medium">audio content</span> into interactive transcripts that bring your content to life.
              </p>
              <p className="text-lg text-gray-600 italic">
                Navigate hours of content in seconds.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-800/20 via-rose-600/20 to-amber-500/20 rounded-2xl blur-xl" />
            <img 
              src="/images/mic.jpg" 
              alt="Professional microphone" 
              className="w-full h-[400px] object-cover rounded-xl shadow-2xl relative"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 mb-16">
          <div className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-rose-700 mb-3 text-lg font-bold tracking-tight">Quick Navigation</div>
            <p className="text-gray-600 font-light mb-3">Instantly jump to any moment in your audio with a single click. No more tedious scrubbing or guessing timestamps.</p>
            <p className="text-gray-500 text-sm">Perfect for interviews, lectures, and meeting notes.</p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-amber-700 mb-3 text-lg font-bold tracking-tight">Time-Saving</div>
            <p className="text-gray-600 font-light mb-3">Transform hours of audio into searchable text in minutes. Find key moments and quotes with unprecedented speed.</p>
            <p className="text-gray-500 text-sm">Ideal for researchers, journalists, and content creators.</p>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
            <div className="text-rose-600 mb-3 text-lg font-bold tracking-tight">Interactive Experience</div>
            <p className="text-gray-600 font-light mb-3">Watch text highlight as audio plays. Click any word to jump to that moment. Your audio comes alive with synchronized text.</p>
            <p className="text-gray-500 text-sm">Essential for podcasters, students, and accessibility.</p>
          </div>
        </div>
      </div>

      <div 
        {...getRootProps()} 
        className={`
          w-full max-w-xl p-8 rounded-lg border 
          transition-colors duration-200 cursor-pointer
          flex flex-col items-center justify-center space-y-4 mt-16
          ${isDragActive 
            ? 'border-rose-500 bg-rose-50' 
            : 'border-gray-200 hover:border-rose-500 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <FaCloudUploadAlt className={`w-16 h-16 ${isDragActive ? 'text-rose-600' : 'text-gray-400'}`} />
        
        <div className="text-center min-w-[300px]">
          <h2 className="text-xl font-bold mb-2 tracking-tight">
            {isDragActive ? 'Drop your audio file here' : 'Drag and drop your audio file'}
          </h2>
          <p className="text-gray-500 font-light">
            or click to select a file
          </p>
        </div>

        {isLoading && (
          <div className="mt-4 text-blue-600 font-medium animate-pulse">
            Processing your audio...
          </div>
        )}
      </div>

    </div>
  );
};
