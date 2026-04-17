import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function GlassCard({ children, className, glow = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-white/10 bg-montana-surface/80 backdrop-blur-md p-8 shadow-2xl transition-all duration-300 hover:border-montana-pink/30",
        glow && "before:absolute before:inset-0 before:-z-10 before:bg-montana-magenta/10 before:blur-3xl",
        className
      )}
      {...props}
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
