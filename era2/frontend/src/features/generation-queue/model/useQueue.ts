import { useQueueContext } from "./QueueProvider";

export function useQueue() {
  return useQueueContext();
}
