"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface PhotoGridProps {
  photos: { src: string; alt: string }[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
      {photos.map((photo, i) => (
        <motion.div
          key={photo.src}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="aspect-[4/3] relative overflow-hidden img-zoom"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-ppa-black/20 hover:bg-transparent transition-colors duration-500" />
        </motion.div>
      ))}
    </div>
  );
}
