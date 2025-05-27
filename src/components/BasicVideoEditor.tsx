import React, { useRef, useState, useEffect } from "react";

const BasicVideoEditor = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [markIn, setMarkIn] = useState<number | null>(null);
  const [markOut, setMarkOut] = useState<number | null>(null);

  // Initialize video metadata
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  // Controls
  const handlePlay = () => {
    if (videoRef.current) videoRef.current.play();
  };

  const handlePause = () => {
    if (videoRef.current) videoRef.current.pause();
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleSkipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 5,
      );
    }
  };

  const handleStepBack = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        videoRef.current.currentTime - 1 / 30,
      );
    }
  };

  const handlePreviewSubclip = () => {
    if (
      videoRef.current &&
      markIn !== null &&
      markOut !== null &&
      markOut > markIn
    ) {
      videoRef.current.currentTime = markIn;
      videoRef.current.play();

      const stopAtOut = () => {
        if (videoRef.current && videoRef.current.currentTime >= markOut) {
          videoRef.current.pause();
          videoRef.current.removeEventListener("timeupdate", stopAtOut);
        }
      };

      videoRef.current.addEventListener("timeupdate", stopAtOut);
    } else {
      alert("Mark In and Mark Out must be set correctly.");
    }
  };

  // Debug ref on first render
  useEffect(() => {
    if (!videoRef.current) {
      console.error("❌ videoRef is not set on mount.");
    } else {
      console.log("✅ videoRef initialized:", videoRef.current);
    }
  }, []);

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h2>🎬 Video Editor</h2>

      {/* Video Preview Box */}
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/demo/video/upload/sample.mp4"
        width="640"
        height="360"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        controls={false}
        style={{ display: "block", marginBottom: "10px", background: "#000" }}
      />

      {/* Playback Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "1rem",
        }}
      >
        <button onClick={handleStepBack}>⬅ Step Back</button>
        <button onClick={handlePlay}>▶ Play</button>
        <button onClick={handlePause}>⏸ Pause</button>
        <button onClick={handleSkipForward}>⏩ +5s</button>
        <button onClick={handleStop}>⏹ Stop</button>
        <button onClick={() => setMarkIn(currentTime)}>📍 Mark In</button>
        <button onClick={() => setMarkOut(currentTime)}>🎯 Mark Out</button>
        <button onClick={handlePreviewSubclip}>🎞 Preview Subclip</button>
      </div>

      {/* Info */}
      <div style={{ lineHeight: "1.5" }}>
        <p>
          <strong>⏱ Current Time:</strong> {currentTime.toFixed(2)}s
        </p>
        <p>
          <strong>🟢 Mark In:</strong>{" "}
          {markIn !== null ? `${markIn.toFixed(2)}s` : "Not set"}
        </p>
        <p>
          <strong>🔴 Mark Out:</strong>{" "}
          {markOut !== null ? `${markOut.toFixed(2)}s` : "Not set"}
        </p>
        <p>
          <strong>📏 Subclip Duration:</strong>{" "}
          {markIn !== null && markOut !== null
            ? `${(markOut - markIn).toFixed(2)}s`
            : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default BasicVideoEditor;
