interface UploadProgressProps {
  stage: 'uploading' | 'transcribing' | 'done';
  uploadProgress: number;
}

export function UploadProgress({ stage, uploadProgress }: UploadProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {stage === 'uploading' && 'Uploading audio file...'}
          {stage === 'transcribing' && 'Generating transcript...'}
          {stage === 'done' && 'Complete!'}
        </span>
        {stage === 'uploading' && (
          <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-rose-600 h-2.5 rounded-full transition-all duration-300"
          style={{
            width: `${stage === 'done' ? 100 : 
                    stage === 'transcribing' ? 100 : 
                    uploadProgress}%`,
            transitionProperty: 'width',
          }}
        />
      </div>

      {/* Progress steps */}
      <div className="mt-4 flex justify-between">
        <div className="flex flex-col items-center">
          <div className={`w-4 h-4 rounded-full mb-1 ${
            stage === 'uploading' ? 'bg-rose-600 animate-pulse' :
            stage === 'transcribing' || stage === 'done' ? 'bg-rose-600' : 
            'bg-gray-300'
          }`} />
          <span className="text-xs text-gray-500">Upload</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-4 h-4 rounded-full mb-1 ${
            stage === 'transcribing' ? 'bg-rose-600 animate-pulse' :
            stage === 'done' ? 'bg-rose-600' : 
            'bg-gray-300'
          }`} />
          <span className="text-xs text-gray-500">Transcribe</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-4 h-4 rounded-full mb-1 ${
            stage === 'done' ? 'bg-rose-600' : 
            'bg-gray-300'
          }`} />
          <span className="text-xs text-gray-500">Complete</span>
        </div>
      </div>
    </div>
  );
}
