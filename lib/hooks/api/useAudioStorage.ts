import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  deleteAudio,
  deleteAudioByUrl,
  uploadAudio,
} from "@/lib/utils/audio-storage";

interface UploadAudioOptions {
  questionId: string;
  quizId: string;
  userId: string;
}

type UploadAudioVariables = {
  audioBlob: Blob;
} & UploadAudioOptions;

interface UseUploadAudioOptions {
  onSuccess?: (
    data: { audioUrl: string; path: string },
    variables: UploadAudioVariables
  ) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function useUploadAudio(options?: UseUploadAudioOptions) {
  return useMutation({
    mutationFn: async ({
      audioBlob,
      ...uploadOptions
    }: UploadAudioVariables) => {
      return await uploadAudio(audioBlob, uploadOptions);
    },
    onSuccess: (data, variables) => {
      toast.success("Recording saved successfully!");
      options?.onSuccess?.(data, variables);
    },
    onError: (error: Error) => {
      console.error("Error uploading audio:", error);
      toast.error(
        error.message || "Failed to save recording. Please try again."
      );
      options?.onError?.(error);
    },
  });
}

interface UseDeleteAudioOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeleteAudio(options?: UseDeleteAudioOptions) {
  return useMutation({
    mutationFn: async (filePath: string) => {
      return await deleteAudio(filePath);
    },
    onSuccess: () => {
      toast.success("Recording deleted successfully!");
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Error deleting audio:", error);
      toast.error(
        error.message || "Failed to delete recording. Please try again."
      );
      options?.onError?.(error);
    },
  });
}

export function useDeleteAudioByUrl(options?: UseDeleteAudioOptions) {
  return useMutation({
    mutationFn: async (audioUrl: string) => {
      return await deleteAudioByUrl(audioUrl);
    },
    onSuccess: () => {
      toast.success("Recording deleted successfully!");
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Error deleting audio:", error);
      toast.error(
        error.message || "Failed to delete recording. Please try again."
      );
      options?.onError?.(error);
    },
  });
}
