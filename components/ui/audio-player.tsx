"use client";

import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
}

export const AudioPlayer = ({ audioUrl, className }: AudioPlayerProps) => {
  return (
    <div
      className={cn(
        "p-3 md:p-4 rounded-lg border bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
        className
      )}
    >
      <audio controls className="w-full">
        <source src={audioUrl} type="audio/mpeg" />
        <source src={audioUrl} type="audio/ogg" />
        <source src={audioUrl} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};
