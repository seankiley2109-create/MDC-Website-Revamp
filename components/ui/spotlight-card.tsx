"use client";

import React, { useEffect, useRef, ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "montana" | "blue" | "purple" | "green" | "red" | "orange";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const glowColorMap = {
  montana: { base: 330, spread: 50 }, // magenta #DD297D → orange #F86C49
  blue:    { base: 220, spread: 200 },
  purple:  { base: 280, spread: 300 },
  green:   { base: 120, spread: 200 },
  red:     { base: 0,   spread: 200 },
  orange:  { base: 30,  spread: 200 },
};

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

// FIX 1: will-change: filter removed — applied dynamically via mouseenter/mouseleave instead
// Injected once per app via singleton — not once per card instance
const GLOW_CSS = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }
  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(var(--hue, 330) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 55) * 1%) / var(--border-spot-opacity, 1)),
      transparent 100%
    );
    filter: brightness(2);
  }
  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity, 0.8)),
      transparent 100%
    );
  }
  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    border-width: calc(var(--border-size) * 20);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }
  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }
  @media (pointer: coarse) {
    [data-glow]::before,
    [data-glow]::after,
    [data-glow] > [data-glow]::before {
      display: none;
    }
    [data-glow] {
      --bg-spot-opacity: 0;
    }
  }
`;

let glowStylesInjected = false;

// FIX 2: Single shared module-level pointermove listener — N cards share one document handler
type PointerCallback = (x: number, y: number) => void;
const listeners = new Set<PointerCallback>();
let sharedRafId: number | null = null;

function handleSharedPointerMove(e: PointerEvent) {
  if (sharedRafId !== null) return;
  const { clientX: x, clientY: y } = e;
  sharedRafId = requestAnimationFrame(() => {
    sharedRafId = null;
    listeners.forEach((cb) => cb(x, y));
  });
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  glowColor = "montana",
  size = "md",
  width,
  height,
  customSize = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject shared CSS once for the whole app
    if (!glowStylesInjected) {
      glowStylesInjected = true;
      const el = document.createElement("style");
      el.textContent = GLOW_CSS;
      document.head.appendChild(el);
    }

    // Only wire up pointer tracking on devices with a precise pointer (mouse/trackpad).
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // Per-card callback — updates only this card's CSS custom properties
    const cb: PointerCallback = (x, y) => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty("--x", x.toFixed(2));
      cardRef.current.style.setProperty("--xp", (x / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty("--y", y.toFixed(2));
      cardRef.current.style.setProperty("--yp", (y / window.innerHeight).toFixed(2));
    };

    // Register shared document listener only when first subscriber mounts
    if (listeners.size === 0) {
      document.addEventListener("pointermove", handleSharedPointerMove);
    }
    listeners.add(cb);

    return () => {
      listeners.delete(cb);
      // Deregister shared listener only when last subscriber unmounts
      if (listeners.size === 0) {
        document.removeEventListener("pointermove", handleSharedPointerMove);
        if (sharedRafId !== null) {
          cancelAnimationFrame(sharedRafId);
          sharedRafId = null;
        }
      }
    };
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  const inlineStyles: React.CSSProperties & Record<string, string | number> = {
    "--base": base,
    "--spread": spread,
    "--radius": "14",
    "--border": "2",
    "--backdrop": "rgba(26, 26, 26, 0.80)",
    "--backup-border": "rgba(255, 255, 255, 0.10)",
    "--size": "220",
    "--outer": "1",
    "--border-size": "calc(var(--border, 2) * 1px)",
    "--spotlight-size": "calc(var(--size, 150) * 1px)",
    "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(var(--hue, 330) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 65) * 1%) / var(--bg-spot-opacity, 0.12)),
      transparent
    )`,
    backgroundColor: "var(--backdrop, transparent)",
    backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
    backgroundPosition: "50% 50%",
    backgroundAttachment: "fixed",
    border: "var(--border-size) solid var(--backup-border)",
    position: "relative",
  };

  if (width !== undefined) inlineStyles.width = typeof width === "number" ? `${width}px` : width;
  if (height !== undefined) inlineStyles.height = typeof height === "number" ? `${height}px` : height;

  return (
    <>
      <div
        ref={cardRef}
        data-glow
        style={inlineStyles}
        // FIX 1: Set/unset will-change via ref on mouseenter/mouseleave — no re-render
        onMouseEnter={() => {
          if (glowRef.current) glowRef.current.style.willChange = "transform";
        }}
        onMouseLeave={() => {
          if (glowRef.current) glowRef.current.style.willChange = "";
        }}
        className={`
          ${!customSize ? sizeMap[size] : ""}
          rounded-xl relative shadow-2xl p-6 backdrop-blur-sm
          ${className}
        `}
      >
        {/* FIX 1: glowRef attached here — will-change toggled imperatively on hover */}
        <div ref={glowRef} data-glow className="absolute inset-0 pointer-events-none rounded-xl" />
        <div className="relative z-10 h-full">{children}</div>
      </div>
    </>
  );
};

export { SpotlightCard };
