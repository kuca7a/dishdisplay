"use client";

import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredRating(null);
    }
  };

  const displayRating = hoveredRating ?? rating;

  return (
    <div 
      className={cn("flex items-center gap-0.5", className)}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= displayRating;
        const isPartiallyFilled = starRating === Math.ceil(displayRating) && displayRating % 1 !== 0;
        
        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              "transition-colors",
              {
                "fill-yellow-400 text-yellow-400": isFilled,
                "text-gray-300": !isFilled && !isPartiallyFilled,
                "cursor-pointer hover:scale-110": interactive,
              }
            )}
            style={
              isPartiallyFilled
                ? {
                    background: `linear-gradient(to right, #fbbf24 ${(displayRating % 1) * 100}%, #d1d5db ${(displayRating % 1) * 100}%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }
                : {}
            }
            onClick={() => handleStarClick(starRating)}
            onMouseEnter={() => handleStarHover(starRating)}
          />
        );
      })}
      <span className="ml-1 text-sm text-gray-600">
        {rating > 0 ? rating.toFixed(1) : "No ratings"}
      </span>
    </div>
  );
}
