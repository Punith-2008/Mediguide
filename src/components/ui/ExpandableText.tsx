"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  asBullets?: boolean;
  className?: string;
}

export default function ExpandableText({ text, maxLength = 300, asBullets = false, className = "" }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text === "Information not provided.") {
    return <p className={className}>{text}</p>;
  }

  // Handle Bullet Points Rendering
  if (asBullets) {
    // Split by period followed by space or end of string to get sentences
    const sentences = text.split(/(?<=\.)\s+/).filter(s => s.trim().length > 3);
    
    // If it's a very short text that can't be bulleted well, just render it normally
    if (sentences.length <= 1) {
      return <p className={className}>{text}</p>;
    }

    const visibleSentences = isExpanded ? sentences : sentences.slice(0, 2);
    const hasMore = sentences.length > 2;

    return (
      <div className={className}>
        <ul className="list-disc pl-5 space-y-1.5">
          {visibleSentences.map((sentence, idx) => (
            <li key={idx}>{sentence}</li>
          ))}
        </ul>
        {hasMore && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-primary font-medium text-sm flex items-center hover:underline"
          >
            {isExpanded ? (
              <><ChevronUp className="h-4 w-4 mr-1" /> Read Less</>
            ) : (
              <><ChevronDown className="h-4 w-4 mr-1" /> Read More</>
            )}
          </button>
        )}
      </div>
    );
  }

  // Handle Normal Text Rendering
  const isLong = text.length > maxLength;
  const displayText = isExpanded || !isLong ? text : text.substring(0, maxLength) + "...";

  return (
    <div className={className}>
      <p>{displayText}</p>
      {isLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-primary font-medium text-sm flex items-center hover:underline"
        >
          {isExpanded ? (
            <><ChevronUp className="h-4 w-4 mr-1" /> Read Less</>
          ) : (
            <><ChevronDown className="h-4 w-4 mr-1" /> Read More</>
          )}
        </button>
      )}
    </div>
  );
}
