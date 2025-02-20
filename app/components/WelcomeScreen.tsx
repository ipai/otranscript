import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaRegClock } from 'react-icons/fa';
import { MdOutlineTimeline } from 'react-icons/md';
import { HiOutlineCursorClick } from 'react-icons/hi';
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
    <div className="flex flex-col w-full bg-slate-100">
      <section className="flex-none px-12 py-16 bg-slate-100">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 items-center gap-12">
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
                <p className="text-lg italic text-gray-600">
                  Navigate hours of content in seconds.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-rose-800/20 via-rose-600/20 to-amber-500/20 blur-xl" />
              <div className="relative h-[400px] w-full overflow-hidden rounded-xl shadow-2xl">
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
        </div>
      </section>

      <section className="flex-none px-12 py-16 bg-slate-100">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-8">
            <div className="feature-card p-8">
              <div className="mb-6">
                <MdOutlineTimeline className="h-12 w-12 text-rose-700/80" />
              </div>
              <div className="feature-card-title text-rose-700">Quick Navigation</div>
              <p className="feature-card-description">Instantly jump to any moment in your audio with a single click. No more tedious scrubbing or guessing timestamps.</p>
              <p className="feature-card-subtitle">Perfect for interviews, lectures, and meeting notes.</p>
            </div>
            <div className="feature-card p-8">
              <div className="mb-6">
                <FaRegClock className="h-12 w-12 text-amber-700/80" />
              </div>
              <div className="feature-card-title text-amber-700">Time-Saving</div>
              <p className="feature-card-description">Transform hours of audio into searchable text in minutes. Find key moments and quotes with unprecedented speed.</p>
              <p className="feature-card-subtitle">Ideal for researchers, journalists, and content creators.</p>
            </div>
            <div className="feature-card p-8">
              <div className="mb-6">
                <HiOutlineCursorClick className="h-12 w-12 text-rose-600/80" />
              </div>
              <div className="feature-card-title text-rose-600">Interactive Experience</div>
              <p className="feature-card-description">Watch text highlight as audio plays. Click any word to jump to that moment. Your audio comes alive with synchronized text.</p>
              <p className="feature-card-subtitle">Essential for podcasters, students, and accessibility.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-none px-12 py-24 bg-red-50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600">Upload your first audio file and see the magic happen</p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div 
              {...getRootProps()} 
              className={`flex min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 ${isDragActive ? 'border-red-500 bg-red-50' : 'border-red-300 bg-white/50 hover:border-red-400'} transition-colors duration-200`}
            >
              <input {...getInputProps()} />
              
              <FaCloudUploadAlt className={`mb-4 h-20 w-20 ${isDragActive ? 'text-red-600' : 'text-red-400'}`} />
              
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {isDragActive ? 'Drop your audio file here' : 'Drag and drop your audio file'}
                </h2>
                <p className="text-gray-600">
                  or click to select a file
                </p>
              </div>

              {isLoading && (
                <div className="mt-6 animate-pulse text-lg font-medium text-blue-600">
                  Processing your audio...
                </div>
              )}
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={() => window.location.href = '/transcript/demo'}
                className="text-lg text-gray-600 transition-colors duration-200 hover:text-rose-600"
              >
                Try it out with a demo →
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
