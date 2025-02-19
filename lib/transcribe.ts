import { createClient } from '@deepgram/sdk';

export interface DeepgramWord {
  word: string;
  punctuated_word?: string;
  start: number;
  end: number;
}

export interface DeepgramSentence {
  text: string;
  start: number;
  end: number;
}

export interface DeepgramParagraph {
  sentences: DeepgramSentence[];
  num_words: number;
  start: number;
  end: number;
}

export interface ProcessedTranscription {
  words: Array<{
    word: string;
    start: number;
    end: number;
  }>;
  paragraphs?: DeepgramParagraph[];
  transcript?: string;
}

export async function transcribeAudio(audioBuffer: Buffer, apiKey: string): Promise<ProcessedTranscription> {
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY not found');
  }

  // Create Deepgram client
  const deepgram = createClient(apiKey);

  try {
    // Transcribe audio
    const response = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-3',
        smart_format: true,
        language: 'en',
        detect_language: true,
        punctuate: true,
        paragraphs: true,
        utterances: false
      }
    );

    if (!response?.result?.results?.channels?.[0]?.alternatives?.[0]) {
      throw new Error('Invalid response structure from Deepgram');
    }

    const alternative = response.result.results.channels[0].alternatives[0];

    // Extract words with timestamps
    const words = alternative.words?.map(word => ({
      word: word.punctuated_word || word.word,
      start: word.start,
      end: word.end
    })) || [];

    return {
      words,
      paragraphs: alternative.paragraphs?.paragraphs,
      transcript: alternative.transcript
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Transcription failed');
  }
}
