import type { GenType, GenerationTask, TaskStatus, TaskTypeMeta } from "./types";

const NOW = Date.now();

export const TASK_TYPE_META: Record<GenType, TaskTypeMeta> = {
  text: { type: "text", label: "Текст", ticketCostPerSec: 1, baselineDurationMs: 25_000 },
  image: { type: "image", label: "Изображение", ticketCostPerSec: 3, baselineDurationMs: 45_000 },
  audio: { type: "audio", label: "Аудио", ticketCostPerSec: 6, baselineDurationMs: 70_000 },
  video: { type: "video", label: "Видео", ticketCostPerSec: 12, baselineDurationMs: 100_000 },
};

interface SeedSpec {
  id: string;
  type: GenType;
  modelName: string;
  prompt: string;
  status: TaskStatus;
  progress: number;
  credits: number;
  offsetMs: number;
  durationMs: number;
  errorMessage?: string;
}

const SEEDS: SeedSpec[] = [
  {
    id: "t-001",
    type: "text",
    modelName: "GPT-4o",
    prompt: "Напиши короткое стихотворение про закат над морем",
    status: "running",
    progress: 62,
    credits: 5,
    offsetMs: 0,
    durationMs: 9_000,
  },
  {
    id: "t-002",
    type: "image",
    modelName: "Midjourney v7",
    prompt: "Кинематографичный портрет: воин на закате, песчаная буря, золотой свет",
    status: "running",
    progress: 34,
    credits: 45,
    offsetMs: 30_000,
    durationMs: 18_000,
  },
  {
    id: "t-003",
    type: "video",
    modelName: "Kling 2.5 Turbo",
    prompt: "Дрон-облёт горящего костра в горах, закат, медленное движение",
    status: "queued",
    progress: 0,
    credits: 75,
    offsetMs: 0,
    durationMs: 0,
  },
  {
    id: "t-004",
    type: "text",
    modelName: "Claude Sonnet 4.5",
    prompt: "Объясни простыми словами, что такое квантовая запутанность",
    status: "queued",
    progress: 0,
    credits: 8,
    offsetMs: 0,
    durationMs: 0,
  },
  {
    id: "t-005",
    type: "image",
    modelName: "Flux 1.1 Pro",
    prompt: "Минималистичный плакат: оранжевый круг на тёмном фоне",
    status: "queued",
    progress: 0,
    credits: 25,
    offsetMs: 0,
    durationMs: 0,
  },
  {
    id: "t-006",
    type: "audio",
    modelName: "Suno v4",
    prompt: "Эмбиент-трек с тёплыми синтезаторами, медленный темп",
    status: "queued",
    progress: 0,
    credits: 60,
    offsetMs: 0,
    durationMs: 0,
  },
  {
    id: "t-007",
    type: "image",
    modelName: "Nano Banana",
    prompt: "Архитектура будущего: башня из стекла и меди в пустыне",
    status: "done",
    progress: 100,
    credits: 30,
    offsetMs: 0,
    durationMs: 0,
  },
  {
    id: "t-008",
    type: "text",
    modelName: "Gemini 2.5 Pro",
    prompt: "Слоган для кофейни в стиле минимализма",
    status: "done",
    progress: 100,
    credits: 6,
    offsetMs: 0,
    durationMs: 0,
  },
  {
    id: "t-009",
    type: "video",
    modelName: "Veo 3",
    prompt: "Капля чернил растворяется в воде, макросъёмка",
    status: "done",
    progress: 100,
    credits: 120,
    offsetMs: 0,
    durationMs: 0,
  },
  {
    id: "t-010",
    type: "audio",
    modelName: "ElevenLabs v3",
    prompt: "Голос рассказчика читает короткое вступление к подкасту",
    status: "failed",
    progress: 48,
    credits: 40,
    offsetMs: 0,
    durationMs: 0,
    errorMessage: "Превышено время ожидания",
  },
];

export function buildSeedTasks(): GenerationTask[] {
  const tasks: GenerationTask[] = SEEDS.map((spec) => {
    const createdAt = NOW - spec.offsetMs - 5 * 60_000;
    const startedAt = spec.status === "running" ? NOW - spec.durationMs + (spec.durationMs * spec.progress) / 100 : undefined;
    const completedAt = spec.status === "done" ? NOW - 60_000 : undefined;

    const stateExtras: Partial<GenerationTask> =
      spec.status === "queued"
        ? {}
        : spec.status === "running"
          ? {
              startedAt,
              etaMs: spec.durationMs * (1 - spec.progress / 100),
            }
          : spec.status === "done"
            ? { startedAt: completedAt! - spec.durationMs, completedAt, outputUrl: "#" }
            : spec.status === "failed"
              ? {
                  startedAt: NOW - 90_000,
                  completedAt: NOW - 30_000,
                  errorMessage: spec.errorMessage,
                }
              : {};

    return {
      id: spec.id,
      type: spec.type,
      modelName: spec.modelName,
      prompt: spec.prompt,
      status: spec.status,
      progress: spec.progress,
      credits: spec.credits,
      createdAt,
      ...stateExtras,
    };
  });

  const queuedOrder = tasks
    .filter((task) => task.status === "queued")
    .sort((a, b) => a.createdAt - b.createdAt);

  queuedOrder.forEach((task, index) => {
    task.position = index + 1;
  });

  return tasks;
}
