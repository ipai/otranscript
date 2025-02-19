"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { AudioPlayer } from './components/AudioPlayer';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';
import { WelcomeScreen } from './components/WelcomeScreen';

interface Word {
  word: string;
  start: number;
  end: number;
}

interface Paragraph {
  sentences: {
    text: string;
    start: number;
    end: number;
  }[];
  num_words: number;
  start: number;
  end: number;
}

const Home = () => {
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLastTranscription, setHasLastTranscription] = useState(false);

  useEffect(() => {
    // Check for active transcription in localStorage
    const activeTranscription = window.localStorage.getItem('activeTranscription');
    const activeAudioUrl = window.localStorage.getItem('activeAudioUrl');
    
    if (activeTranscription && activeAudioUrl) {
      try {
        const data = JSON.parse(activeTranscription);
        setWords(data.words);
        if (data.paragraphs) {
          setParagraphs(data.paragraphs);
        }
        setAudioUrl(activeAudioUrl);
      } catch (error) {
        console.error('Error restoring transcription state:', error);
        // Clear invalid data
        window.localStorage.removeItem('activeTranscription');
        window.localStorage.removeItem('activeAudioUrl');
      }
    }
  }, []);

  const loadSavedTranscription = async (filename: string) => {
    try {
      // Load transcription data
      const response = await fetch(`/data/${filename}_transcription.json`);
      if (!response.ok) throw new Error('Failed to load saved transcription');
      const data = await response.json();
      setWords(data.words);
      if (data.paragraphs) {
        setParagraphs(data.paragraphs);
      }

      // Set up audio file
      const audioPath = `/data/${filename}.mp3`;
      setAudioUrl(audioPath);
    } catch (error) {
      console.error('Error loading saved transcription:', error);
      alert('Failed to load saved transcription');
    }
  };


  const processFile = async (file: File) => {
    setIsLoading(true);
    try {
      // Create object URL for audio playback
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      window.localStorage.setItem('activeAudioUrl', url);

      // Process with Deepgram
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      setWords(data.words);
      if (data.paragraphs) {
        setParagraphs(data.paragraphs);
      }
      
      // Save active transcription state
      window.localStorage.setItem('activeTranscription', JSON.stringify(data));
    } catch (error) {
      console.error('Error transcribing:', error);
      alert('Failed to transcribe audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleWordClick = useCallback((time: number) => {
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioElement.currentTime = time;
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewFileClick = useCallback(() => {
    // Clear active transcription when starting new
    window.localStorage.removeItem('activeTranscription');
    window.localStorage.removeItem('activeAudioUrl');
    setAudioUrl('');
    setWords([]);
    setParagraphs([]);
    fileInputRef.current?.click();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Set the dropped file as the selected file
      const fileInput = fileInputRef.current;
      if (fileInput) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(acceptedFiles[0]);
        fileInput.files = dataTransfer.files;
        // Trigger change event to process the file
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
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
    <main {...getRootProps()} className="min-h-screen p-8 relative pb-16">
      {isDragActive && (
        <div className="fixed inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-xl font-medium text-blue-600">
            Drop your audio file here
          </div>
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-8 text-sm text-gray-400">
        <span 
          onClick={() => {
            if (process.env.NODE_ENV === 'development') {
              loadSavedTranscription('19720124_atc_03');
            }
          }}
          className="cursor-pointer hover:text-rose-600 transition-colors"
        >
          ©
        </span>
        {' '}{new Date().getFullYear()} OTranscript. All rights reserved.
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {!audioUrl && !isLoading && (
        <WelcomeScreen 
          onFileSelect={processFile}
          isLoading={isLoading}
          onLoadDemo={() => loadSavedTranscription('19720124_atc_03')}
        />
      )}

      {isLoading && (
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-2xl font-semibold text-gray-800">
              Processing your audio...
            </div>
            <div className="text-gray-500">
              This may take a few moments
            </div>
          </div>
        </div>
      )}

      {audioUrl && !isLoading && (
        <div className="max-w-2xl mx-auto space-y-6">
          <AudioPlayer
            audioUrl={audioUrl}
            onTimeUpdate={setCurrentTime}
            onNewFileClick={handleNewFileClick}
          />

          {words.length > 0 && (
            <TranscriptionDisplay
              words={words}
              paragraphs={paragraphs}
              currentTime={currentTime}
              onWordClick={handleWordClick}
            />
          )}
        </div>
      )}


    </main>
  );
};

export default Home;
