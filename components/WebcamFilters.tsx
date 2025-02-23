"use client";

import type React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Circle,
  CloudyIcon as Blur,
  Grid3X3,
  Flower2,
  Waves,
  Hash,
} from "lucide-react";
import { filters, type Filter } from "@/utils/filters";

const filterIcons = {
  "Motion Blur": Circle,
  "Left the Soul": Blur,
  Pixelate: Grid3X3,
  Kaleidoscope: Flower2,
  "Water Ripple": Waves,
  "ASCII Art": Hash,
};

export default function WebcamFilters() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [currentFilter, setCurrentFilter] = useState<Filter>(filters[0]);

  const initializeWebcam = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

    try {
      // Clean up previous stream if it exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for loadedmetadata before playing
        await new Promise((resolve) => {
          if (!videoRef.current) return;
          videoRef.current.onloadedmetadata = resolve;
        });
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing the webcam:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (mounted) {
        await initializeWebcam();
      }
    };

    init();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [initializeWebcam]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationFrameId: number;

    const draw = () => {
      // Get context with willReadFrequently option
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        currentFilter.apply(ctx, canvas.width, canvas.height);
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleCanvasSize = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };

    video.addEventListener("loadedmetadata", handleCanvasSize);

    // Start the animation loop when the video is ready
    if (video.readyState >= 2) {
      draw();
    } else {
      video.addEventListener("canplay", draw);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener("loadedmetadata", handleCanvasSize);
      video.removeEventListener("canplay", draw);
    };
  }, [currentFilter]);

  const handleFilterChange = (filter: Filter) => {
    setCurrentFilter(filter);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <video ref={videoRef} className="hidden" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {filters.map((filter) => (
          <FilterButton
            key={filter.name}
            filter={filter}
            isActive={currentFilter.name === filter.name}
            onClick={() => handleFilterChange(filter)}
          />
        ))}
      </div>
    </div>
  );
}

interface FilterButtonProps {
  filter: Filter;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  filter,
  isActive,
  onClick,
}) => {
  const Icon = filterIcons[filter.name as keyof typeof filterIcons];
  return (
    <Button
      onClick={onClick}
      variant={isActive ? "default" : "outline"}
      className="flex items-center"
    >
      {filter.name === "ASCII Art" ? (
        <ASCIIPreview />
      ) : (
        <Icon className="w-6 h-6" />
      )}
      <span className="ml-2">{filter.name}</span>
    </Button>
  );
};

const ASCIIPreview: React.FC = () => {
  const ascii = "@#$%=+*^·.";
  const [chars, setChars] = useState<string[]>([]);

  useEffect(() => {
    const newChars = Array.from(
      { length: 9 },
      () => ascii[Math.floor(Math.random() * ascii.length)]
    );
    setChars(newChars);
  }, []);

  return (
    <div className="w-6 h-6 bg-black text-white text-[6px] grid grid-cols-3 place-items-center">
      {chars.map((char, i) => (
        <span key={i}>{char}</span>
      ))}
    </div>
  );
};
