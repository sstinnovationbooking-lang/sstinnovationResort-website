"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export interface HomepageMediaModalItem {
  id: string;
  imageUrl?: string;
  imageAlt?: string;
  title: string;
  description?: string;
}

interface HomepageMediaModalProps {
  isOpen: boolean;
  items: HomepageMediaModalItem[];
  currentIndex: number;
  closeLabel: string;
  previousLabel: string;
  nextLabel: string;
  emptyImageLabel: string;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(length - 1, Math.max(0, Math.floor(index)));
}

export function HomepageMediaModal({
  isOpen,
  items,
  currentIndex,
  closeLabel,
  previousLabel,
  nextLabel,
  emptyImageLabel,
  onClose,
  onChangeIndex
}: HomepageMediaModalProps) {
  const [imageBrokenById, setImageBrokenById] = useState<Record<string, boolean>>({});
  const itemCount = items.length;
  const activeIndex = clampIndex(currentIndex, itemCount);
  const activeItem = itemCount > 0 ? items[activeIndex] : null;
  const canNavigate = itemCount > 1;
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < itemCount - 1;

  const modalTitleId = useMemo(() => `homepage-media-modal-title-${activeItem?.id ?? "empty"}`, [activeItem?.id]);
  const modalDescriptionId = useMemo(
    () => `homepage-media-modal-description-${activeItem?.id ?? "empty"}`,
    [activeItem?.id]
  );

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !activeItem) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" && hasPrev) {
        event.preventDefault();
        onChangeIndex(activeIndex - 1);
        return;
      }
      if (event.key === "ArrowRight" && hasNext) {
        event.preventDefault();
        onChangeIndex(activeIndex + 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, activeItem, hasNext, hasPrev, isOpen, onChangeIndex, onClose]);

  if (!isOpen || !activeItem || typeof document === "undefined") {
    return null;
  }

  const isImageBroken = Boolean(imageBrokenById[activeItem.id]);
  const hasImage = Boolean(activeItem.imageUrl) && !isImageBroken;

  return createPortal(
    <div className="homepage-media-modal-overlay" onClick={onClose}>
      <section
        aria-describedby={modalDescriptionId}
        aria-labelledby={modalTitleId}
        aria-modal="true"
        className="homepage-media-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="homepage-media-modal-header">
          <h2 id={modalTitleId}>{activeItem.title}</h2>
          <button
            aria-label={closeLabel}
            className="homepage-media-modal-close"
            onClick={onClose}
            type="button"
          >
            {closeLabel}
          </button>
        </header>

        <div className="homepage-media-modal-body" id={modalDescriptionId}>
          <div className="homepage-media-modal-media-wrap">
            {canNavigate ? (
              <button
                aria-label={previousLabel}
                className="homepage-media-modal-nav homepage-media-modal-nav--prev"
                disabled={!hasPrev}
                onClick={() => onChangeIndex(activeIndex - 1)}
                type="button"
              >
                {"<"}
              </button>
            ) : null}

            <div className="homepage-media-modal-media">
              {hasImage ? (
                <Image
                  alt={activeItem.imageAlt || activeItem.title}
                  className="homepage-media-modal-image"
                  fill
                  onError={() => setImageBrokenById((prev) => ({ ...prev, [activeItem.id]: true }))}
                  sizes="(max-width: 767px) 100vw, 84vw"
                  src={activeItem.imageUrl || ""}
                  unoptimized
                />
              ) : (
                <div aria-label={emptyImageLabel} className="homepage-media-modal-image-empty" role="img" />
              )}
            </div>

            {canNavigate ? (
              <button
                aria-label={nextLabel}
                className="homepage-media-modal-nav homepage-media-modal-nav--next"
                disabled={!hasNext}
                onClick={() => onChangeIndex(activeIndex + 1)}
                type="button"
              >
                {">"}
              </button>
            ) : null}
          </div>

          {activeItem.description ? <p className="homepage-media-modal-description">{activeItem.description}</p> : null}
        </div>
      </section>
    </div>,
    document.body
  );
}
