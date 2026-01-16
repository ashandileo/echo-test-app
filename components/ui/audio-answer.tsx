"use client";

import { useEffect, useRef, useState } from "react";

import {
  Clock,
  FileAudio,
  Mic,
  Pause,
  Play,
  Square,
  Trash2,
  Upload,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { Button } from "./button";

interface AudioAnswerProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onRecordingDelete?: () => void;
  existingAudioUrl?: string | null;
  className?: string;
}

type AudioSource = "recorder" | "upload";

export const AudioAnswer = ({
  onRecordingComplete,
  onRecordingDelete,
  existingAudioUrl,
  className,
}: AudioAnswerProps) => {
  const [audioSource, setAudioSource] = useState<AudioSource | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(
    existingAudioUrl || null
  );
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl && !existingAudioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl, existingAudioUrl]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);

        // Save recording duration before reset
        setAudioDuration(recordingTime);

        setAudioUrl(url);
        setAudioSource("recorder");
        setAudioFileName("recording.webm");
        onRecordingComplete(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      // Update refs FIRST before state
      isRecordingRef.current = true;
      isPausedRef.current = false;

      // Then update state
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Could not access microphone. Please check your browser permissions."
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      isPausedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();

      // Update refs FIRST before state
      isPausedRef.current = false;

      // Then update state
      setIsPaused(false);

      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      isRecordingRef.current = false;
      isPausedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/m4a",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(mp3|wav|webm|ogg|m4a)$/i)
    ) {
      alert("Please upload a valid audio file (MP3, WAV, WebM, OGG, or M4A)");
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert("File size must be less than 50MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioSource("upload");
    setAudioFileName(file.name);
    onRecordingComplete(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmDelete = () => {
    setShowDeleteDialog(true);
  };

  const deleteRecording = () => {
    if (audioUrl && !existingAudioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioSource(null);
    setAudioFileName("");
    setRecordingTime(0);
    setAudioDuration(0);
    setIsPlaying(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }

    // Notify parent component about deletion
    if (onRecordingDelete) {
      onRecordingDelete();
    }

    // Close dialog
    setShowDeleteDialog(false);
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Card - Shows status or playback */}
      {!isRecording ? (
        // Not Recording - Show status or playback
        <div className="p-4 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border-2 border-indigo-200 dark:border-indigo-800">
          {audioUrl ? (
            // Has recording/upload - Show playback controls
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-3 h-3 rounded-full bg-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {audioSource === "recorder"
                        ? "Recording Ready"
                        : "Audio Uploaded"}
                    </p>
                    {audioSource === "upload" && audioFileName && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                        <FileAudio className="h-3 w-3 shrink-0" />
                        {audioFileName}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      Duration: {formatTime(audioDuration || recordingTime)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={confirmDelete}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>

              {/* Audio Player */}
              <audio
                ref={audioElementRef}
                src={audioUrl}
                onLoadedMetadata={(e) => {
                  const audio = e.currentTarget;
                  if (audio.duration && !isNaN(audio.duration)) {
                    setAudioDuration(Math.floor(audio.duration));
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={(e) => {
                  const audio = e.currentTarget;
                  if (audioElementRef.current) {
                    const progress = (audio.currentTime / audio.duration) * 100;
                    const progressBar =
                      document.getElementById("audio-progress");
                    if (progressBar) {
                      progressBar.style.width = `${progress}%`;
                    }
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={togglePlayback}
                  size="sm"
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      id="audio-progress"
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // No recording - Show ready status
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Ready to Submit Audio
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Record or upload an audio file
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Currently Recording - Show recording status and waveform
        <>
          <div className="p-4 bg-linear-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-xl border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Recording indicator */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    isPaused ? "bg-orange-500" : "bg-red-500 animate-pulse"
                  )}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {isPaused ? "Paused" : "Recording"}
                </span>
              </div>

              {/* Time display */}
              <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {formatTime(recordingTime)}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Recording/Upload Controls */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {!isRecording && !audioUrl && (
          <>
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Mic className="h-5 w-5 mr-2" />
              Record Audio
            </Button>

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                variant="outline"
                className="border-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload File
              </Button>
            </div>
          </>
        )}

        {isRecording && (
          <>
            {!isPaused ? (
              <Button
                onClick={pauseRecording}
                size="lg"
                variant="outline"
                className="border-2"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={resumeRecording}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Mic className="h-5 w-5 mr-2" />
                Resume
              </Button>
            )}

            <Button
              onClick={stopRecording}
              size="lg"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop & Save
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-1">
        {!audioUrl && !isRecording && (
          <>
            <p className="font-medium">
              Choose how to submit your audio answer:
            </p>
            <div className="flex items-start justify-center gap-4 mt-2 text-xs">
              <div className="flex-1 max-w-xs p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <p className="font-semibold text-indigo-900 dark:text-indigo-300">
                    Record
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Record directly from your browser
                </p>
              </div>
              <div className="flex-1 max-w-xs p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FileAudio className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <p className="font-semibold text-purple-900 dark:text-purple-300">
                    Upload
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload pre-recorded audio (MP3, WAV, etc.)
                </p>
              </div>
            </div>
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mt-3">
              ⚠️ You can only submit 1 audio per question
            </p>
          </>
        )}
        {isRecording && (
          <>
            <p>Speak clearly into your microphone. You can pause and resume.</p>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Recording will be saved when you click &quot;Stop & Save&quot;
            </p>
          </>
        )}
        {audioUrl && !isRecording && (
          <>
            <p className="font-medium text-green-700 dark:text-green-400">
              ✓ Your audio has been saved successfully!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can play it back using the button above
            </p>
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
              💡 To {audioSource === "recorder" ? "record" : "upload"} again,
              delete this audio first
            </p>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audio?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this audio? This action cannot be
              undone and you will need to{" "}
              {audioSource === "recorder" ? "record" : "upload"} again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteRecording}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
