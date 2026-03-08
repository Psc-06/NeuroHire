import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export default function Container({ children, className, size = "lg" }: ContainerProps) {
  return (
    <div className={cn("mx-auto px-4 sm:px-6 py-8 sm:py-10", sizeClasses[size], className)}>
      {children}
    </div>
  );
}
