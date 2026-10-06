import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fallback?: string;
}

/**
 * Optimized Image Component
 * Features:
 * - Lazy loading
 * - WebP support with fallback
 * - Responsive images
 * - Loading placeholder
 * - Error handling
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  fallback = "/placeholder.svg",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(fallback);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if browser supports WebP
  const supportsWebP = () => {
    const elem = document.createElement("canvas");
    if (elem.getContext && elem.getContext("2d")) {
      return elem.toDataURL("image/webp").indexOf("data:image/webp") === 0;
    }
    return false;
  };

  // Get optimized image source
  const getOptimizedSrc = (originalSrc: string): string => {
    // If it's already a WebP or external URL, return as is
    if (originalSrc.endsWith(".webp") || originalSrc.startsWith("http")) {
      return originalSrc;
    }

    // Convert to WebP if supported
    if (supportsWebP()) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    }

    return originalSrc;
  };

  useEffect(() => {
    if (!priority && imgRef.current) {
      // Use Intersection Observer for lazy loading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const optimizedSrc = getOptimizedSrc(src);
              setCurrentSrc(optimizedSrc);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: "50px", // Start loading 50px before image is visible
        }
      );

      observer.observe(imgRef.current);

      return () => observer.disconnect();
    } else {
      // Load immediately if priority
      const optimizedSrc = getOptimizedSrc(src);
      setCurrentSrc(optimizedSrc);
    }
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
    // Fallback to original src if WebP fails
    if (currentSrc.endsWith(".webp")) {
      setCurrentSrc(src);
    } else {
      setCurrentSrc(fallback);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ width, height }}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-label="Loading image" />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          error && "opacity-50"
        )}
        {...props}
      />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-xs text-muted-foreground">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(src: string, widths: number[]): string {
  return widths
    .map((width) => {
      const optimizedSrc = src.replace(/\.(jpg|jpeg|png)$/i, `-${width}w.$1`);
      return `${optimizedSrc} ${width}w`;
    })
    .join(", ");
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): void {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
}
