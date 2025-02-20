import { useState, useCallback } from 'react';
import { useProgressSimulation } from './useProgressSimulation';
import { calculateSHA256, checkFileExists, uploadFile, processAudioFile } from '../utils/fileProcessing';

export type UploadStage = 'checking' | 'uploading' | 'transcribing' | 'done';

interface UseFileUploadReturn {
  isLoading: boolean;
  showProgress: boolean;
  uploadStage: UploadStage;
  currentProgress: number;
  processFile: (file: File) => Promise<void>;
}

export function useFileUpload(): UseFileUploadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStage, setUploadStage] = useState<UploadStage>('checking');
  const [showProgress, setShowProgress] = useState(false);

  const STAGE_WEIGHTS = {
    checking: { weight: 0.2, start: 0 },    // 0-20%
    uploading: { weight: 0.3, start: 20 },  // 20-50%
    transcribing: { weight: 0.45, start: 50 }, // 50-95%
    done: { weight: 0.05, start: 95 }      // 95-100%
  } as const;

  // Progress simulation for each stage
  const checking = useProgressSimulation({
    isActive: showProgress && uploadStage === 'checking',
    duration: 100,
    increment: 0.5,
    maxProgress: 100
  });

  const uploading = useProgressSimulation({
    isActive: showProgress && uploadStage === 'uploading',
    duration: 150,
    increment: 0.5,
    maxProgress: 100
  });

  const transcribing = useProgressSimulation({
    isActive: showProgress && uploadStage === 'transcribing',
    duration: 300,
    increment: 0.25,
    maxProgress: 100
  });

  // Get current progress based on stage
  const getCurrentProgress = useCallback(() => {
    const currentStageInfo = STAGE_WEIGHTS[uploadStage];
    const stageProgress = (() => {
      switch (uploadStage) {
        case 'checking':
          return checking.progress;
        case 'uploading':
          return uploading.progress;
        case 'transcribing':
          return transcribing.progress;
        case 'done':
          return 100;
        default:
          return 0;
      }
    })();

    // Calculate total progress
    const stageContribution = (stageProgress / 100) * currentStageInfo.weight * 100;
    const totalProgress = currentStageInfo.start + stageContribution;

    return Math.min(100, totalProgress);
  }, [uploadStage, checking.progress, uploading.progress, transcribing.progress]);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setShowProgress(true);
    
    try {
      // Stage 1: Checking audio file
      setUploadStage('checking');
      
      // Calculate hash
      const hash = await calculateSHA256(file);
      
      // Check if file already exists
      const { exists, transcript } = await checkFileExists(hash);

      if (exists && transcript) {
        // Show completion for existing file
        checking.setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadStage('done');
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = `/transcript/${transcript.id}`;
        return;
      }

      checking.setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Stage 2: Uploading file
      setUploadStage('uploading');

      // Upload file to Vercel Blob with progress tracking
      const blob = await uploadFile(hash, file, (progress) => {
        uploading.setProgress(progress);
      });

      // Stage 3: Transcribing
      uploading.setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadStage('transcribing');

      const data = await processAudioFile(blob.url, hash);
      
      // Stage 4: Complete
      transcribing.setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadStage('done');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = `/transcript/${data.id}`;
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process audio file');
    } finally {
      setIsLoading(false);
      setShowProgress(false);
    }
  }, [setIsLoading, setShowProgress, setUploadStage, checking, uploading, transcribing]);

  return {
    isLoading,
    showProgress,
    uploadStage,
    currentProgress: getCurrentProgress(),
    processFile,
  };
}
