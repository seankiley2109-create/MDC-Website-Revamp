"use client";

import Image from "next/image";
import { motion } from "motion/react";

const logos = [
  { name: "DSK", src: "/logos/dsk.jpg" },
  { name: "Fairview", src: "/logos/fairview.jpg" },
  { name: "JA Immelman", src: "/logos/ja-immelman.jpg" },
  { name: "Louw & Da Silva", src: "/logos/louw-da-silva.jpg" },
  { name: "Luxottica", src: "/logos/luxottica.jpg" },
  { name: "Pie in the Sky", src: "/logos/pie-in-the-sky.jpg" },
  { name: "Vio Travel", src: "/logos/vio-travel.jpg" },
  { name: "VW", src: "/logos/vw.webp" },
  { name: "ARM", src: "/logos/arm.jpg" },
  { name: "Aspen", src: "/logos/aspen.jpg" },
  { name: "BCX", src: "/logos/bcx.jpg" },
];

export function ClientLogos() {
  return (
    <section className="py-16 md:py-24 border-b border-white/5 bg-montana-bg overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-10 md:mb-16 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
          Trusted by organisations that can&apos;t afford failure
        </h2>
        <p className="text-sm text-montana-muted uppercase tracking-widest font-medium">
          Across enterprise, legal, financial, and operational environments
        </p>
      </div>

      <div className="relative w-full flex flex-col items-center justify-center">
        {/* Left and Right fade masks for smooth marquee effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-montana-bg to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-montana-bg to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden w-full group">
          <motion.div
            className="flex items-center gap-12 md:gap-20 px-8 md:px-12 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 65,
            }}
          >
            {/* Double the logos array to create a seamless loop */}
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="relative flex items-center justify-center h-20 w-36 md:h-24 md:w-44 shrink-0 group/logo"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* 
                    Using CSS filters to achieve the requested effect:
                    - default: grayscale, opacity 60%
                    - hover: full color, opacity 100%, slight scale
                    Note: If logos have white backgrounds, consider using transparent PNGs 
                    or CSS mix-blend-mode if appropriate for the specific logo colors.
                  */}
                  <Image
                    src={logo.src}
                    alt={`${logo.name} logo`}
                    fill
                    className="object-contain transition-all duration-500 ease-out opacity-60 group-hover/logo:opacity-100 group-hover/logo:scale-120 group-hover/logo:grayscale-0 brightness-200 contrast-125 group-hover/logo:brightness-100 group-hover/logo:contrast-100"
                    sizes="(max-width: 768px) 128px, 160px"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
