"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Scales the fixed-width A4 sheet down to fit narrow viewports (mobile), while
// keeping it 1:1 and centered on wider screens.
export function SheetScaler({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    function update() {
      const cw = container!.clientWidth;
      const sw = inner!.offsetWidth || 1;
      const sh = inner!.offsetHeight || 0;
      const s = Math.min(1, cw / sw);
      setScale(s);
      setOffset(Math.max(0, (cw - sw * s) / 2));
      setHeight(sh * s);
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ height }} className="relative w-full">
      <div
        ref={innerRef}
        className="bg-white shadow-lg"
        style={{
          width: "fit-content",
          transform: `translateX(${offset}px) scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
