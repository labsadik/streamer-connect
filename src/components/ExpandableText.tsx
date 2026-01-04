
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function ExpandableText({ text, maxLength = 150, className = "" }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <p className={className}>{text}</p>;
  }

  const truncatedText = text.slice(0, maxLength);

  return (
    <div className={className}>
      <p className="whitespace-pre-wrap">
        {isExpanded ? text : `${truncatedText}...`}
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-0 h-auto text-blue-600 hover:text-blue-800 hover:bg-transparent mt-1"
      >
        {isExpanded ? (
          <>
            Show less <ChevronUp className="h-3 w-3 ml-1" />
          </>
        ) : (
          <>
            Show more <ChevronDown className="h-3 w-3 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
}
