"use client";

import { useState } from "react";
import { motion } from "motion/react";

interface NetworkNode {
  id: number;
  x: number;
  y: number;
  lines: string[];
  primary?: boolean;
}

const NODES: NetworkNode[] = [
  { id: 0, x: 160, y: 150, lines: ["Montana", "DC"], primary: true },
  { id: 1, x: 160, y: 50,  lines: ["Protect"] },
  { id: 2, x: 255, y: 100, lines: ["Recover"] },
  { id: 3, x: 255, y: 200, lines: ["Transfer"] },
  { id: 4, x: 160, y: 250, lines: ["Govern"] },
  { id: 5, x: 65,  y: 200, lines: ["Defend "] },
  { id: 6, x: 65,  y: 100, lines: ["Automate"] },
];

const EDGES: [number, number][] = [
  // Hub spokes
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  // Outer ring
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1],
];

const PRIMARY_R = 38;
const NODE_R = 30;

function getConnected(id: number): Set<number> {
  const s = new Set<number>();
  EDGES.forEach(([a, b]) => {
    if (a === id) s.add(b);
    if (b === id) s.add(a);
  });
  return s;
}

export function NetworkGraph() {
  const [hovered, setHovered] = useState<number | null>(null);

  const connected = hovered !== null ? getConnected(hovered) : new Set<number>();
  const isEdgeActive = (a: number, b: number) =>
    hovered !== null && (hovered === a || hovered === b);
  const isNodeDimmed = (id: number) =>
    hovered !== null && id !== hovered && !connected.has(id);

  return (
    <div className="h-full w-full border border-white/10 bg-[#1A1A1A]/50 p-4 relative overflow-hidden flex items-center justify-center min-h-[280px]">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#DD297D] opacity-10 blur-[80px]" />

      <svg
        viewBox="0 0 320 300"
        className="w-full max-w-[380px] h-auto"
        aria-label="Montana Data Company service architecture network"
      >
        <defs>
          {/* Gradient for primary node border */}
          <linearGradient id="ng-primary-border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DD297D" />
            <stop offset="100%" stopColor="#F86C49" />
          </linearGradient>
        </defs>

        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const na = NODES[a], nb = NODES[b];
          const active = isEdgeActive(a, b);
          // FIX 5: stroke and strokeWidth are static — only opacity is animated (compositor-only)
          return (
            <motion.line
              key={i}
              x1={na.x} y1={na.y}
              x2={nb.x} y2={nb.y}
              stroke={active ? "#F24567" : "rgba(255,255,255,0.08)"}
              strokeWidth={2}
              animate={{
                opacity: active ? 0.8 : hovered !== null ? 0.3 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((node) => {
          const r = node.primary ? PRIMARY_R : NODE_R;
          const active = hovered === node.id;
          const dimmed = isNodeDimmed(node.id);

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* FIX 7: willChange promotes this SVG group to a compositor layer for scale animation */}
              <motion.g
                animate={{ scale: active ? 1.12 : 1, opacity: dimmed ? 0.25 : 1 }}
                transition={{ duration: 0.2 }}
                style={{ willChange: "transform" }}
              >
                {/* Hover glow ring */}
                <motion.circle
                  r={r + 8}
                  fill="rgba(221,41,125,0.06)"
                  stroke="rgba(221,41,125,0.22)"
                  strokeWidth="1"
                  animate={{ opacity: active ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
                {/* Node body */}
                <circle
                  r={r}
                  fill="rgba(26,26,26,0.95)"
                  stroke={
                    node.primary
                      ? "url(#ng-primary-border)"
                      : active
                      ? "#F24567"
                      : "rgba(255,255,255,0.12)"
                  }
                  strokeWidth={node.primary ? 1.5 : 1.2}
                />
                {/* Inner tint */}
                <circle
                  r={r}
                  fill={
                    node.primary
                      ? "rgba(221,41,125,0.12)"
                      : active
                      ? "rgba(221,41,125,0.09)"
                      : "rgba(242,69,103,0.03)"
                  }
                />
                {/* Label */}
                {node.lines.map((line, li) => (
                  <text
                    key={li}
                    y={node.lines.length === 1 ? 3 : li === 0 ? -3.5 : 8}
                    textAnchor="middle"
                    fill={active || node.primary ? "#F7F7F7" : "rgba(255,255,255,0.75)"}
                    fontSize={node.primary ? 9 : 8}
                    fontWeight="700"
                    letterSpacing="0.02em"
                  >
                    {line}
                  </text>
                ))}
              </motion.g>
              {/* Enlarged invisible hit area */}
              <circle r={r + 12} fill="transparent" />
            </g>
          );
        })}

        {/* FIX 6: Ripple pulse — r animation replaced with scale on motion.g (compositor-only) */}
        <g
          transform={`translate(${NODES[0].x}, ${NODES[0].y})`}
          style={{ pointerEvents: "none" }}
        >
          <motion.g
            style={{ transformOrigin: "0px 0px" }}
            animate={{
              scale: [1, (PRIMARY_R + 20) / (PRIMARY_R + 6)],
              opacity: [0.4, 0],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          >
            <circle
              r={PRIMARY_R + 6}
              fill="none"
              stroke="#DD297D"
              strokeWidth="1"
            />
          </motion.g>
        </g>
      </svg>
    </div>
  );
}
