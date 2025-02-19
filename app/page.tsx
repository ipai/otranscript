"use client";

import { useState, useCallback, useEffect } from 'react';
import { AudioPlayer } from './components/AudioPlayer';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';

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

  const handleWordClick = useCallback((time: number) => {
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioElement.currentTime = time;
    }
  }, []);

  return (
    <main className="min-h-screen p-8">
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-2xl mx-auto mb-4">
          <button
            onClick={() => loadSavedTranscription('19720124_atc_03')}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mr-2"
          >
            Load Saved Transcription
          </button>
          {hasLastTranscription && (
            <button
              onClick={() => {
                const data = JSON.parse(window.localStorage.getItem('lastTranscriptionData')!);
                setWords(data.words);
                if (data.paragraphs) setParagraphs(data.paragraphs);
              }}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Load Last Transcription
            </button>
          )}
        </div>
      )}
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
            paragraphs={paragraphs}
            currentTime={currentTime}
            onWordClick={handleWordClick}
          />
        )}
      </div>
    </main>
  );
};

export default Home;
