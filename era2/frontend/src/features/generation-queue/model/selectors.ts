import { ACTIVE_STATUSES, type GenerationTask, type TaskStatus } from "@/entities/generation-task";
import type { QueueState } from "./queueReducer";

export type SortMode = "newest" | "oldest" | "status" | "progress";

export interface QueueFilters {
  status: TaskStatus | "all";
  type: GenerationTask["type"] | "all";
  query: string;
  sort: SortMode;
}

export const DEFAULT_FILTERS: QueueFilters = {
  status: "all",
  type: "all",
  query: "",
  sort: "newest",
};

export interface QueueCounters {
  queued: number;
  running: number;
  done: number;
  failed: number;
}

export function countByStatus(tasks: GenerationTask[]): QueueCounters {
  const counters: QueueCounters = { queued: 0, running: 0, done: 0, failed: 0 };
  for (const task of tasks) {
    if (task.status === "queued" || task.status === "running" || task.status === "done" || task.status === "failed") {
      counters[task.status] += 1;
    }
  }
  return counters;
}

export function activeCount(tasks: GenerationTask[]): number {
  return tasks.reduce((sum, task) => (ACTIVE_STATUSES.includes(task.status) ? sum + 1 : sum), 0);
}

export function averageProgress(tasks: GenerationTask[]): number {
  const running = tasks.filter((task) => task.status === "running");
  if (running.length === 0) return 0;
  const total = running.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(total / running.length);
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function selectFilteredTasks(state: QueueState, filters: QueueFilters): GenerationTask[] {
  return selectFilteredTasksImpl(state.tasks, filters);
}

export function selectFilteredTasksKeyed(
  tasks: GenerationTask[],
  filters: QueueFilters,
  tasksVersion: number,
): GenerationTask[] {
  return selectFilteredTasksImpl(tasks, filters);
}

function selectFilteredTasksImpl(tasks: GenerationTask[], filters: QueueFilters): GenerationTask[] {
  const normalized = normalizeQuery(filters.query);

  const filtered = tasks.filter((task) => {
    if (filters.status !== "all" && task.status !== filters.status) return false;
    if (filters.type !== "all" && task.type !== filters.type) return false;
    if (normalized && !task.prompt.toLowerCase().includes(normalized) && !task.modelName.toLowerCase().includes(normalized))
      return false;
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "oldest":
      sorted.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case "status":
      sorted.sort((a, b) => {
        const statusWeight: Record<TaskStatus, number> = {
          running: 0,
          queued: 1,
          failed: 2,
          canceled: 3,
          done: 4,
        };
        return statusWeight[a.status] - statusWeight[b.status];
      });
      break;
    case "progress":
      sorted.sort((a, b) => b.progress - a.progress);
      break;
    case "newest":
    default:
      sorted.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }
  return sorted;
}

export function selectCounters(state: QueueState): QueueCounters {
  return countByStatus(state.tasks);
}

export function selectActiveTasks(state: QueueState): GenerationTask[] {
  return state.tasks.filter((task) => ACTIVE_STATUSES.includes(task.status));
}

export function selectTopActiveTasks(state: QueueState, limit = 3): GenerationTask[] {
  return selectActiveTasks(state)
    .sort((a, b) => {
      if (a.status === "running" && b.status !== "running") return -1;
      if (a.status !== "running" && b.status === "running") return 1;
      return a.createdAt - b.createdAt;
    })
    .slice(0, limit);
}

export function selectHasResults(state: QueueState, filters: QueueFilters): boolean {
  return selectFilteredTasks(state, filters).length > 0;
}
