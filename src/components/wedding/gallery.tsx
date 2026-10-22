"use client";

import Image from "next/image";
import { Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { wedding } from "@/lib/wedding-data";

export function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const selectedImage = selectedIndex === null ? null : wedding.gallery[selectedIndex];

  useEffect(() => {
    if (selectedIndex === null) return;

    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedIndex]);

  return (
    <>
      <div className="gallery-grid">
        {wedding.gallery.map((image, index) => (
          <div className="gallery-tile" key={image.src}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 34vw"
            />
            <button
              className="gallery-open"
              onClick={() => setSelectedIndex(index)}
              type="button"
              aria-label={`View photo: ${image.caption}`}
            >
              <Expand size={24} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="gallery-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.caption}
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="gallery-close"
            onClick={() => setSelectedIndex(null)}
            ref={closeButtonRef}
            type="button"
            aria-label="Close photo"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <Image
            src={selectedImage.src}
            alt={selectedImage.alt}
            width={1400}
            height={1000}
            sizes="100vw"
            onClick={(event) => event.stopPropagation()}
          />
          <p className="gallery-caption">{selectedImage.caption}</p>
        </div>
      )}
    </>
  );
}
