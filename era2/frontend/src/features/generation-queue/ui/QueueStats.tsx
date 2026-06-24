import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Clock, PlayCircle, CheckCircle2, AlertCircle } from "lucide-react";
import type { QueueCounters } from "../model/selectors";

interface QueueStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  counters: QueueCounters;
}

export const QueueStats = React.memo(function QueueStats({ counters, className, ...props }: QueueStatsProps) {
  const stats = [
    {
      label: "В очереди",
      value: counters.queued,
      icon: <Clock className="size-5" />,
      iconBg: "bg-[hsl(var(--secondary))]",
      iconColor: "text-[hsl(var(--muted-foreground))]",
    },
    {
      label: "Идёт",
      value: counters.running,
      icon: <PlayCircle className="size-5" />,
      iconBg: "bg-[#E85420]/15",
      iconColor: "text-[#E85420]",
    },
    {
      label: "Готово",
      value: counters.done,
      icon: <CheckCircle2 className="size-5" />,
      iconBg: "bg-[#16a34a]/15",
      iconColor: "text-[#16a34a]",
    },
    {
      label: "Ошибка",
      value: counters.failed,
      icon: <AlertCircle className="size-5" />,
      iconBg: "bg-[#dc2626]/15",
      iconColor: "text-[#dc2626]",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-4 gap-3",
        className
      )}
      {...props}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg border",
            "bg-[hsl(var(--card))] border-[hsl(var(--border))]"
          )}
        >
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-full shrink-0", stat.iconBg, stat.iconColor)}>
            {stat.icon}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] text-[hsl(var(--muted-foreground))] truncate">
              {stat.label}
            </span>
            <span className="font-mono text-[24px] font-bold text-[hsl(var(--foreground))] leading-tight tabular-nums">
              {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});
