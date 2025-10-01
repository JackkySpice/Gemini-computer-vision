'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useMediaStream } from '@/lib/MediaStreamContext';
import VideoCanvas from '@/components/VideoCanvas';
import Overlay from '@/components/Overlay';
import { LiveClient } from '@/lib/liveClient';

export default function Home() {
  const {
    erMode,
    thinkingBudget,
    queries,
    latencyMs,
    fps,
    isLiveActive,
    liveTranscript,
    setErMode,
    setThinkingBudget,
    setQueries,
    setLiveActive,
    setLiveTranscript,
  } = useStore();

  const [queriesInput, setQueriesInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [videoSize, setVideoSize] = useState({ width: 1280, height: 720 });
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const liveClientRef = useRef<LiveClient | null>(null);
  
  const { getMediaStream } = useMediaStream();

  // Update video size based on actual rendered size
  useEffect(() => {
    const updateSize = () => {
      if (videoContainerRef.current) {
        const video = videoContainerRef.current.querySelector('video');
        if (video) {
          setVideoSize({
            width: video.videoWidth || 1280,
            height: video.videoHeight || 720,
          });
        }
      }
    };

    const interval = setInterval(updateSize, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQueriesChange = (value: string) => {
    setQueriesInput(value);
    const parsed = value
      .split(',')
      .map((q) => q.trim())
      .filter((q) => q.length > 0);
    setQueries(parsed);
  };

  const handleStartLive = async () => {
    try {
      // Get shared media stream
      const mediaStream = await getMediaStream();

      // Create live client
      liveClientRef.current = new LiveClient({
        onTranscript: (text) => {
          setLiveTranscript(text);
        },
        onError: (error) => {
          console.error('Live API error:', error);
          alert(`Live API error: ${error.message}`);
          handleStopLive();
        },
      });

      await liveClientRef.current.start(mediaStream);
      setLiveActive(true);
    } catch (error: any) {
      console.error('Failed to start Live API:', error);
      alert(`Failed to start Live API: ${error.message}`);
    }
  };

  const handleStopLive = () => {
    if (liveClientRef.current) {
      liveClientRef.current.stop();
      liveClientRef.current = null;
    }

    setLiveActive(false);
    setLiveTranscript('');
  };

  const handleSendText = async () => {
    if (!liveClientRef.current || !textInput.trim()) return;

    try {
      await liveClientRef.current.sendText(textInput);
      setTextInput('');
    } catch (error: any) {
      console.error('Failed to send text:', error);
      alert(`Failed to send text: ${error.message}`);
    }
  };

  const estimatedCost = (fps * 0.0001).toFixed(4); // Rough estimate

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gemini Robotics Live
          </h1>
          <p className="text-gray-600">
            Real-time spatial reasoning with ER 1.5 + Live API
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Video + Overlay */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="relative" ref={videoContainerRef}>
                <VideoCanvas />
                <Overlay videoWidth={videoSize.width} videoHeight={videoSize.height} />
              </div>

              {/* Stats Footer */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs uppercase font-medium">Latency</div>
                  <div className="text-2xl font-bold text-gray-900">{latencyMs}ms</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs uppercase font-medium">FPS</div>
                  <div className="text-2xl font-bold text-gray-900">{fps.toFixed(1)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs uppercase font-medium">Est. Cost/min</div>
                  <div className="text-2xl font-bold text-gray-900">${estimatedCost}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-6">
            {/* ER Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">ER Controls</h2>

              <div className="space-y-4">
                {/* Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detection Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['points', 'boxes', 'trajectory'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setErMode(mode)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          erMode === mode
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thinking Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thinking Budget: {thinkingBudget}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={thinkingBudget}
                    onChange={(e) => setThinkingBudget(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Fast (0)</span>
                    <span>Accurate (8)</span>
                  </div>
                </div>

                {/* Queries */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Object Queries (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={queriesInput}
                    onChange={(e) => handleQueriesChange(e.target.value)}
                    placeholder="e.g., banana, bowl, cup"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to detect all objects
                  </p>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Presets
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleQueriesChange('banana, bowl, cup')}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700"
                    >
                      Kitchen Items
                    </button>
                    <button
                      onClick={() => handleQueriesChange('person, face, hand')}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700"
                    >
                      People
                    </button>
                    <button
                      onClick={() => handleQueriesChange('')}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live API Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Live API</h2>

              <div className="space-y-4">
                {/* Start/Stop */}
                <button
                  onClick={isLiveActive ? handleStopLive : handleStartLive}
                  className={`w-full px-4 py-3 rounded-lg font-medium text-white transition-colors ${
                    isLiveActive
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isLiveActive ? '🔴 Stop Live Session' : '🎙️ Start Live Session'}
                </button>

                {/* Text Input */}
                {isLiveActive && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Send Text Message
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleSendText}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                          Send
                        </button>
                      </div>
                    </div>

                    {/* Transcript */}
                    {liveTranscript && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-xs font-medium text-blue-700 mb-1">Transcript</div>
                        <div className="text-sm text-blue-900">{liveTranscript}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 text-xl">⚠️</div>
                <div>
                  <div className="font-medium text-yellow-900 text-sm mb-1">
                    Privacy & Consent
                  </div>
                  <div className="text-xs text-yellow-800">
                    Camera is active. Frames are sent to Gemini ER for processing. No frames are
                    stored. Please obtain consent if others may appear on camera.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}