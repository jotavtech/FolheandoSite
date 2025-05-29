import { cn } from "@/lib/utils";
import { BookOpen, Loader2, Heart, Star, Sparkles } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "books" | "pulse" | "dots" | "bounce";
  message?: string;
  subMessage?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  variant = "default",
  message,
  subMessage,
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const messageSize = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl"
  };

  const renderSpinner = () => {
    switch (variant) {
      case "books":
        return (
          <div className="relative">
            <div className={cn("animate-spin text-[#3A4257]", sizeClasses[size])}>
              <BookOpen className="w-full h-full" />
            </div>
            <div className="absolute inset-0 animate-ping opacity-20">
              <BookOpen className={cn("text-[#3A4257]", sizeClasses[size])} />
            </div>
            <div className="absolute -top-2 -right-2 animate-bounce delay-300">
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
        );

      case "pulse":
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-[#3A4257] rounded-full animate-pulse",
                  size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-6 h-6"
                )}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        );

      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-[#3A4257] rounded-full animate-bounce",
                  size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-6 h-6"
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case "bounce":
        return (
          <div className="relative">
            <div className={cn("animate-bounce text-[#3A4257]", sizeClasses[size])}>
              <Heart className="w-full h-full fill-current" />
            </div>
            <div className="absolute inset-0 animate-ping opacity-30 delay-200">
              <Heart className={cn("text-[#3A4257] fill-current", sizeClasses[size])} />
            </div>
          </div>
        );

      default:
        return (
          <div className="relative">
            <div className={cn("animate-spin rounded-full border-b-4 border-[#3A4257]", sizeClasses[size])} />
            <div className={cn("animate-ping absolute inset-0 rounded-full border-4 border-[#3A4257] opacity-20", sizeClasses[size])} />
          </div>
        );
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {renderSpinner()}
      
      {message && (
        <div className="text-center space-y-2">
          <p className={cn("text-gray-600 font-medium animate-pulse", messageSize[size])}>
            {message}
          </p>
          {subMessage && (
            <p className="text-gray-500 text-sm animate-pulse delay-500">
              {subMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 