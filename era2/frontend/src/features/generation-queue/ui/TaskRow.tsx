import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { FileText, Image as ImageIcon, Film, Music } from "lucide-react";
import type { GenerationTask } from "@/entities/generation-task";
import { formatEta, formatCredits, getEtaForType } from "../lib/formatEta";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskProgressBar } from "./TaskProgressBar";
import { TaskActions } from "./TaskActions";

interface TaskRowProps extends React.HTMLAttributes<HTMLDivElement> {
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
  image: <ImageIcon className="size-5" />,
  video: <Film className="size-5" />,
  audio: <Music className="size-5" />,
};

export const TaskRow = React.memo(function TaskRow({ task, onCancel, onRetry, onRemove, onDownload, className, ...props }: TaskRowProps) {
  const isRunning = task.status === "running";
  const showFullProgress = isRunning;
  const etaMs = task.etaMs ?? (isRunning ? getEtaForType(task.type, task.progress) : undefined);

  return (
    <div
      className={cn(
        "group flex flex-col gap-2.5 px-3.5 py-3 rounded-2xl border transition-[border-color,background-color] duration-200",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:border-[#E85420]/30",
        isRunning && "border-[#E85420]/30 bg-[#E85420]/[0.04]",
        className
      )}
      {...props}
    >
      {/* Top: icon + title/meta + status + actions */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full border shrink-0",
          "border-[hsl(var(--border))]",
          TYPE_ICON_STYLES[task.type]
        )}>
          {TYPE_ICONS[task.type]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[hsl(var(--foreground))] truncate">
            {task.prompt}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
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
            {task.status === "queued" && task.position != null && (
              <span className="font-mono shrink-0">
                · позиция {task.position}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isRunning && (
            <span className="font-mono text-[12px] font-semibold text-[#E85420] tabular-nums">
              {Math.round(task.progress)}%
            </span>
          )}
          <TaskStatusBadge status={task.status} />
          <TaskActions
            task={task}
            onCancel={onCancel}
            onRetry={onRetry}
            onRemove={onRemove}
            onDownload={onDownload}
          />
        </div>
      </div>

      {showFullProgress && (
        <TaskProgressBar progress={task.progress} status={task.status} />
      )}

      {task.status === "failed" && task.errorMessage && (
        <p className="text-[12px] text-[#dc2626] px-1">{task.errorMessage}</p>
      )}
    </div>
  );
});
