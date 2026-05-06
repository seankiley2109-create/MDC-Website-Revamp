"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BLOG_CATEGORIES, CATEGORY_COLORS, type BlogCategory } from "@/lib/blog";

interface CategoryFilterProps {
  counts: Record<string, number>;
  totalCount: number;
}

export function CategoryFilter({ counts, totalCount }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") as BlogCategory | null;

  function select(cat: BlogCategory | null) {
    if (cat) {
      router.push(`/blog?category=${encodeURIComponent(cat)}`);
    } else {
      router.push("/blog");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => select(null)}
        className={`px-4 py-2 text-sm font-medium border transition-all duration-200 ${
          !active
            ? "bg-montana-pink/10 border-montana-pink/40 text-montana-pink"
            : "bg-transparent border-white/10 text-montana-muted hover:text-white hover:border-white/20"
        }`}
      >
        All
        <span className="ml-2 text-xs opacity-60">{totalCount}</span>
      </button>

      {BLOG_CATEGORIES.map((cat) => {
        const isActive = active === cat;
        const colors = CATEGORY_COLORS[cat];
        const count = counts[cat] ?? 0;
        if (count === 0) return null;

        return (
          <button
            key={cat}
            onClick={() => select(cat)}
            className={`px-4 py-2 text-sm font-medium border transition-all duration-200 ${
              isActive
                ? `${colors.bg} ${colors.border} ${colors.text}`
                : "bg-transparent border-white/10 text-montana-muted hover:text-white hover:border-white/20"
            }`}
          >
            {cat}
            <span className="ml-2 text-xs opacity-60">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
