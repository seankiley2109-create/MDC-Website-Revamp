# Montana Data Company — Magic MCP Prompt Template

Paste the **System Context** block at the start of every `/ui` command,
then append your specific component request at the end.

---

## System Context (always include)

```
DESIGN SYSTEM — Montana Data Company

Stack: Next.js 15 App Router, Tailwind CSS v4 (@theme syntax), motion/react for animations.
No shadcn CSS variables. Use the literal values below.

COLORS:
- Background:  #0A0A0A   (bg-montana-bg or bg-[#0A0A0A])
- Surface:     #1A1A1A   (bg-montana-surface or bg-[#1A1A1A])
- Light text:  #F7F7F7   (text-montana-light or text-[#F7F7F7])
- Muted text:  #BFBFBF   (text-montana-muted or text-[#BFBFBF])
- Brand gradient: #DD297D → #F24567 → #F65559 → #F86C49 (magenta to orange)

TYPOGRAPHY:
- Display/headings: var(--font-space-grotesk) — bold, tight tracking, uppercase for labels
- Body: var(--font-inter)
- Monospace: font-mono for data/terminal elements

GLASS CARD PATTERN:
  border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-md shadow-2xl
  hover:border-[#F24567]/30 transition-all duration-300
  Top accent: <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

BUTTON PATTERNS:
- Primary:  bg-gradient-to-r from-[#DD297D] via-[#F24567] to-[#F86C49] text-white uppercase font-bold tracking-wide shadow-[0_0_20px_rgba(242,69,103,0.3)]
- Secondary: bg-[#1A1A1A] border border-white/10 text-white hover:bg-[#2A2A2A]
- Outline:  border border-white/20 text-white hover:bg-white/5

MOTION (use motion/react, NOT framer-motion):
  import { motion } from "motion/react"
  - Entrance: initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
  - Stagger children: use transition={{ delay: index * 0.1 }}
  - Hover scale: whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}

AESTHETIC RULES:
- Dark-first: everything on #0A0A0A base
- Glassmorphism: semi-transparent surfaces with backdrop-blur
- Brand gradient used SPARINGLY — text accents, CTA buttons, active states only
- Borders: white/10 default, white/20 hover, [#F24567]/30 brand hover
- No rounded-full on cards — use rounded-xl or sharp corners
- Grid/layout backgrounds: subtle grid pattern via CSS or low-opacity lines
- Enterprise tone: clean, dense, data-rich — NOT playful/consumer

UTILITIES AVAILABLE:
  cn() from "@/lib/utils"
  GlassCard from "@/components/ui/glass-card"
  AnimatedButton from "@/components/ui/animated-button"
  TerminalWindow from "@/components/ui/terminal-window"
```

---

## Component Request Examples

### Hero Section
```
/ui [paste System Context above]

BUILD: A hero section for a cloud backup & cyber resilience company.
- Asymmetric two-column layout: large editorial heading left, animated terminal/stats right
- Heading: "YOUR DATA. ALWAYS PROTECTED." — Space Grotesk, 6xl-7xl, white with "ALWAYS PROTECTED" in brand gradient
- Subheading: one line, text-[#BFBFBF], max-w-md
- Two buttons: primary CTA "Build Your Solution" + outline "View Services"
- Right column: TerminalWindow component showing backup status lines
- Background: #0A0A0A with subtle grid pattern overlay
- Staggered entrance animations via motion/react
```

### Service Card Grid
```
/ui [paste System Context above]

BUILD: A 3-column service card grid.
- Each card uses the GlassCard pattern (glass surface, white/10 border, top accent line)
- Card contains: Lucide icon (import from lucide-react) in brand gradient color, title, 2-line description, "Learn More →" link
- Icon wrapper: small square bg-[#DD297D]/10 border border-[#DD297D]/20 p-2 rounded-lg
- Hover: card border shifts to [#F24567]/30, icon wrapper brightens
- Motion: stagger cards on scroll entry with viewport={{ once: true }}
```

### Stats / Trust Strip
```
/ui [paste System Context above]

BUILD: A horizontal stats bar — 4 metrics side by side.
- Background: bg-[#1A1A1A]/50 border-y border-white/5
- Each stat: large number in brand gradient text + label in text-[#BFBFBF]
- Dividers between stats: border-r border-white/10
- Numbers animate count-up on viewport entry
```

### Pricing / Plan Card
```
/ui [paste System Context above]

BUILD: A pricing card with a "Popular" variant.
- Base: GlassCard pattern, sharp corners
- Popular variant: outer glow shadow-[0_0_40px_rgba(242,69,103,0.15)], brand gradient top border instead of white/10
- Contains: plan name (uppercase, tracking-widest, text-[#BFBFBF]), price (large, white), feature list with Lucide Check icons in [#DD297D], CTA button
- Hover: subtle scale(1.01) via motion/react
```

### Data Table / Dashboard Card
```
/ui [paste System Context above]

BUILD: A system health dashboard card for backup job status.
- GlassCard base, header with title + "Live" badge (pulsing green dot + "LIVE" text)
- Table rows: job name, size, duration, status badge
- Status badges: "Complete" = bg-green-500/10 text-green-400 border-green-500/20, "Running" = bg-[#F24567]/10 text-[#F24567] border-[#F24567]/20
- Monospace font for sizes/durations
- Subtle row hover: bg-white/[0.02]
```

---

## Quick-Copy One-Liner Prefix

For short prompts, prepend this condensed version:

```
Montana Data Company design system: dark bg-[#0A0A0A], glass cards (bg-[#1A1A1A]/80 backdrop-blur border-white/10), brand gradient #DD297D→#F86C49, Space Grotesk headings, motion/react animations, enterprise aesthetic. No shadcn CSS vars.
```
