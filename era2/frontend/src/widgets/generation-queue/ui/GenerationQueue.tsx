import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Trash2 } from "lucide-react";
import {
  type QueueFilters,
  DEFAULT_FILTERS,
  useQueueState,
  useQueueActions,
  selectFilteredTasksKeyed,
  selectCounters,
  QueueStats,
  QueueToolbar,
  TaskRow,
  TaskCard,
  EmptyState,
  LoadingState,
} from "@/features/generation-queue";

interface GenerationQueueProps extends React.HTMLAttributes<HTMLDivElement> {
  onNavigateToQueue?: () => void;
}

export function GenerationQueue({ onNavigateToQueue, className, ...props }: GenerationQueueProps) {
  const { tasks, loaded, error, tasksVersion } = useQueueState();
  const { cancel, retry, remove, download, clearDone, resetError, retryBootstrap } = useQueueActions();
  const [filters, setFilters] = React.useState<QueueFilters>(DEFAULT_FILTERS);

  const filteredTasks = React.useMemo(
    () => selectFilteredTasksKeyed(tasks, filters, tasksVersion),
    [tasks, filters, tasksVersion],
  );
  const counters = React.useMemo(() => {
    const c = { queued: 0, running: 0, done: 0, failed: 0 };
    for (const task of tasks) {
      if (task.status === "queued" || task.status === "running" || task.status === "done" || task.status === "failed") {
        c[task.status] += 1;
      }
    }
    return c;
  }, [tasks]);

  const handleFilterChange = React.useCallback((patch: Partial<QueueFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  if (!loaded) return <LoadingState className={className} />;
  if (error) return <EmptyState reason="error" onRetry={retryBootstrap} className={className} />;
  if (tasks.length === 0) return <EmptyState reason="empty" className={className} />;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-tight text-[hsl(var(--foreground))] whitespace-nowrap tracking-tight">
            Очередь генераций
          </h1>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1">
            Все ваши задачи в реальном времени
          </p>
        </div>
        {counters.done > 0 && (
          <button type="button"
            onClick={clearDone}
            className={cn(
              "hidden md:inline-flex items-center gap-1.5 h-9 px-4 rounded-full border shrink-0",
              "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
              "text-[12px] font-medium text-[hsl(var(--muted-foreground))]",
              "hover:text-[hsl(var(--foreground))] hover:border-[#E85420]/30 transition-colors duration-200"
            )}
          >
            <Trash2 className="size-3.5" />
            Очистить готовые
          </button>
        )}
      </div>

      {/* Stats */}
      <QueueStats counters={counters} />

      {/* Toolbar */}
      <QueueToolbar filters={filters} onFilterChange={handleFilterChange} />

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <EmptyState reason="no-results" className="py-12" />
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTasks.map((task) => (
            <React.Fragment key={task.id}>
              {/* Desktop: row */}
              <div className="hidden md:block">
                <TaskRow
                  task={task}
                  onCancel={cancel}
                  onRetry={retry}
                  onRemove={remove}
                  onDownload={download}
                />
              </div>
              {/* Mobile: card */}
              <div className="block md:hidden">
                <TaskCard
                  task={task}
                  onCancel={cancel}
                  onRetry={retry}
                  onRemove={remove}
                  onDownload={download}
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
