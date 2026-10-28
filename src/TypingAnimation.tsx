import './styles/theme.css';
import './styles/typing-animation.css';
import { useEffect, useRef, useState, type HTMLAttributes } from 'react';

export interface TypingAnimationProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  cursor?: boolean;
}

export function TypingAnimation({
  words,
  typeSpeed = 75,
  deleteSpeed = 38,
  pauseDuration = 1300,
  loop = true,
  cursor = true,
  className = '',
  ...props
}: TypingAnimationProps) {
  const wordsRef = useRef(words);
  wordsRef.current = words;
  const wordsKey = words.join('\u0000');
  const [text, setText] = useState('');

  useEffect(() => {
    const values = wordsRef.current;
    if (values.length === 0) {
      setText('');
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(values[0]);
      return;
    }

    let timeout = 0;
    let wordIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    const tick = () => {
      const currentWord = wordsRef.current[wordIndex] ?? '';
      if (!deleting) {
        characterIndex += 1;
        setText(currentWord.slice(0, characterIndex));
        if (characterIndex >= currentWord.length) {
          deleting = true;
          timeout = window.setTimeout(tick, pauseDuration);
          return;
        }
      } else {
        characterIndex = Math.max(0, characterIndex - 1);
        setText(currentWord.slice(0, characterIndex));
        if (characterIndex === 0) {
          deleting = false;
          if (!loop && wordIndex === wordsRef.current.length - 1) {
            setText(currentWord);
            return;
          }
          wordIndex = (wordIndex + 1) % wordsRef.current.length;
        }
      }
      timeout = window.setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
    };

    setText('');
    timeout = window.setTimeout(tick, Math.max(0, typeSpeed));
    return () => window.clearTimeout(timeout);
  }, [deleteSpeed, loop, pauseDuration, typeSpeed, wordsKey]);

  return <span {...props} className={`at-typing-animation ${cursor ? 'at-typing-animation--cursor' : ''} ${className}`} aria-live="off">{text}</span>;
}