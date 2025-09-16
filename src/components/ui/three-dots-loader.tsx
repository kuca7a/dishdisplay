import React from "react";

interface ThreeDotsLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

export function ThreeDotsLoader({ 
  size = "md", 
  color = "currentColor",
  className = "" 
}: ThreeDotsLoaderProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2", 
    lg: "w-3 h-3"
  };

  const containerClasses = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2"
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]} ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full`}
        style={{ 
          backgroundColor: color,
          animation: "bounce-scale 1.4s infinite ease-in-out",
          animationDelay: "0ms"
        }}
      />
      <div 
        className={`${sizeClasses[size]} rounded-full`}
        style={{ 
          backgroundColor: color,
          animation: "bounce-scale 1.4s infinite ease-in-out",
          animationDelay: "160ms"
        }}
      />
      <div 
        className={`${sizeClasses[size]} rounded-full`}
        style={{ 
          backgroundColor: color,
          animation: "bounce-scale 1.4s infinite ease-in-out",
          animationDelay: "320ms"
        }}
      />
      <style jsx>{`
        @keyframes bounce-scale {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Alternative with custom CSS animation for smoother effect
export function ThreeDotsLoaderSmooth({ 
  size = "md", 
  color = "currentColor",
  className = "" 
}: ThreeDotsLoaderProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2", 
    lg: "w-3 h-3"
  };

  const containerClasses = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2"
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]} ${className}`}>
      <style jsx>{`
        .dots-loader {
          display: flex;
          align-items: center;
          gap: ${size === 'sm' ? '4px' : size === 'md' ? '6px' : '8px'};
        }
        
        .dots-loader > div {
          border-radius: 50%;
          background-color: ${color};
          animation: dots-loading 1.4s infinite ease-in-out both;
        }
        
        .dots-loader > div:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .dots-loader > div:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes dots-loading {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <div className={`dots-loader ${className}`}>
        <div className={sizeClasses[size]} />
        <div className={sizeClasses[size]} />
        <div className={sizeClasses[size]} />
      </div>
    </div>
  );
}
