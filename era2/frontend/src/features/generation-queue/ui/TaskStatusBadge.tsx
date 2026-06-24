import * as React from "react";
import { cn } from "@/shared/lib/utils";
import type { TaskStatus } from "@/entities/generation-task";

interface TaskStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: TaskStatus;
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  queued: "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]",
  running: "bg-[#E85420]/15 text-[#E85420] border-[#E85420]/30",
  done: "bg-[#16a34a]/15 text-[#16a34a] border-[#16a34a]/30",
  failed: "bg-[#dc2626]/15 text-[#dc2626] border-[#dc2626]/30",
  canceled: "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  queued: "В очереди",
  running: "Идёт",
  done: "Готово",
  failed: "Ошибка",
  canceled: "Отменено",
};

export const TaskStatusBadge = React.memo(function TaskStatusBadge({ status, className, ...props }: TaskStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "text-[11px] font-medium border whitespace-nowrap",
        STATUS_STYLES[status],
        className
      )}
      {...props}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
});
