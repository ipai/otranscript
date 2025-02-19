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

interface TranscriptionDisplayProps {
  words: Word[];
  paragraphs?: Paragraph[];
  transcript?: string;
  currentTime: number;
  onWordClick: (time: number) => void;
}

/**
 * Delay in milliseconds before auto-centering is reactivated after manual scroll
 */
const AUTO_REACTIVATION_DELAY = 5000;

/**
 * Duration in milliseconds for the scroll animation to complete
 */
const SCROLL_ANIMATION_DURATION = 1000;

/**
 * TranscriptionDisplay component displays a scrollable transcript with auto-centering
 * capability for the currently active word. It supports both paragraph and word views,
 * and allows users to toggle automatic centering behavior.
 */
export const TranscriptionDisplay = ({
  words,
  paragraphs,
  currentTime,
  onWordClick,
}: TranscriptionDisplayProps) => {
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
    if (!activeWordRef.current || !scrollContainerRef.current) return;
    
    isAutoScrolling.current = true;
    activeWordRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
    
    setTimeout(() => {
      isAutoScrolling.current = false;
    }, SCROLL_ANIMATION_DURATION);
  }, []);

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
        className={`
          absolute right-4 top-4 z-10 px-3 py-1.5 
          rounded-full text-sm font-medium transition-colors
          ${autoCenterEnabled 
            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
        `}
        aria-label={`Toggle auto-centering ${autoCenterEnabled ? 'off' : 'on'}`}
      >
        Auto-Center {autoCenterEnabled ? 'On' : 'Off'}
      </button>

      <div className="bg-white rounded-lg shadow-md relative h-[600px]">
      <div 
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto scroll-smooth"
        style={{ 
          paddingTop: '200px',
          paddingBottom: '200px'
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
        <div className="space-x-1 px-6">
          {words.map((word, index) => {
            const isActive = currentTime >= word.start && currentTime <= word.end;
            return (
              <span
                key={`${word.start}-${index}`}
                onClick={() => onWordClick(word.start)}
                ref={isActive ? activeWordRef : null}
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
      </div>
    </div>
  );
};
