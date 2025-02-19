"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
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
    // Check for last transcription in localStorage
    const lastTranscription = window.localStorage.getItem('lastTranscriptionData');
    setHasLastTranscription(!!lastTranscription);
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
      
      // In development, save the response to localStorage for quick loading
      if (process.env.NODE_ENV === 'development') {
        window.localStorage.setItem('lastTranscriptionData', JSON.stringify(data));
        setHasLastTranscription(true);
      }
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
    fileInputRef.current?.click();
  }, []);

  return (
    <main className="min-h-screen p-8">
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

      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 space-x-2">
          <button
            onClick={() => loadSavedTranscription('19720124_atc_03')}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
          >
            Load Demo
          </button>
          {hasLastTranscription && (
            <button
              onClick={() => {
                const data = JSON.parse(window.localStorage.getItem('lastTranscriptionData')!);
                setWords(data.words);
                if (data.paragraphs) setParagraphs(data.paragraphs);
              }}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
            >
              Load Last
            </button>
          )}
        </div>
      )}
    </main>
  );
};

export default Home;
