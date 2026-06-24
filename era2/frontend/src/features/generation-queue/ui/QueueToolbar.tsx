import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { useDebounce } from "@/shared/lib/use-debounce";
import { Search, ChevronDown } from "lucide-react";
import type { TaskStatus } from "@/entities/generation-task";
import type { QueueFilters, SortMode } from "../model/selectors";

interface QueueToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  filters: QueueFilters;
  onFilterChange: (filters: Partial<QueueFilters>) => void;
}

const STATUS_CHIPS: Array<{ value: TaskStatus | "all"; label: string }> = [
  { value: "all", label: "Все" },
  { value: "queued", label: "В очереди" },
  { value: "running", label: "Идёт" },
  { value: "done", label: "Готово" },
  { value: "failed", label: "Ошибка" },
];

const SORT_LABELS: Record<SortMode, string> = {
  newest: "Сначала новые",
  oldest: "Сначала старые",
  status: "По статусу",
  progress: "По прогрессу",
};

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "status", label: "По статусу" },
  { value: "progress", label: "По прогрессу" },
];

export function QueueToolbar({ filters, onFilterChange, className, ...props }: QueueToolbarProps) {
  const [sortOpen, setSortOpen] = React.useState(false);
  const sortRef = React.useRef<HTMLDivElement | null>(null);
  const [localQuery, setLocalQuery] = React.useState(filters.query);
  const debouncedQuery = useDebounce(localQuery, 300);

  React.useEffect(() => {
    if (debouncedQuery !== filters.query) {
      onFilterChange({ query: debouncedQuery });
    }
  }, [debouncedQuery, filters.query, onFilterChange]);

  React.useEffect(() => {
    setLocalQuery(filters.query);
  }, [filters.query]);

  React.useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortOpen]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl border flex-wrap",
        "bg-[hsl(var(--card))] border-[hsl(var(--border))]",
        className
      )}
      {...props}
    >
      {/* Status chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 min-w-0">
        {STATUS_CHIPS.map((chip) => (
          <button type="button"
            key={chip.value}
            onClick={() => onFilterChange({ status: chip.value })}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 h-7 rounded-full shrink-0",
              "text-[13px] font-medium transition-colors duration-200 border",
              filters.status === chip.value
                ? "bg-[#E85420] border-[#E85420] text-white"
                : "bg-[hsl(var(--secondary))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Inline search + sort (hidden on mobile per Figma) */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[hsl(var(--muted-foreground))] pointer-events-none" />
          <input
            type="text"
            placeholder="Поиск..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className={cn(
              "w-[160px] sm:w-[200px] pl-8 pr-3 h-7 rounded-full border text-[12px]",
              "bg-[hsl(var(--secondary))] border-[hsl(var(--border))]",
              "placeholder:text-[hsl(var(--muted-foreground))] text-[hsl(var(--foreground))]",
              "focus:outline-none focus:border-[#E85420]/50 focus:bg-[hsl(var(--background))] transition-colors duration-200"
            )}
          />
        </div>

        <div className="relative" ref={sortRef}>
          <button type="button"
            onClick={() => setSortOpen(!sortOpen)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 h-7 rounded-full",
              "text-[13px] font-medium transition-colors duration-200 border",
              "bg-[hsl(var(--secondary))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            {SORT_LABELS[filters.sort]}
            <ChevronDown className="size-3.5" />
          </button>

          {sortOpen && (
            <div className={cn(
              "absolute right-0 top-8 z-50 min-w-[160px] p-1 rounded-xl border shadow-lg",
              "bg-[hsl(var(--popover))] border-[hsl(var(--border))]",
              "animate-fade-in-up"
            )}>
              {SORT_OPTIONS.map((option) => (
                <button type="button"
                  key={option.value}
                  onClick={() => {
                    onFilterChange({ sort: option.value });
                    setSortOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] text-left",
                    filters.sort === option.value
                      ? "bg-[#E85420]/10 text-[#E85420]"
                      : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
