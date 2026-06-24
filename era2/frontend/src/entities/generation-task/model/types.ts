export type GenType = "text" | "image" | "video" | "audio";

export type TaskStatus = "queued" | "running" | "done" | "failed" | "canceled";

export interface GenerationTask {
  id: string;
  type: GenType;
  modelName: string;
  prompt: string;
  status: TaskStatus;
  progress: number;
  position?: number;
  etaMs?: number;
  durationMs?: number;
  credits: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  errorMessage?: string;
  outputUrl?: string;
  willFail?: boolean;
  failAt?: number;
}

export const ACTIVE_STATUSES: TaskStatus[] = ["queued", "running"];

export const FAILURE_REASONS = [
  "Недостаточно кредитов",
  "Превышено время ожидания",
  "Модель временно недоступна",
] as const;

export type FailureReason = (typeof FAILURE_REASONS)[number];

export interface TaskTypeMeta {
  type: GenType;
  label: string;
  ticketCostPerSec: number;
  baselineDurationMs: number;
}
