"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@prisma/client";

export function PhotoLightbox({
  photos,
  metadata,
}: {
  photos: Photo[];
  metadata?: { camera?: string | null; lens?: string | null; film?: string | null };
}) {
  const [active, setActive] = useState<number | null>(null);
  const current = active !== null ? photos[active] : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActive(index)}
            className="group relative aspect-[4/5] overflow-hidden bg-paper-deep text-left"
          >
            <Image
              src={photo.url}
              alt={photo.alt || `Photo ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              unoptimized
            />
            {(metadata?.camera || metadata?.lens || metadata?.film) && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-[rgba(26,34,28,0.78)] px-3 py-2 text-xs text-paper opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {[metadata.camera, metadata.lens, metadata.film].filter(Boolean).join(" · ")}
              </span>
            )}
          </button>
        ))}
      </div>

      {current && active !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(18,22,19,0.92)] p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 text-sm uppercase tracking-[0.16em] text-paper"
            onClick={() => setActive(null)}
          >
            Close
          </button>
          <div
            className="relative max-h-[90vh] max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.alt || "Full resolution photo"}
              className="max-h-[90vh] max-w-[92vw] object-contain"
            />
            <div className="mt-3 flex items-center justify-between gap-4 text-sm text-paper">
              <p>{[metadata?.camera, metadata?.lens, metadata?.film].filter(Boolean).join(" · ")}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={active === 0}
                  onClick={() => setActive((n) => (n !== null && n > 0 ? n - 1 : n))}
                  className="disabled:opacity-30"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={active === photos.length - 1}
                  onClick={() =>
                    setActive((n) => (n !== null && n < photos.length - 1 ? n + 1 : n))
                  }
                  className="disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
