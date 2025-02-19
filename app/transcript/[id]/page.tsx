'use client';

import { useEffect, useState, useCallback } from 'react';
import { AudioPlayer } from '@/app/components/AudioPlayer';
import { TranscriptDisplay } from '@/app/components/TranscriptDisplay';
import { UploadProgress } from '@/app/components/UploadProgress';
import { Footer } from '@/app/components/Footer';

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

export default function TranscriptPage({ params }: { params: { id: string } }) {
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTranscript() {
      try {
        const response = await fetch(`/api/transcript/${params.id}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to load transcript');
        }

        const { transcript, audioUrl } = await response.json();
        setWords(transcript.words);
        if (transcript.paragraphs) {
          setParagraphs(transcript.paragraphs);
        }
        setAudioUrl(audioUrl);
      } catch (error) {
        console.error('Error loading transcript:', error);
        setError(error instanceof Error ? error.message : 'Failed to load transcript');
      } finally {
        setIsLoading(false);
      }
    }

    loadTranscript();
  }, [params.id]);

  const handleWordClick = useCallback((time: number) => {
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioElement.currentTime = time;
    }
  }, []);

  const handleFileSelect = () => {
    window.location.href = '/';
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/"
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="text-gray-600">Loading transcript...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <main className="p-8 relative pb-16">
        <div className="container mx-auto max-w-3xl flex flex-col">
          <AudioPlayer
            audioUrl={audioUrl}
            onTimeUpdate={setCurrentTime}
            onNewFileClick={handleFileSelect}
          />

          {words.length > 0 && (
            <TranscriptDisplay
              words={words}
              paragraphs={paragraphs}
              currentTime={currentTime}
              onWordClick={handleWordClick}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
