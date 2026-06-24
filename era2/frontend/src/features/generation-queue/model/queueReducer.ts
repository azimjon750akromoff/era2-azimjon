import type { GenerationTask, TaskStatus } from "@/entities/generation-task";

export interface QueueState {
  tasks: GenerationTask[];
  loaded: boolean;
  error: boolean;
  tasksVersion: number;
}

export const initialQueueState: QueueState = {
  tasks: [],
  loaded: false,
  error: false,
  tasksVersion: 0,
};

export type QueueAction =
  | { type: "HYDRATE"; payload: GenerationTask[] }
  | { type: "TICK_PROGRESS"; payload: { id: string; progress: number } }
  | {
      type: "START";
      payload: {
        id: string;
        startedAt: number;
        willFail: boolean;
        errorMessage?: string;
        failAt?: number;
      };
    }
  | { type: "QUEUE_POSITION"; payload: { id: string; position: number } }
  | { type: "QUEUE_POSITION_BATCH"; payload: { id: string; position: number }[] }
  | { type: "COMPLETE"; payload: { id: string; completedAt: number; outputUrl?: string } }
  | { type: "FAIL"; payload: { id: string; errorMessage: string; completedAt: number } }
  | { type: "CANCEL"; payload: { id: string; completedAt: number } }
  | { type: "REMOVE"; payload: { id: string } }
  | { type: "RETASK"; payload: { id: string; createdAt: number; position: number } }
  | { type: "CLEAR_DONE" }
  | { type: "ERROR"; payload: boolean }
  | { type: "READY" };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function update(state: QueueState, mutator: (tasks: GenerationTask[]) => GenerationTask[]): QueueState {
  return { ...state, tasks: mutator(state.tasks) };
}

function patch(task: GenerationTask, patch: Partial<GenerationTask>): GenerationTask {
  return { ...task, ...patch };
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, tasks: action.payload, loaded: true, error: false, tasksVersion: state.tasksVersion + 1 };
    case "ERROR":
      return { ...state, error: action.payload };
    case "READY":
      return { ...state, loaded: true, error: false };
    case "TICK_PROGRESS":
      return update(state, (tasks) =>
        tasks.map((task) =>
          task.id === action.payload.id && task.status === "running"
            ? patch(task, { progress: clamp(action.payload.progress, 0, 99) })
            : task,
        ),
      );
    case "START":
      return {
        ...update(state, (tasks) =>
          tasks.map((task) =>
            task.id === action.payload.id
              ? patch(task, {
                  status: "running",
                  startedAt: action.payload.startedAt,
                  willFail: action.payload.willFail,
                  errorMessage: action.payload.errorMessage,
                  failAt: action.payload.failAt,
                })
              : task,
          ),
        ),
        tasksVersion: state.tasksVersion + 1,
      };
    case "QUEUE_POSITION":
      return update(state, (tasks) =>
        tasks.map((task) => (task.id === action.payload.id ? patch(task, { position: action.payload.position }) : task)),
      );
    case "QUEUE_POSITION_BATCH": {
      const posMap = new Map(action.payload.map((p) => [p.id, p.position]));
      return update(state, (tasks) =>
        tasks.map((task) => {
          const pos = posMap.get(task.id);
          return pos != null ? patch(task, { position: pos }) : task;
        }),
      );
    }
    case "COMPLETE":
      return {
        ...update(state, (tasks) =>
          tasks.map((task) =>
            task.id === action.payload.id
              ? patch(task, {
                  status: "done",
                  progress: 100,
                  completedAt: action.payload.completedAt,
                  outputUrl: action.payload.outputUrl ?? task.outputUrl ?? "#",
                })
              : task,
          ),
        ),
        tasksVersion: state.tasksVersion + 1,
      };
    case "FAIL":
      return {
        ...update(state, (tasks) =>
          tasks.map((task) =>
            task.id === action.payload.id
              ? patch(task, {
                  status: "failed",
                  completedAt: action.payload.completedAt,
                  errorMessage: action.payload.errorMessage,
                })
              : task,
          ),
        ),
        tasksVersion: state.tasksVersion + 1,
      };
    case "CANCEL":
      return {
        ...update(state, (tasks) =>
          tasks.map((task) =>
            task.id === action.payload.id
              ? patch(task, {
                  status: "canceled",
                  completedAt: action.payload.completedAt,
                  willFail: undefined,
                  failAt: undefined,
                })
              : task,
          ),
        ),
        tasksVersion: state.tasksVersion + 1,
      };
    case "REMOVE":
      return {
        ...update(state, (tasks) => tasks.filter((task) => task.id !== action.payload.id)),
        tasksVersion: state.tasksVersion + 1,
      };
    case "RETASK":
      return {
        ...update(state, (tasks) =>
          tasks.map((task) =>
            task.id === action.payload.id
              ? patch(task, {
                  status: "queued",
                  progress: 0,
                  createdAt: action.payload.createdAt,
                  position: action.payload.position,
                  errorMessage: undefined,
                  completedAt: undefined,
                  startedAt: undefined,
                  etaMs: undefined,
                  willFail: undefined,
                  failAt: undefined,
                })
              : task,
          ),
        ),
        tasksVersion: state.tasksVersion + 1,
      };
    case "CLEAR_DONE":
      return {
        ...update(state, (tasks) => tasks.filter((task) => task.status !== "done")),
        tasksVersion: state.tasksVersion + 1,
      };
    default:
      return state;
  }
}

export function isTerminal(status: TaskStatus): boolean {
  return status === "done" || status === "failed" || status === "canceled";
}
