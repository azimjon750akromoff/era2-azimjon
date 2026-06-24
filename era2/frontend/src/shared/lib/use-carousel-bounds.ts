import * as React from "react";

export function useCarouselBounds(ref: React.RefObject<HTMLElement | null>, deps: React.DependencyList = []) {
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  const sync = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 1;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft < max);
  }, [ref]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [ref, sync, ...deps]);

  const scrollBy = React.useCallback((direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;

    const firstItem = el.firstElementChild as HTMLElement | null;
    const step = firstItem ? firstItem.offsetWidth + 16 : 240;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }, [ref]);

  const scrollToStart = React.useCallback(() => {
    ref.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [ref]);

  return { canPrev, canNext, scrollBy, scrollToStart };
}
