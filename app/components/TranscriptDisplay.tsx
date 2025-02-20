import React from 'react';

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

interface TranscriptDisplayProps {
  words: Word[];
  paragraphs?: Paragraph[];
  transcript?: string;
  currentTime: number;
  onWordClick: (time: number) => void;
  /**
   * Vertical offset from center in percentage (-50 to 50).
   * Positive values move the word up, negative values move it down.
   * e.g., 20 positions the word 20% above center
   */
  verticalOffset?: number;
}

/**
 * Delay in milliseconds before auto-centering is reactivated after manual scroll
 */
const AUTO_REACTIVATION_DELAY = 5000;

/**
 * Duration in milliseconds for the scroll animation to complete
 */
const SCROLL_ANIMATION_DURATION = 1000;

export const TranscriptDisplay = ({
  words,
  paragraphs,
  currentTime,
  onWordClick,
  verticalOffset = 10 ,
}: TranscriptDisplayProps) => {
  // Reference to the scrollable container element
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Reference to the currently active word element
  const activeWordRef = React.useRef<HTMLSpanElement>(null);
  
  // Controls whether auto-centering is enabled
  const [autoCenterEnabled, setAutoCenterEnabled] = React.useState(true);
  
  // Timeout for reactivating auto-center after manual scroll
  const reactivationTimeout = React.useRef<NodeJS.Timeout>();
  
  // Flag to distinguish between manual and automatic scrolling
  const isAutoScrolling = React.useRef(false);

  /**
   * Centers the currently active word in the viewport with smooth scrolling.
   * Sets isAutoScrolling flag during the animation to prevent manual scroll detection.
   */
  const centerActiveWord = React.useCallback(() => {
    const clampedOffset = Math.max(-50, Math.min(50, verticalOffset));
    if (!activeWordRef.current || !scrollContainerRef.current) return;
    
    isAutoScrolling.current = true;
    const container = scrollContainerRef.current;
    const wordElement = activeWordRef.current;
    
    if (!container || !wordElement) return;

    const containerRect = container.getBoundingClientRect();
    const wordRect = wordElement.getBoundingClientRect();
    
    // Calculate the target scroll position with offset
    const offsetPixels = (containerRect.height * clampedOffset) / 100;
    const targetY = container.scrollTop + 
                   (wordRect.top - containerRect.top) - 
                   (containerRect.height / 2) + 
                   offsetPixels;

    container.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      isAutoScrolling.current = false;
    }, SCROLL_ANIMATION_DURATION);
  }, [verticalOffset]);

  /**
   * Handles manual scroll events and manages auto-centering behavior.
   * - Disables auto-centering when user manually scrolls
   * - Sets up a timer to reactivate auto-centering after no scroll activity
   */
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isAutoScrolling.current) return;

      if (autoCenterEnabled) {
        setAutoCenterEnabled(false);
      }

      if (reactivationTimeout.current) {
        clearTimeout(reactivationTimeout.current);
      }

      reactivationTimeout.current = setTimeout(() => {
        setAutoCenterEnabled(true);
      }, AUTO_REACTIVATION_DELAY);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (reactivationTimeout.current) {
        clearTimeout(reactivationTimeout.current);
      }
    };
  }, [autoCenterEnabled]);

  // Center the active word when currentTime changes and auto-center is enabled
  /**
   * Triggers auto-centering when the current time changes.
   * Only runs if auto-centering is enabled.
   * Uses a small timeout to ensure DOM updates are complete.
   */
  React.useEffect(() => {
    if (!autoCenterEnabled) return;
    const timeoutId = setTimeout(centerActiveWord, 0);
    return () => clearTimeout(timeoutId);
  }, [currentTime, autoCenterEnabled, centerActiveWord]);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 relative">
      {/* Auto-center toggle button */}
      {/* Toggle button for auto-centering feature */}
      <button
        onClick={() => {
          const newState = !autoCenterEnabled;
          setAutoCenterEnabled(newState);
          if (newState) centerActiveWord();
        }}
        className={`auto-center-button ${autoCenterEnabled ? 'auto-center-active' : ''}`}
        aria-label={`Toggle auto-centering ${autoCenterEnabled ? 'off' : 'on'}`}
      >
        Auto-Center {autoCenterEnabled ? 'On' : 'Off'}
      </button>

      <div className="transcription-container backdrop-blur-sm bg-white/60 rounded-lg shadow-lg border border-white/20">
      <div 
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto scroll-smooth rounded-lg"
        style={{ 
          paddingTop: '15%',
          paddingBottom: '15%'
        }}
      >
      {/* Paragraph view */}
      {paragraphs ? (
        <div className="space-y-8 px-6">
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
                          ref={isActive ? activeWordRef : null}
                          className={`word-highlight ${isActive ? 'word-highlight-active' : 'word-highlight-inactive'}`}
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
        <div className="space-x-1 px-6">
          {words.map((word, index) => {
            const isActive = currentTime >= word.start && currentTime <= word.end;
            return (
              <span
                key={`${word.start}-${index}`}
                onClick={() => onWordClick(word.start)}
                ref={isActive ? activeWordRef : null}
                className={`word-highlight ${isActive ? 'word-highlight-active' : 'word-highlight-inactive'}`}
              >
                {word.word}
              </span>
            );
          })}
        </div>
      )}
      </div>
      </div>
    </div>
  );
};
