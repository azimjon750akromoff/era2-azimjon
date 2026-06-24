import { TASK_TYPE_META, type GenType } from "@/entities/generation-task";

export function formatEta(ms?: number): string {
  if (ms == null || ms <= 0) return "—";
  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}с`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 10) return `${minutes}:${String(seconds).padStart(2, "0")}`;
  return `${minutes} мин`;
}

export function formatCredits(amount: number): string {
  if (amount >= 100) return `${amount}`;
  return `${amount}`;
}

export function formatPrompt(text: string, max: number = 90): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function formatRelativeTime(timestamp?: number): string {
  if (timestamp == null) return "—";
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "только что";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} мин назад`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} ч назад`;
  return `${Math.floor(diff / 86_400_000)} д назад`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getEtaForType(type: GenType, progress: number): number {
  const meta = TASK_TYPE_META[type];
  if (!meta) return 0;
  const remaining = Math.max(0, 1 - Math.min(100, Math.max(0, progress)) / 100);
  return meta.baselineDurationMs * remaining;
}
