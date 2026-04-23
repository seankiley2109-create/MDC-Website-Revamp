"use client";

import { useState } from "react";
import { motion } from "motion/react";

const NODES = ["Protect", "Recover", "Transfer", "Secure", "Govern"] as const;
const R = 70;
const CX = 100;
const CY = 100;
const NODE_R = 17;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

const pts = NODES.map((label, i) => {
  const angle = -90 + i * 72;
  return {
    x: CX + R * Math.cos(toRad(angle)),
    y: CY + R * Math.sin(toRad(angle)),
    label,
  };
});

function getArcPath(i: number) {
  const p = pts[i];
  const next = pts[(i + 1) % pts.length];
  const mx = (p.x + next.x) / 2;
  const my = (p.y + next.y) / 2;
  const cpx = mx + (CX - mx) * 0.3;
  const cpy = my + (CY - my) * 0.3;
  return `M ${p.x} ${p.y} Q ${cpx} ${cpy} ${next.x} ${next.y}`;
}

export function CircularFlowDiagram() {
  const [hovered, setHovered] = useState<number | null>(null);

  // Arc i connects node i → node (i+1)%5.
  // Hovering node j glows arcs j and (j-1+5)%5.
  const isArcGlowing = (i: number) =>
    hovered !== null && (i === hovered || i === (hovered - 1 + 5) % 5);

  return (
    <div className="h-full w-full border border-white/10 bg-[#1A1A1A]/50 p-4 relative overflow-hidden flex items-center justify-center min-h-[280px]">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#DD297D] opacity-10 blur-[80px]" />
      <svg
        viewBox="0 0 200 200"
        className="w-full max-w-[300px] h-auto"
        aria-label="Data resilience flow: Protect, Recover, Transfer, Secure, Govern"
      >
        <defs>
          <marker id="arrow-dim" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="rgba(255,255,255,0.15)" />
          </marker>
          <marker id="arrow-glow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="#F24567" />
          </marker>
        </defs>

        {/* Center label */}
        <text x={CX} y={CY - 4} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7" fontWeight="700" letterSpacing="0.08em">DATA</text>
        <text x={CX} y={CY + 6} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7" fontWeight="700" letterSpacing="0.08em">RESILIENCE</text>

        {/* Arc connectors */}
        {pts.map((_, i) => {
          const glowing = isArcGlowing(i);
          return (
            <motion.path
              key={i}
              d={getArcPath(i)}
              fill="none"
              markerEnd={glowing ? "url(#arrow-glow)" : "url(#arrow-dim)"}
              animate={{
                stroke: glowing ? "#F24567" : "rgba(255,255,255,0.15)",
                strokeWidth: glowing ? 1.8 : 1,
                opacity: hovered !== null && !glowing ? 0.15 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
          );
        })}

        {/* Nodes — translated to position so scale animates from node center */}
        {pts.map((p, i) => {
          const active = hovered === i;
          const dimmed = hovered !== null && !active;
          return (
            <g
              key={i}
              transform={`translate(${p.x}, ${p.y})`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <motion.g
                animate={{ scale: active ? 1.18 : 1, opacity: dimmed ? 0.3 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {/* Outer glow ring — only visible when active */}
                <motion.circle
                  r={NODE_R + 5}
                  fill="rgba(221,41,125,0.07)"
                  stroke="rgba(221,41,125,0.18)"
                  strokeWidth="1"
                  animate={{ opacity: active ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
                {/* Node body */}
                <circle
                  r={NODE_R}
                  fill="rgba(26,26,26,0.95)"
                  stroke={active ? "#F24567" : "rgba(255,255,255,0.15)"}
                  strokeWidth="1.5"
                />
                {/* Inner tint */}
                <circle
                  r={NODE_R}
                  fill={active ? "rgba(221,41,125,0.14)" : "rgba(242,69,103,0.04)"}
                />
                {/* Label */}
                <text
                  y="3"
                  textAnchor="middle"
                  fill={active ? "#F7F7F7" : "rgba(255,255,255,0.8)"}
                  fontSize="6"
                  fontWeight="700"
                  letterSpacing="0.02em"
                >
                  {p.label}
                </text>
              </motion.g>
              {/* Enlarged invisible hit area for easier hover targeting */}
              <circle r={NODE_R + 8} fill="transparent" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
