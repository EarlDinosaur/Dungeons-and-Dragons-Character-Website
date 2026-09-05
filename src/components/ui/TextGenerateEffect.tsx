'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TextGenerateEffectProps {
  text: string;
  className?: string;
  delay?: number;
}

/**
 * Aceternity-style text generate effect — words fade in one by one.
 */
export default function TextGenerateEffect({
  text,
  className,
  delay = 0,
}: TextGenerateEffectProps) {
  const [visibleWords, setVisibleWords] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleWords((prev) => {
          if (prev >= words.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 80);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [words.length, delay]);

  return (
    <span className={cn('inline', className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block mr-[0.25em] transition-all duration-300"
          style={{
            opacity: i < visibleWords ? 1 : 0,
            transform: i < visibleWords ? 'translateY(0)' : 'translateY(8px)',
            filter: i < visibleWords ? 'blur(0)' : 'blur(4px)',
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
