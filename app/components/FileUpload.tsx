import { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { WelcomeScreen } from './WelcomeScreen';
import { UploadProgress } from './UploadProgress';
import { useFileUpload } from '../hooks/useFileUpload';

export function FileUpload() {
  const {
    isLoading,
    showProgress,
    uploadStage,
    currentProgress,
    processFile
  } = useFileUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  }, [processFile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': []
    },
    multiple: false,
    noClick: true
  });

  return (
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
                uploadProgress={currentProgress}
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                Please wait while we process your file. This may take a few minutes.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
