import { FAILURE_REASONS, TASK_TYPE_META } from "@/entities/generation-task";
import type { GenerationTask } from "@/entities/generation-task";
import type { QueueAction } from "./queueReducer";
import { isTerminal } from "./queueReducer";

export const MAX_CONCURRENT = 2;
export const POLL_INTERVAL_MS = 500;
export const FAIL_PROBABILITY = 0.15;
export const PERSISTENCE_KEY = "era2.generation-queue.v1";

export interface EngineTick {
  tickId: number;
  progress: number;
}

export type EngineDispatch = (action: QueueAction) => void;

export interface EngineOptions {
  intervalMs?: number;
  failProbability?: number;
}

export interface RollOutcome {
  willFail: boolean;
  reason: string | undefined;
}

function rollOutcome(failProbability: number): RollOutcome {
  if (Math.random() < failProbability) {
    const reason = FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
    return { willFail: true, reason };
  }
  return { willFail: false, reason: undefined };
}

function nextTickProgress(task: GenerationTask, intervalMs: number): number {
  const meta = TASK_TYPE_META[task.type];
  const totalSteps = Math.max(8, Math.round(meta.baselineDurationMs / Math.max(intervalMs, 250)));
  const step = 100 / totalSteps;
  const jitter = step * (0.6 + Math.random() * 0.8);
  return Math.min(99, task.progress + jitter);
}

function recomputeQueuedPositions(tasks: GenerationTask[]): { id: string; position: number }[] {
  const queued = tasks
    .filter((task) => task.status === "queued")
    .sort((a, b) => a.createdAt - b.createdAt);

  return queued.map((task, index) => ({ id: task.id, position: index + 1 }));
}

function pickNextToStart(tasks: GenerationTask[]): GenerationTask | null {
  const running = tasks.filter((task) => task.status === "running").length;
  if (running >= MAX_CONCURRENT) return null;

  const queued = tasks
    .filter((task) => task.status === "queued")
    .sort((a, b) => a.createdAt - b.createdAt);

  return queued[0] ?? null;
}

function emitPositionUpdates(dispatch: EngineDispatch, tasks: GenerationTask[]): void {
  const updates = recomputeQueuedPositions(tasks);
  if (updates.length > 0) {
    dispatch({ type: "QUEUE_POSITION_BATCH", payload: updates });
  }
}

export function runQueueTick(
  currentTasks: GenerationTask[],
  dispatch: EngineDispatch,
  options: EngineOptions = {},
): GenerationTask[] {
  const intervalMs = options.intervalMs ?? POLL_INTERVAL_MS;
  const failProbability = options.failProbability ?? FAIL_PROBABILITY;

  const now = Date.now();

  const progressMap = new Map<string, number>();
  for (const task of currentTasks) {
    if (task.status === "running") {
      progressMap.set(task.id, nextTickProgress(task, intervalMs));
    }
  }

  for (const [id, progress] of progressMap) {
    dispatch({ type: "TICK_PROGRESS", payload: { id, progress } });
  }

  let tasks = currentTasks.map((task) => {
    const nextProgress = progressMap.get(task.id);
    return nextProgress != null ? { ...task, progress: nextProgress } : task;
  });

  for (const task of tasks) {
    if (task.status !== "running") continue;

    if (task.willFail && task.errorMessage && task.failAt != null && (progressMap.get(task.id) ?? task.progress) >= task.failAt) {
      dispatch({ type: "FAIL", payload: { id: task.id, errorMessage: task.errorMessage, completedAt: now } });
      tasks = tasks.map((t) =>
        t.id === task.id ? { ...t, status: "failed", errorMessage: task.errorMessage } : t,
      );
      continue;
    }

    if ((progressMap.get(task.id) ?? task.progress) >= 95) {
      dispatch({ type: "COMPLETE", payload: { id: task.id, completedAt: now, outputUrl: "#" } });
      tasks = tasks.map((t) => (t.id === task.id ? { ...t, status: "done", progress: 100 } : t));
    }
  }

  while (true) {
    const next = pickNextToStart(tasks);
    if (!next) break;

    const outcome = rollOutcome(failProbability);
    const failAt: number | undefined = outcome.willFail
      ? Math.round(15 + Math.random() * 60)
      : undefined;

    dispatch({
      type: "START",
      payload: { id: next.id, startedAt: now, willFail: outcome.willFail, errorMessage: outcome.reason, failAt },
    });
    tasks = tasks.map((t) =>
      t.id === next.id
        ? {
            ...t,
            status: "running",
            startedAt: now,
            willFail: outcome.willFail,
            errorMessage: outcome.reason,
            failAt,
          }
        : t,
    );
  }

  emitPositionUpdates(dispatch, tasks);
  return tasks;
}

export function createQueueEngine(options: EngineOptions = {}): {
  start: (getTasks: () => GenerationTask[], dispatch: EngineDispatch) => void;
  stop: () => void;
} {
  const intervalMs = options.intervalMs ?? POLL_INTERVAL_MS;
  let handle: ReturnType<typeof setInterval> | null = null;

  return {
    start(getTasks, dispatch) {
      if (handle !== null) return;
      handle = setInterval(() => {
        runQueueTick(getTasks(), dispatch, options);
      }, intervalMs);
    },
    stop() {
      if (handle !== null) {
        clearInterval(handle);
        handle = null;
      }
    },
  };
}

export function restoreOrSeedTasks(seed: () => GenerationTask[]): GenerationTask[] {
  if (typeof window === "undefined") return seed();

  try {
    const raw = window.localStorage.getItem(PERSISTENCE_KEY);
    if (!raw) return seed();

    const parsed = JSON.parse(raw) as GenerationTask[];
    if (!Array.isArray(parsed)) return seed();

    return parsed.map((task) => reviveTask(task));
  } catch {
    return seed();
  }
}

export function persistTasks(tasks: GenerationTask[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(tasks));
  } catch {
    // storage may be unavailable; silently skip
  }
}

function reviveTask(task: GenerationTask): GenerationTask {
  if (task.status === "running") {
    return {
      ...task,
      status: "queued",
      progress: 0,
      startedAt: undefined,
      willFail: undefined,
      failAt: undefined,
    };
  }
  if (isTerminal(task.status)) {
    return task;
  }
  return { ...task, willFail: undefined, failAt: undefined };
}
