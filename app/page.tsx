"use client";

import { useState, useCallback } from 'react';
import { AudioPlayer } from './components/AudioPlayer';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';

interface Word {
  word: string;
  start: number;
  end: number;
}

const Home = () => {
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create object URL for audio playback
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // Process with Deepgram
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      setWords(data.words);
    } catch (error) {
      console.error('Error transcribing:', error);
      alert('Failed to transcribe audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordClick = useCallback((time: number) => {
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioElement.currentTime = time;
    }
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Audio Transcription Tool</h1>
        
        <div className="mb-8">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="w-full p-2 border rounded"
          />
        </div>

        {isLoading && (
          <div className="text-center py-4">
            Transcribing audio...
          </div>
        )}

        {audioUrl && (
          <AudioPlayer
            audioUrl={audioUrl}
            onTimeUpdate={setCurrentTime}
          />
        )}

        {words.length > 0 && (
          <TranscriptionDisplay
            words={words}
            currentTime={currentTime}
            onWordClick={handleWordClick}
          />
        )}
      </div>
    </main>
  );
};

export default Home;
