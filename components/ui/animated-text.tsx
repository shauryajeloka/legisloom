"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  speed?: number; // ms per character
  delay?: number; // initial delay in ms
}

export function AnimatedText({
  text,
  className,
  speed = 30,
  delay = 300,
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText("");
    setIsComplete(false);
    setStartAnimation(false);

    // Start animation after delay
    const startTimer = setTimeout(() => {
      setStartAnimation(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!startAnimation) return;

    let currentIndex = 0;
    const textLength = text.length;

    // Don't start animation if there's no text
    if (textLength === 0) {
      setIsComplete(true);
      return;
    }

    const animationInterval = setInterval(() => {
      if (currentIndex < textLength) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(animationInterval);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(animationInterval);
  }, [text, speed, startAnimation]);

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "transition-opacity duration-500",
          isComplete ? "opacity-100" : "opacity-80"
        )}
      >
        {displayedText}
        {!isComplete && (
          <span className="animate-pulse ml-0.5 -mr-0.5">|</span>
        )}
      </div>
    </div>
  );
} 