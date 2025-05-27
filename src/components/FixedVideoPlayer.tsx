import React, { useState, useEffect } from "react";

const FixedVideoPlayer = () => {
  // State for video information
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [markIn, setMarkIn] = useState<number | null>(null);
  const [markOut, setMarkOut] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null,
  );

  // Initialize the video element reference on mount
  useEffect(() => {
    // Create a new video element
    const video = document.createElement("video");
    video.id = "video-player";
    video.className = "w-full h-auto";
    video.src =
      "https://res.cloudinary.com/demo/video/upload/v1611764980/samples/elephants.mp4";
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.muted = false;
    video.controls = false;

    // Add event listeners
    video.addEventListener("loadedmetadata", handleMetadataLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", () => setIsPlaying(true));
    video.addEventListener("pause", () => setIsPlaying(false));
    video.addEventListener("ended", () => setIsPlaying(false));

    // Add to DOM
    const container = document.getElementById("video-container");
    if (container) {
      // Clear any existing video
      container.innerHTML = "";
      container.appendChild(video);
      setVideoElement(video);
      console.log("✅ Video element created and added to DOM");
    }

    // Cleanup function
    return () => {
      video.removeEventListener("loadedmetadata", handleMetadataLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", () => setIsPlaying(true));
      video.removeEventListener("pause", () => setIsPlaying(false));
      video.removeEventListener("ended", () => setIsPlaying(false));

      if (container && container.contains(video)) {
        container.removeChild(video);
      }
    };
  }, []);

  // Handle metadata loaded
  const handleMetadataLoaded = (e: Event) => {
    const video = e.target as HTMLVideoElement;
    console.log("✅ Video metadata loaded:", {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    });
    setDuration(video.duration);
    setMarkOut(video.duration); // Initialize mark out to end of video
  };

  // Handle time updates
  const handleTimeUpdate = (e: Event) => {
    const video = e.target as HTMLVideoElement;
    setCurrentTime(video.currentTime);

    // Check if we need to stop at mark out point
    if (markOut !== null && video.currentTime >= markOut) {
      video.pause();
      setIsPlaying(false);
      console.log(`✅ Reached mark out point at ${markOut.toFixed(2)}s`);
    }
  };

  // Play button handler
  const handlePlay = () => {
    if (!videoElement) {
      console.error("❌ No video element available");
      return;
    }

    console.log("▶️ Play button clicked");

    // If we have mark in point and we're before it, start from there
    if (markIn !== null && videoElement.currentTime < markIn) {
      videoElement.currentTime = markIn;
    }

    // Use a timeout to ensure any state updates have completed
    setTimeout(() => {
      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("✅ Video playing successfully");
          })
          .catch((error) => {
            console.error("❌ Error playing video:", error);
            // Try again with muted if autoplay policy is the issue
            if (error.name === "NotAllowedError") {
              console.log("Trying to play muted due to autoplay policy...");
              videoElement.muted = true;
              videoElement
                .play()
                .then(() => {
                  console.log("✅ Video playing muted");
                  // Unmute after playback starts if possible
                  const unmuteButton = document.createElement("button");
                  unmuteButton.textContent = "Unmute";
                  unmuteButton.className =
                    "absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded";
                  unmuteButton.onclick = () => {
                    videoElement.muted = false;
                    unmuteButton.remove();
                  };
                  const container = document.getElementById("video-container");
                  if (container) {
                    container.appendChild(unmuteButton);
                  }
                })
                .catch((err) =>
                  console.error("❌ Still cannot play even muted:", err),
                );
            }
          });
      }
    }, 0);
  };

  // Pause button handler
  const handlePause = () => {
    if (!videoElement) return;
    console.log("⏸️ Pause button clicked");
    videoElement.pause();
  };

  // Stop button handler
  const handleStop = () => {
    if (!videoElement) return;
    console.log("⏹️ Stop button clicked");
    videoElement.pause();
    videoElement.currentTime = 0;
  };

  // Skip backward button handler
  const handleSkipBackward = () => {
    if (!videoElement) return;
    console.log("⏪ Skip backward button clicked");
    videoElement.currentTime = Math.max(0, videoElement.currentTime - 5);
  };

  // Skip forward button handler
  const handleSkipForward = () => {
    if (!videoElement) return;
    console.log("⏩ Skip forward button clicked");
    videoElement.currentTime = Math.min(duration, videoElement.currentTime + 5);
  };

  // Mark in button handler
  const handleMarkIn = () => {
    if (!videoElement) return;
    console.log("🟢 Mark in button clicked");
    setMarkIn(videoElement.currentTime);
  };

  // Mark out button handler
  const handleMarkOut = () => {
    if (!videoElement) return;
    console.log("🔴 Mark out button clicked");
    setMarkOut(videoElement.currentTime);
  };

  // Preview subclip button handler
  const handlePreviewSubclip = () => {
    if (
      !videoElement ||
      markIn === null ||
      markOut === null ||
      markIn >= markOut
    ) {
      alert("Please set valid mark in and mark out points");
      return;
    }

    console.log("🎬 Preview subclip button clicked");
    videoElement.currentTime = markIn;

    // Use setTimeout to ensure currentTime is set before playing
    setTimeout(() => {
      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(
              `✅ Playing subclip from ${markIn.toFixed(2)}s to ${markOut.toFixed(2)}s`,
            );
          })
          .catch((error) => {
            console.error("❌ Error playing subclip:", error);
          });
      }
    }, 100);
  };

  // Format time as mm:ss
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">🎬 Fixed Video Player</h2>

      {/* Video container */}
      <div
        id="video-container"
        className="bg-black rounded-lg overflow-hidden mb-4 relative"
      >
        {/* Video will be inserted here by useEffect */}
      </div>

      {/* Time display */}
      <div className="flex justify-between mb-4 text-sm">
        <span>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <span>
          {markIn !== null && markOut !== null
            ? `Subclip: ${formatTime(markIn)} - ${formatTime(markOut)} (${formatTime(markOut - markIn)})`
            : "No subclip selected"}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="relative h-2 bg-gray-200 rounded-full mb-4 cursor-pointer"
        onClick={(e) => {
          if (!videoElement) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          videoElement.currentTime = pos * duration;
        }}
      >
        {/* Playback progress */}
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
        />

        {/* Mark in indicator */}
        {markIn !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-green-500 z-10"
            style={{ left: `${(markIn / Math.max(duration, 1)) * 100}%` }}
          />
        )}

        {/* Mark out indicator */}
        {markOut !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 z-10"
            style={{ left: `${(markOut / Math.max(duration, 1)) * 100}%` }}
          />
        )}

        {/* Selected region */}
        {markIn !== null && markOut !== null && (
          <div
            className="absolute top-0 bottom-0 bg-blue-200"
            style={{
              left: `${(markIn / Math.max(duration, 1)) * 100}%`,
              width: `${((markOut - markIn) / Math.max(duration, 1)) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Playback Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleSkipBackward}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ⏪ -5s
        </button>

        {isPlaying ? (
          <button
            onClick={handlePause}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ⏸️ Pause
          </button>
        ) : (
          <button
            onClick={handlePlay}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ▶️ Play
          </button>
        )}

        <button
          onClick={handleStop}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ⏹️ Stop
        </button>

        <button
          onClick={handleSkipForward}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ⏩ +5s
        </button>
      </div>

      {/* Mark In/Out Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleMarkIn}
          className="px-3 py-1 bg-green-100 hover:bg-green-200 border border-green-500 rounded"
        >
          🟢 Mark In
        </button>

        <button
          onClick={handleMarkOut}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 border border-red-500 rounded"
        >
          🔴 Mark Out
        </button>

        <button
          onClick={handlePreviewSubclip}
          disabled={markIn === null || markOut === null || markIn >= markOut}
          className={`px-3 py-1 rounded ${markIn !== null && markOut !== null && markIn < markOut ? "bg-blue-100 hover:bg-blue-200 border border-blue-500" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          🎬 Preview Subclip
        </button>
      </div>

      {/* Debug info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
        <p>
          <strong>⏱️ Current Time:</strong> {currentTime.toFixed(2)}s
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
        <p>
          <strong>🎮 Video Element:</strong>{" "}
          {videoElement ? "✅ Available" : "❌ Not available"}
        </p>
      </div>
    </div>
  );
};

export default FixedVideoPlayer;
