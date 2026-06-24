import * as React from "react";

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}
