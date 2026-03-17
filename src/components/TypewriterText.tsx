import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text1: string;
  text2: string;
  speed?: number;
  pause?: number;
  onComplete?: () => void;
}

export default function TypewriterText({ text1, text2, speed = 40, pause = 400, onComplete }: TypewriterTextProps) {
  const [index1, setIndex1] = useState(0);
  const [index2, setIndex2] = useState(0);
  const [isFirstDone, setIsFirstDone] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [cursorFade, setCursorFade] = useState(false);

  useEffect(() => {
    if (index1 < text1.length) {
      const timeout = setTimeout(() => {
        setIndex1(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (!isFirstDone) {
      const timeout = setTimeout(() => {
        setIsFirstDone(true);
      }, pause);
      return () => clearTimeout(timeout);
    } else if (index2 < text2.length) {
      const timeout = setTimeout(() => {
        setIndex2(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
      const blinkTimeout = setTimeout(() => {
        setCursorFade(true);
        setTimeout(() => setCursorVisible(false), 500);
      }, 1500);
      return () => clearTimeout(blinkTimeout);
    }
  }, [index1, index2, isFirstDone, isComplete, text1, text2, speed, pause, onComplete]);

  return (
    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight min-h-[2.5em] md:min-h-[2em]">
      <span>{text1.substring(0, index1)}</span>
      {index1 === text1.length && <br />}
      <span className="text-zinc-500">
        {text2.substring(0, index2)}
      </span>
      {cursorVisible && (
        <span 
          className={`text-emerald-500 transition-opacity duration-500 inline-block ml-1 ${!isComplete ? 'animate-typewriter-cursor' : ''}`}
          style={{ opacity: cursorFade ? 0 : 1 }}
        >
          |
        </span>
      )}
      <style>{`
        @keyframes typewriter-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-typewriter-cursor {
          animation: typewriter-cursor 0.5s step-end infinite;
        }
      `}</style>
    </h2>
  );
}
