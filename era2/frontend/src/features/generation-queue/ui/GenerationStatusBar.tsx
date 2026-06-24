import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Activity, ChevronRight } from "lucide-react";
import type { GenerationTask } from "@/entities/generation-task";
import type { GenType } from "@/entities/generation-task";
import { activeCount, averageProgress } from "../model/selectors";
import { useQueueState } from "../model/QueueProvider";

const TYPE_LABEL_BY_GEN: Record<GenType, string> = {
  text: "Генерация текста",
  image: "Генерация изображения",
  video: "Генерация видео",
  audio: "Генерация аудио",
};

interface GenerationStatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onNavigateToQueue?: () => void;
}

export function GenerationStatusBar({ onNavigateToQueue, className, ...props }: GenerationStatusBarProps) {
  const { tasks, loaded } = useQueueState();

  const activeTasks = React.useMemo(() => tasks.filter((t) => t.status === "queued" || t.status === "running"), [tasks]);
  const active = React.useMemo(() => activeCount(tasks), [tasks]);
  const avgProgress = React.useMemo(() => averageProgress(tasks), [tasks]);

  if (!loaded || active === 0) return null;

  const single = activeTasks.length === 1;
  const topTasks = activeTasks.slice(0, 3);

  return (
    <div
      className={cn(
        "fixed z-50 transition-[opacity,transform] duration-300",
        "md:bottom-6 md:right-6 md:left-auto md:w-[340px]",
        "bottom-0 left-0 right-0 md:bottom-6",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
      {...props}
    >
      {single ? (
        <CompactBar task={topTasks[0]} onNavigate={onNavigateToQueue} />
      ) : (
        <ExpandedBar tasks={topTasks} active={active} avgProgress={avgProgress} onNavigate={onNavigateToQueue} />
      )}
    </div>
  );
}

interface CompactBarProps {
  task: GenerationTask;
  onNavigate?: () => void;
}

function CompactBar({ task, onNavigate }: CompactBarProps) {
  const isRunning = task.status === "running";
  const typeLabel = TYPE_LABEL_BY_GEN[task.type];
  return (
    <button type="button"
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-left",
        "md:rounded-2xl rounded-t-2xl",
        "border border-[hsl(var(--border))]",
        "bg-[hsl(var(--card))]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.32)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]",
        "transition-shadow duration-200",
        "w-full"
      )}
    >
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#E85420]/15 shrink-0">
        <Activity className="size-4 text-[#E85420] animate-pulse" />
        {isRunning && (
          <div className="absolute inset-0 rounded-xl border border-[#E85420]/30 animate-ping" />
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-[hsl(var(--foreground))] truncate">
            {typeLabel}
          </p>
          <ChevronRight className="size-3.5 text-[hsl(var(--muted-foreground))] shrink-0" />
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
          <span className="font-mono truncate">{task.modelName}</span>
          {isRunning && (
            <span className="font-mono font-semibold text-[#E85420] tabular-nums shrink-0">
              · {Math.round(task.progress)}%
            </span>
          )}
        </div>
        {isRunning && (
          <div className="h-1 mt-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E85420] to-[#F26A36] rounded-full transition-[width] duration-500"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}
      </div>
    </button>
  );
}

interface ExpandedBarProps {
  tasks: GenerationTask[];
  active: number;
  avgProgress: number;
  onNavigate?: () => void;
}

function ExpandedBar({ tasks, active, avgProgress, onNavigate }: ExpandedBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3.5",
        "md:rounded-2xl rounded-t-2xl",
        "border border-[hsl(var(--border))]",
        "bg-[hsl(var(--card))]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.32)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-[#E85420] animate-pulse" />
          <span className="text-[12px] font-semibold text-[hsl(var(--foreground))]">
            Генерации идут
          </span>
        </div>
        <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
          {active} активны · {Math.round(avgProgress)}%
        </span>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2.5">
            <span className="font-mono text-[11px] text-[hsl(var(--foreground))] truncate w-[100px] shrink-0">
              {task.modelName}
            </span>
            <div className="flex-1 h-1 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E85420] to-[#F26A36] rounded-full transition-[width] duration-500"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))] w-8 text-right shrink-0">
              {Math.round(task.progress)}%
            </span>
          </div>
        ))}
      </div>

      {/* Navigate button */}
      <button type="button"
        onClick={onNavigate}
        className={cn(
          "flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl",
          "bg-[#E85420]/15 text-[#E85420] font-medium text-[12px]",
          "hover:bg-[#E85420]/25 transition-colors duration-200"
        )}
      >
        Открыть очередь
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}
