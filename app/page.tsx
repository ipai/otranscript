'use client';

import { useState, useCallback, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { useDropzone } from 'react-dropzone';
import { WelcomeScreen } from './components/WelcomeScreen';
import { UploadProgress } from './components/UploadProgress';
import { Footer } from './components/Footer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStage, setUploadStage] = useState<'uploading' | 'transcribing' | 'done'>('uploading');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  /**
   * Process an uploaded audio file through the transcription pipeline.
   * Handles upload progress, transcription status, and redirects to results.
   * 
   * @param file The audio file to process
   */
  const calculateSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setShowProgress(true);
    setUploadProgress(0);
    
    try {
      // Calculate hash first
      const hash = await calculateSHA256(file);

      // Check if file already exists
      const checkResponse = await fetch('/api/check-hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash }),
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check file hash');
      }

      const { exists, transcript } = await checkResponse.json();

      if (exists && transcript) {
        // File already exists, redirect to transcript
        window.location.href = `/transcript/${transcript.id}`;
        return;
      }

      setUploadStage('uploading');
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => prev >= 90 ? prev : prev + 10);
      }, 500);

      // Upload file directly to Vercel Blob
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      if (!blob?.url) {
        throw new Error('Failed to upload file');
      }

      // Process the uploaded file
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl: blob.url }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Processing failed: ${errorData}`);
      }

      // Show upload completion
      clearInterval(progressInterval);
      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show transcription progress
      setUploadStage('transcribing');
      setUploadProgress(0);

      const transcribeInterval = setInterval(() => {
        setUploadProgress(prev => prev >= 90 ? prev : prev + 5);
      }, 1000);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }
      
      // Show completion
      clearInterval(transcribeInterval);
      setUploadProgress(100);
      setUploadStage('done');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.href = `/transcript/${data.id}`;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process audio file');
    } finally {
      setIsLoading(false);
      setShowProgress(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': []
    },
    multiple: false,
    noClick: true
  });

  return (
    <div className="min-h-screen w-full relative">
      <main {...getRootProps()} className="relative">
      {isDragActive && (
        <div className="fixed inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-xl font-medium text-blue-600">
            Drop your audio file here
          </div>
        </div>
      )}
      
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />

      <div className="flex flex-col">
        {!showProgress ? (
          <WelcomeScreen 
            onFileSelect={processFile}
            isLoading={isLoading}
            onLoadDemo={() => {
              // Redirect to demo transcript
              window.location.href = '/transcript/demo';
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Processing Your Audio File
              </h2>
              <UploadProgress 
                stage={uploadStage}
                uploadProgress={uploadProgress}
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                Please wait while we process your file. This may take a few minutes.
              </p>
            </div>
          </div>
        )}
      </div>
      </main>
      <Footer />
    </div>
  );
}
