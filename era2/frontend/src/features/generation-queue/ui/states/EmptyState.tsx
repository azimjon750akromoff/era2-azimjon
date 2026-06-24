import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Inbox, SearchX, AlertTriangle, RotateCcw } from "lucide-react";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  reason: "empty" | "no-results" | "error";
  onRetry?: () => void;
}

export function EmptyState({ reason, onRetry, className, ...props }: EmptyStateProps) {
  const config = {
    empty: {
      icon: <Inbox className="size-12" />,
      title: "Нет задач",
      description: "Очередь пуста. Отправьте задачу на генерацию из чата или рабочего пространства.",
    },
    "no-results": {
      icon: <SearchX className="size-12" />,
      title: "Ничего не найдено",
      description: "По вашему запросу задач не найдено. Попробуйте изменить фильтры или поисковый запрос.",
    },
    error: {
      icon: <AlertTriangle className="size-12" />,
      title: "Ошибка загрузки",
      description: "Не удалось загрузить очередь. Проверьте подключение к сети и попробуйте снова.",
    },
  }[reason];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[hsl(var(--secondary))]">
        {config.icon}
      </div>
      <div className="text-center">
        <h3 className="text-[16px] font-semibold text-[hsl(var(--foreground))]">{config.title}</h3>
        <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1 max-w-[280px]">
          {config.description}
        </p>
      </div>
      {reason === "error" && onRetry && (
        <button type="button"
          onClick={onRetry}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl",
            "bg-[#E85420] text-white font-medium text-[13px]",
            "hover:bg-[#E85420]/90 transition-colors duration-200"
          )}
        >
          <RotateCcw className="size-4" />
          Повторить
        </button>
      )}
    </div>
  );
}

export function LoadingState({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 rounded-xl bg-[hsl(var(--secondary))] animate-pulse" />
        <div className="h-4 w-48 rounded-lg bg-[hsl(var(--secondary))] animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--secondary))] animate-pulse" />
            <div className="flex flex-col gap-1.5">
              <div className="h-6 w-12 rounded-lg bg-[hsl(var(--secondary))] animate-pulse" />
              <div className="h-3 w-16 rounded-md bg-[hsl(var(--secondary))] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-20 rounded-full bg-[hsl(var(--secondary))] animate-pulse" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] animate-pulse" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-24 rounded-lg bg-[hsl(var(--secondary))] animate-pulse" />
              <div className="h-3 w-64 rounded-md bg-[hsl(var(--secondary))] animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-12 rounded-md bg-[hsl(var(--secondary))] animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-[hsl(var(--secondary))] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ onRetry, className, ...props }: { onRetry?: () => void } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <EmptyState reason="error" onRetry={onRetry} className={className} {...props} />
  );
}
