import React, { useState, useRef, useEffect } from "react";
import { extractVideoId } from "@/lib/utils";
import { VideoPlayerProps } from "@/types";

const YouTubePlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  title,
  width = "100%",
  height = "100%",
  onReady,
  onStateChange,
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);
  
  const videoId = extractVideoId(videoUrl);
  
  const handlePlay = () => {
    setLoading(true);
    setShowVideo(true);
  };
  
  useEffect(() => {
    // Initialize the YouTube API if it's not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    
    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.src = '';
      }
    };
  }, []);
  
  if (!videoId) {
    return (
      <div className="flex items-center justify-center bg-gray-200 rounded-lg">
        <p className="text-gray-500">Invalid video URL</p>
      </div>
    );
  }
  
  return (
    <div className="relative rounded-lg overflow-hidden" style={{ width, paddingBottom: showVideo ? '56.25%' : 'auto' }}>
      {!showVideo ? (
        <div className="relative w-full h-48">
          <img 
            src={thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={title || "Video thumbnail"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-royal-purple/50 to-transparent flex items-center justify-center">
            <button 
              onClick={handlePlay}
              className="bg-royal-purple/80 hover:bg-royal-purple text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300"
              aria-label="Play video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
              <h3 className="text-white text-sm font-medium truncate">{title}</h3>
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0">
          <iframe
            ref={playerRef}
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title || "YouTube video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            onLoad={() => {
              setLoading(false);
              onReady?.();
            }}
          ></iframe>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
