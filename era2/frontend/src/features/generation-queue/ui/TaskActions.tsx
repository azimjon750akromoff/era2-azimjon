import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { X, RotateCcw, Download, MoreHorizontal } from "lucide-react";
import type { GenerationTask, TaskStatus } from "@/entities/generation-task";

interface TaskActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  task: GenerationTask;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  onDownload?: (id: string) => void;
}

interface ActionDef {
  label: string;
  icon: React.ReactNode;
  onClick: "cancel" | "retry" | "remove" | "download";
  tone: "primary" | "ghost";
}

function getActions(status: TaskStatus): ActionDef[] {
  const actions: ActionDef[] = [];

  if (status === "running" || status === "queued") {
    actions.push({ label: "Отмена", icon: <X className="size-3.5" />, onClick: "cancel", tone: "primary" });
  }
  if (status === "failed" || status === "canceled") {
    actions.push({ label: "Повторить", icon: <RotateCcw className="size-3.5" />, onClick: "retry", tone: "primary" });
  }
  if (status === "done") {
    actions.push({ label: "Скачать", icon: <Download className="size-3.5" />, onClick: "download", tone: "primary" });
  }
  actions.push({ label: "Действия", icon: <MoreHorizontal className="size-3.5" />, onClick: "remove", tone: "ghost" });

  return actions;
}

export const TaskActions = React.memo(function TaskActions({ task, onCancel, onRetry, onRemove, onDownload, className, ...props }: TaskActionsProps) {
  const actions = getActions(task.status);

  const handleClick = React.useCallback(
    (action: "cancel" | "retry" | "remove" | "download") => {
      switch (action) {
        case "cancel":
          onCancel?.(task.id);
          break;
        case "retry":
          onRetry?.(task.id);
          break;
        case "download":
          onDownload?.(task.id);
          break;
        case "remove":
          onRemove?.(task.id);
          break;
      }
    },
    [task.id, onCancel, onRetry, onDownload, onRemove],
  );

  return (
    <div className={cn("flex items-center gap-1.5 shrink-0", className)} {...props}>
      {actions.map((action) => (
        <button type="button"
          key={action.onClick}
          onClick={() => handleClick(action.onClick)}
          aria-label={action.label}
          title={action.label}
          className={cn(
            "inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0",
            "text-[11px] font-medium border transition-colors duration-150",
            action.tone === "ghost"
              ? "bg-transparent text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
              : "bg-transparent text-[#E85420] border-[#E85420]/30 hover:bg-[#E85420]/12"
          )}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
});
