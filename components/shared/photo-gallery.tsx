"use client"

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

interface PhotoGalleryProps {
  photos: { src: string; caption?: string }[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i + photos.length - 1) % photos.length
    );
  const next = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    el?.addEventListener("scroll", updateScrollButtons);
    return () => el?.removeEventListener("scroll", updateScrollButtons);
  }, []);

  const scrollBy = (distance: number) => {
    scrollRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  return (
    <>
      {/* Горизонтальная лента с кнопками */}
      <h2 className="text-2xl font-semibold">Фотогалерея</h2>
      <section className="relative py-3 ">
        <div className="absolute top-0 left-8 right-8 border-t-2 border-[#968a7f]" />
        <div className="relative">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollBy(-300)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full z-10 hover:bg-black/70"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Thumbnails */}
          <div
            ref={scrollRef}
            className="flex space-x-4 overflow-hidden no-scrollbar transition-all"
          >
            {photos.map((photo, i) => (
              <motion.button
                key={i}
                onClick={() => openLightbox(i)}
                className="flex-shrink-0 rounded-lg border-none bg-transparent overflow-hidden hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                layoutId={`photo-${i}`}
              >
                <img
                  src={photo.src}
                  alt={photo.caption || `Фото ${i + 1}`}
                  width={150}
                  height={100}
                  style={{
                    objectFit: "cover",
                  }}
                />
              </motion.button>
            ))}
          </div>

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scrollBy(300)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full z-10 hover:bg-black/70"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
        <div className="absolute bottom-0 left-8 right-8 border-b-2 border-[#968a7f]" />
      </section>

      {/* Лайтбокс */}
      {typeof window !== "undefined" && lightboxIndex !== null
        ? createPortal(
            <AnimatePresence>
              <motion.div
                className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeLightbox}
              >
                {/* Кнопка Prev слева всего экрана */}
                {lightboxIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prev();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 hover:text-white text-gray-400 p-2 rounded-full hover:bg-transparent border-none bg-transparent z-[100000]"
                  >
                    <ChevronLeft size={32} />
                  </button>
                )}

                {/* Центрированный контент */}
                <motion.div
                  className="relative p-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Изображение */}
                  {}
                  <img
                    src={photos[lightboxIndex].src}
                    alt={
                      photos[lightboxIndex].caption ||
                      `Фото ${lightboxIndex + 1}`
                    }
                    style={{
                      objectFit: "contain",
                      maxWidth: "90vw",
                      maxHeight: "90vh",
                      width: "auto",
                      height: "auto",
                    }}
                  />

                  {/* Подпись */}
                  {photos[lightboxIndex].caption && (
                    <div className="mt-4 text-center text-white text-lg">
                      {photos[lightboxIndex].caption}
                    </div>
                  )}
                </motion.div>

                {/* Кнопка Next справа всего экрана */}
                {lightboxIndex < photos.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      next();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-white text-gray-400 p-2 rounded-full hover:bg-transparent border-none bg-transparent z-[100000]"
                  >
                    <ChevronRight size={32} />
                  </button>
                )}
              </motion.div>
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
