"use client";
import { useState } from "react";

/**
 * Helper hook for handling actions for dialogs etc
 */
const useActions = <T, M = null>() => {
  const [action, setAction] = useState<T | null>(null);
  const [metadata, setMetadata] = useState<M | null>(null);

  return {
    action: { name: action, data: metadata },
    clearAction: () => {
      setAction(null);
      setMetadata(null);
    },
    setAction: (key: T, metadata?: M) => {
      setAction(key);
      setMetadata(metadata || null);
    },
    isAction: (key: T) => action === key,
  };
};

export default useActions;
