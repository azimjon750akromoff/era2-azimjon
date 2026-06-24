import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { usePrefersReducedMotion } from "@/shared/lib/use-prefers-reduced-motion";

interface TaskProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number;
  status: "running" | "done" | "failed" | "queued" | "canceled";
}

export const TaskProgressBar = React.memo(function TaskProgressBar({ progress, status, className, ...props }: TaskProgressBarProps) {
  const isActive = status === "running";
  const barColor = isActive ? "bg-[#E85420]" : status === "done" ? "bg-[#16a34a]" : "bg-[hsl(var(--muted))]";
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="h-1 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-[#E85420] to-[#F26A36]",
            isActive && !reducedMotion && "animate-pulse",
            !reducedMotion && "transition-[width] duration-500",
            !isActive && barColor,
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
});
