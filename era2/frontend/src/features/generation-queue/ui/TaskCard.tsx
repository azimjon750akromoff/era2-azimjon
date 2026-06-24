import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { FileText, Image, Film, Music } from "lucide-react";
import type { GenerationTask } from "@/entities/generation-task";
import { formatEta, formatCredits, formatPrompt, getEtaForType } from "../lib/formatEta";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskProgressBar } from "./TaskProgressBar";
import { TaskActions } from "./TaskActions";

interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  task: GenerationTask;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const TYPE_ICON_STYLES: Record<GenerationTask["type"], string> = {
  text: "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]",
  image: "bg-[#E85420]/15 text-[#E85420]",
  video: "bg-[#E85420]/15 text-[#E85420]",
  audio: "bg-[#E85420]/15 text-[#E85420]",
};

const TYPE_ICONS: Record<GenerationTask["type"], React.ReactNode> = {
  text: <FileText className="size-5" />,
  image: <Image className="size-5" />,
  video: <Film className="size-5" />,
  audio: <Music className="size-5" />,
};

export const TaskCard = React.memo(function TaskCard({ task, onCancel, onRetry, onRemove, onDownload, className, ...props }: TaskCardProps) {
  const isRunning = task.status === "running";
  const etaMs = task.etaMs ?? (isRunning ? getEtaForType(task.type, task.progress) : undefined);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3.5 rounded-2xl border transition-[border-color,background-color] duration-200",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        isRunning && "border-[#E85420]/30 bg-[#E85420]/[0.04]",
        className
      )}
      {...props}
    >
      {/* Header: icon + title (full width) */}
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full border shrink-0",
          "border-[hsl(var(--border))]",
          TYPE_ICON_STYLES[task.type]
        )}>
          {TYPE_ICONS[task.type]}
        </div>
        <p className="flex-1 min-w-0 text-[14px] font-semibold text-[hsl(var(--foreground))] leading-snug">
          {formatPrompt(task.prompt, 100)}
        </p>
      </div>

      {/* Meta line */}
      <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))] flex-wrap">
        <span className="font-mono font-medium text-[hsl(var(--foreground))]">
          · {task.modelName}
        </span>
        {etaMs != null && (
          <span className="font-mono shrink-0">
            · ~{formatEta(etaMs)}
          </span>
        )}
        <span className="font-mono shrink-0">
          · {formatCredits(task.credits)} cr
        </span>
      </div>

      {/* Progress bar for running */}
      {isRunning && (
        <TaskProgressBar progress={task.progress} status={task.status} />
      )}

      {/* Error message for failed */}
      {task.status === "failed" && task.errorMessage && (
        <p className="text-[12px] text-[#dc2626]">{task.errorMessage}</p>
      )}

      {/* Footer: status badge + actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <TaskStatusBadge status={task.status} />
          {isRunning && (
            <span className="font-mono text-[12px] font-semibold text-[#E85420] tabular-nums">
              {Math.round(task.progress)}%
            </span>
          )}
        </div>
        <TaskActions
          task={task}
          onCancel={onCancel}
          onRetry={onRetry}
          onRemove={onRemove}
          onDownload={onDownload}
        />
      </div>
    </div>
  );
});
