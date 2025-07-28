import { useState, useEffect } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { cn, isValidAvatarUrl } from "@/renderer/lib/utils";

// Custom hook to handle avatar image loading with proper dimensions
function useAvatarImage(src: string | null | undefined) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const validSrc = isValidAvatarUrl(src);

  useEffect(() => {
    if (!validSrc) {
      setImageLoaded(false);
      setImageFailed(true);
      return;
    }

    setImageLoaded(false);
    setImageFailed(false);

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageFailed(false);
    };
    img.onerror = () => {
      setImageLoaded(false);
      setImageFailed(true);
    };
    img.src = validSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [validSrc]);

  return {
    src: validSrc,
    shouldShowImage: imageLoaded && !imageFailed,
    isLoading: !imageLoaded && !imageFailed && !!validSrc,
  };
}

interface OptimizedAvatarProps {
  src?: string | null;
  fallbackContent: React.ReactNode;
  className?: string;
  fallbackClassName?: string;
  size: "sm" | "md" | "lg";
  showHover?: boolean;
}

export function OptimizedAvatar(props: OptimizedAvatarProps) {
  const {
    src,
    fallbackContent,
    className,
    fallbackClassName,
    size,
    showHover = true,
  } = props;

  const { shouldShowImage } = useAvatarImage(src);

  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-9 text-sm",
    lg: "size-11 text-base",
  };

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        showHover &&
          "transition-all duration-200 hover:scale-[1.01] hover:shadow-md",
        className,
      )}
    >
      {shouldShowImage && src ? (
        <AvatarImage src={src} className="object-cover" />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground font-semibold ring-2 ring-primary/20",
          // Ensure consistent sizing during loading
          "flex items-center justify-center",
          showHover && "transition-all duration-200 hover:ring-primary/40",
          fallbackClassName,
        )}
      >
        {fallbackContent}
      </AvatarFallback>
    </Avatar>
  );
}

// Helper function to get user initials
export function getUserInitials(name: string): string {
  const names = name.trim().split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

// Helper function to get agent initials (can be different logic if needed)
export function getAgentInitials(name: string): string {
  return getUserInitials(name);
}
