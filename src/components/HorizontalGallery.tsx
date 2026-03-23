"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HorizontalGalleryProps {
  images: { src: string; alt: string; caption?: string }[];
}

export function HorizontalGallery({ images }: HorizontalGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  return (
    <div ref={containerRef} className="overflow-hidden py-1">
      <motion.div style={{ x }} className="flex gap-2">
        {images.map((img, i) => (
          <div
            key={img.src}
            className="relative flex-shrink-0 w-[45vw] md:w-[30vw] lg:w-[22vw] aspect-[3/2] overflow-hidden img-zoom"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
            />
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-ppa-black/80 to-transparent">
                <p className="text-xs text-ppa-light">{img.caption}</p>
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
