import * as React from "react";
import { buildSeedTasks, type GenerationTask } from "@/entities/generation-task";
import { createQueueEngine, persistTasks, restoreOrSeedTasks } from "./queueEngine";
import { initialQueueState, queueReducer } from "./queueReducer";

export interface QueueStateValue {
  tasks: GenerationTask[];
  loaded: boolean;
  error: boolean;
  tasksVersion: number;
}

export interface QueueActionsValue {
  cancel: (id: string) => void;
  retry: (id: string) => void;
  remove: (id: string) => void;
  download: (id: string) => void;
  clearDone: () => void;
  resetError: () => void;
  retryBootstrap: () => void;
}

const QueueStateContext = React.createContext<QueueStateValue | null>(null);
const QueueActionsContext = React.createContext<QueueActionsValue | null>(null);

export interface QueueProviderProps {
  children: React.ReactNode;
  initialDelayMs?: number;
  seed?: () => GenerationTask[];
}

export function QueueProvider({ children, initialDelayMs = 600, seed = buildSeedTasks }: QueueProviderProps) {
  const [state, dispatch] = React.useReducer(queueReducer, initialQueueState);
  const seedRef = React.useRef(seed);
  seedRef.current = seed;
  const tasksRef = React.useRef(state.tasks);
  tasksRef.current = state.tasks;

  React.useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(() => {
      if (cancelled) return;
      const tasks = restoreOrSeedTasks(seedRef.current);
      dispatch({ type: "HYDRATE", payload: tasks });
      dispatch({ type: "ERROR", payload: false });
    }, initialDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [initialDelayMs]);

  React.useEffect(() => {
    if (!state.loaded || state.error) return;
    const engine = createQueueEngine();
    engine.start(() => tasksRef.current, dispatch);
    return () => engine.stop();
  }, [state.loaded, state.error]);

  const lastPersistRef = React.useRef(0);
  const persistTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!state.loaded || state.tasks.length === 0) return;
    const now = Date.now();
    const elapsed = now - lastPersistRef.current;
    if (elapsed >= 5000) {
      lastPersistRef.current = now;
      persistTasks(state.tasks);
      return;
    }
    if (persistTimeoutRef.current !== null) return;
    persistTimeoutRef.current = setTimeout(() => {
      persistTimeoutRef.current = null;
      lastPersistRef.current = Date.now();
      persistTasks(state.tasks);
    }, 5000 - elapsed);
  }, [state.loaded, state.tasks]);

  React.useEffect(() => {
    return () => {
      if (persistTimeoutRef.current !== null) {
        clearTimeout(persistTimeoutRef.current);
        persistTasks(tasksRef.current);
      }
    };
  }, []);

  const stateValue = React.useMemo<QueueStateValue>(
    () => ({
      tasks: state.tasks,
      loaded: state.loaded,
      error: state.error,
      tasksVersion: state.tasksVersion,
    }),
    [state.tasks, state.loaded, state.error, state.tasksVersion],
  );

  const actionsValue = React.useMemo<QueueActionsValue>(
    () => ({
      cancel(id: string) {
        dispatch({ type: "CANCEL", payload: { id, completedAt: Date.now() } });
      },
      retry(id: string) {
        const commitAt = Date.now();
        const created = commitAt + Math.floor(Math.random() * 1000);
        const tasks = tasksRef.current;
        const nextPosition = tasks.filter((t) => t.status === "queued").length + 1;
        dispatch({ type: "RETASK", payload: { id, createdAt: created, position: nextPosition } });
      },
      remove(id: string) {
        dispatch({ type: "REMOVE", payload: { id } });
      },
      download(_id: string) {
        // Stub: in a real app, this would fetch/outputUrl
      },
      clearDone() {
        dispatch({ type: "CLEAR_DONE" });
      },
      resetError() {
        dispatch({ type: "ERROR", payload: false });
      },
      retryBootstrap() {
        const tasks = buildSeedTasks();
        dispatch({ type: "HYDRATE", payload: tasks });
      },
    }),
    [],
  );

  return (
    <QueueStateContext.Provider value={stateValue}>
      <QueueActionsContext.Provider value={actionsValue}>{children}</QueueActionsContext.Provider>
    </QueueStateContext.Provider>
  );
}

export function useQueueState(): QueueStateValue {
  const ctx = React.useContext(QueueStateContext);
  if (!ctx) {
    throw new Error("useQueueState must be used within QueueProvider");
  }
  return ctx;
}

export function useQueueActions(): QueueActionsValue {
  const ctx = React.useContext(QueueActionsContext);
  if (!ctx) {
    throw new Error("useQueueActions must be used within QueueProvider");
  }
  return ctx;
}

export function useQueueContext(): QueueStateValue & QueueActionsValue {
  const state = useQueueState();
  const actions = useQueueActions();
  return { ...state, ...actions };
}
