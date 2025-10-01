'use client';

import { createContext, useContext, useRef, ReactNode, useEffect } from 'react';

interface MediaStreamContextType {
  getMediaStream: () => Promise<MediaStream>;
  stopMediaStream: () => void;
}

const MediaStreamContext = createContext<MediaStreamContextType | null>(null);

export function MediaStreamProvider({ children }: { children: ReactNode }) {
  const streamRef = useRef<MediaStream | null>(null);

  const getMediaStream = async (): Promise<MediaStream> => {
    // Return existing stream if available
    if (streamRef.current && streamRef.current.active) {
      return streamRef.current;
    }

    // Create new stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true,
    });

    streamRef.current = stream;
    return stream;
  };

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, []);

  return (
    <MediaStreamContext.Provider value={{ getMediaStream, stopMediaStream }}>
      {children}
    </MediaStreamContext.Provider>
  );
}

export function useMediaStream() {
  const context = useContext(MediaStreamContext);
  if (!context) {
    throw new Error('useMediaStream must be used within MediaStreamProvider');
  }
  return context;
}
