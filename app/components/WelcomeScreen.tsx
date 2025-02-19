import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';

interface WelcomeScreenProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const WelcomeScreen = ({ onFileSelect, isLoading }: WelcomeScreenProps) => {
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
      <div 
        {...getRootProps()} 
        className={`
          w-full max-w-2xl p-12 rounded-xl border-2 border-dashed 
          transition-colors duration-200 cursor-pointer
          flex flex-col items-center justify-center space-y-4
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <FaCloudUploadAlt className={`w-16 h-16 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {isDragActive ? 'Drop your audio file here' : 'Drag and drop your audio file'}
          </h2>
          <p className="text-gray-500">
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
