"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableTextProps {
    content: string | string[];
    maxLength?: number;
    className?: string;
}

export function ExpandableText({ content, maxLength = 150, className = "" }: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const text = Array.isArray(content) ? content.join("\n\n") : content;

    // If text is short, just show it
    if (text.length <= maxLength) {
        return (
            <div className={`prose prose-neutral text-gray-500 max-w-none text-[10px] leading-tight ${className}`}>
                <ReactMarkdown>{text}</ReactMarkdown>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-1">
            <div className={`prose prose-neutral text-gray-500 max-w-none text-[10px] leading-tight ${className} ${!isExpanded ? 'line-clamp-3' : ''}`}>
                <ReactMarkdown>
                    {text}
                </ReactMarkdown>
            </div>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-800 transition-colors mt-1"
            >
                {isExpanded ? (
                    <>
                        Ler menos <ChevronUp className="h-3 w-3" />
                    </>
                ) : (
                    <>
                        Ler mais <ChevronDown className="h-3 w-3" />
                    </>
                )}
            </button>
        </div>
    );
}
