import * as React from "react";

export function useDragScroll(ref: React.RefObject<HTMLElement | null>, enabled: boolean = true) {
  const drag = React.useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);

  const snapToNearest = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const firstItem = el.firstElementChild as HTMLElement | null;
    if (!firstItem) return;

    const step = firstItem.offsetWidth + 16;
    const index = Math.round(el.scrollLeft / step);
    el.scrollTo({ left: index * step, behavior: "smooth" });
  }, [ref]);

  const onPointerDown = React.useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!enabled || !ref.current) return;
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    if (event.button !== 0) return;

    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: ref.current.scrollLeft,
      moved: false,
    };
  }, [enabled, ref]);

  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLElement>) => {
    const state = drag.current;
    const el = ref.current;
    if (!state || !el || state.pointerId !== event.pointerId) return;

    const delta = event.clientX - state.startX;
    if (Math.abs(delta) > 4) state.moved = true;
    el.scrollLeft = state.startScroll - delta;
  }, [ref]);

  const finish = React.useCallback((event: React.PointerEvent<HTMLElement>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const el = ref.current;
    drag.current = null;

    if (state.moved && el) {
      snapToNearest();
    }
  }, [ref, snapToNearest]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: finish,
    onPointerCancel: finish,
  };
}
