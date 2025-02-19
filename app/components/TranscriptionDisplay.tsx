interface Word {
  word: string;
  start: number;
  end: number;
}

interface Sentence {
  text: string;
  start: number;
  end: number;
}

interface Paragraph {
  sentences: Sentence[];
  num_words: number;
  start: number;
  end: number;
}

interface TranscriptionDisplayProps {
  words: Word[];
  paragraphs?: Paragraph[];
  transcript?: string;
  currentTime: number;
  onWordClick: (time: number) => void;
}

export const TranscriptionDisplay = ({
  words,
  paragraphs,
  currentTime,
  onWordClick,
}: TranscriptionDisplayProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-md">
      {/* Paragraph view */}
      {paragraphs ? (
        <div className="space-y-8">
          {paragraphs.map((paragraph, pIndex) => (
            <div key={pIndex} className="paragraph">
              {paragraph.sentences.map((sentence, sIndex) => {
                // Find words that belong to this sentence
                const sentenceWords = words.filter(
                  word => word.start >= sentence.start && word.end <= sentence.end
                );

                return (
                  <div 
                    key={sIndex} 
                    className="sentence leading-normal inline"
                  >
                    {sentenceWords.map((word, wIndex) => {
                      const isActive = currentTime >= word.start && currentTime <= word.end;
                      return (
                        <span
                          key={`${word.start}-${wIndex}`}
                          onClick={() => onWordClick(word.start)}
                          className={`cursor-pointer inline-block text-gray-900
                            ${isActive ? 'bg-blue-200' : 'hover:bg-gray-100'}
                            px-0.5 py-0.5 rounded transition-colors duration-200`}
                        >
                          {word.word}{' '}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        // Fallback to simple word view
        <div className="space-x-1">
          {words.map((word, index) => {
            const isActive = currentTime >= word.start && currentTime <= word.end;
            return (
              <span
                key={`${word.start}-${index}`}
                onClick={() => onWordClick(word.start)}
                className={`cursor-pointer inline-block text-gray-900
                  ${isActive ? 'bg-blue-200' : 'hover:bg-gray-100'}
                  px-0.5 py-0.5 rounded transition-colors duration-200`}
              >
                {word.word}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
