import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';
import Image from 'next/image';

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
              <p className="welcome-subtitle">
                Audio Transcription Reimagined
              </p>
              <h1 className="welcome-title">
                OTranscript
              </h1>
              <p className="welcome-description">
                Transform your <span className="welcome-highlight">podcasts</span> and <span className="welcome-highlight-alt">audio content</span> into interactive transcripts that bring your content to life.
              </p>
              <p className="text-lg text-gray-600 italic">
                Navigate hours of content in seconds.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-800/20 via-rose-600/20 to-amber-500/20 rounded-2xl blur-xl" />
            <div className="relative w-full h-[400px] rounded-xl shadow-2xl overflow-hidden">
              <Image 
                src="/images/mic.jpg" 
                alt="Mr. microphone"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 mb-16">
          <div className="feature-card">
            <div className="feature-card-title text-rose-700">Quick Navigation</div>
            <p className="feature-card-description">Instantly jump to any moment in your audio with a single click. No more tedious scrubbing or guessing timestamps.</p>
            <p className="feature-card-subtitle">Perfect for interviews, lectures, and meeting notes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-title text-amber-700">Time-Saving</div>
            <p className="feature-card-description">Transform hours of audio into searchable text in minutes. Find key moments and quotes with unprecedented speed.</p>
            <p className="feature-card-subtitle">Ideal for researchers, journalists, and content creators.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-title text-rose-600">Interactive Experience</div>
            <p className="feature-card-description">Watch text highlight as audio plays. Click any word to jump to that moment. Your audio comes alive with synchronized text.</p>
            <p className="feature-card-subtitle">Essential for podcasters, students, and accessibility.</p>
          </div>
        </div>
      </div>

      <div 
        {...getRootProps()} 
        className={`upload-zone ${isDragActive ? 'upload-zone-active' : 'upload-zone-inactive'}`}
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
