"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { getLocalizedValue } from "@/lib/i18n/localized";
import type { CampingImageItemDTO } from "@/lib/types/site";

type LocaleOption = "th" | "en";

interface CampingHeroSliderProps {
  images: CampingImageItemDTO[];
  locale: LocaleOption;
}

const TOUCH_THRESHOLD = 40;
const TOUCH_CONTROLS_TIMEOUT_MS = 2400;
const HERO_IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%231a3f33'/%3E%3Cstop offset='100%25' stop-color='%232f6b58'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='900' fill='url(%23bg)'/%3E%3Ccircle cx='1290' cy='170' r='190' fill='%23ffffff1f'/%3E%3Cpath d='M0 680 C260 560 540 560 800 680 C1080 800 1320 800 1600 680 V900 H0 Z' fill='%23163a2f'/%3E%3C/svg%3E";

function toLocalized(locale: LocaleOption, value: unknown, fallback = ""): string {
  return getLocalizedValue(value, locale, fallback);
}

export function CampingHeroSlider({ images, locale }: CampingHeroSliderProps) {
  const labels = locale === "th"
    ? {
        previous: "ภาพก่อนหน้า",
        next: "ภาพถัดไป",
        indicator: "ภาพที่",
        of: "จาก",
        fallbackTitle: "โซนแคมป์ปิ้ง",
        fallbackDescription: "กำลังเตรียมรูปภาพสำหรับรีสอร์ตนี้"
      }
    : {
        previous: "Previous image",
        next: "Next image",
        indicator: "Image",
        of: "of",
        fallbackTitle: "Camping zone",
        fallbackDescription: "Images for this resort are being prepared"
      };

  const visibleImages = useMemo(
    () =>
      images
        .filter((item) => item.isVisible !== false)
        .sort((a, b) => Number(a.order ?? 999) - Number(b.order ?? 999)),
    [images]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Record<string, true>>({});
  const [isInteracting, setIsInteracting] = useState(false);
  const touchControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (touchControlsTimerRef.current) {
        clearTimeout(touchControlsTimerRef.current);
      }
    };
  }, []);

  const showTouchControls = () => {
    if (touchControlsTimerRef.current) {
      clearTimeout(touchControlsTimerRef.current);
    }
    setIsInteracting(true);
    touchControlsTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
      touchControlsTimerRef.current = null;
    }, TOUCH_CONTROLS_TIMEOUT_MS);
  };

  if (visibleImages.length === 0) {
    return (
      <div className="camping-hero-slider camping-hero-slider--fallback" aria-label={labels.fallbackTitle}>
        <div className="camping-hero-slider-fallback-content">
          <strong>{labels.fallbackTitle}</strong>
          <span>{labels.fallbackDescription}</span>
        </div>
      </div>
    );
  }

  const total = visibleImages.length;
  const safeActiveIndex = ((activeIndex % total) + total) % total;

  const goTo = (nextIndex: number) => {
    const normalized = ((nextIndex % total) + total) % total;
    setActiveIndex(normalized);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(safeActiveIndex + 1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(safeActiveIndex - 1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      goTo(total - 1);
    }
  };

  return (
    <div
      className={`camping-hero-slider ${isInteracting ? "is-interacting" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsInteracting(false);
        }
      }}
      onFocus={() => setIsInteracting(true)}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") {
          showTouchControls();
        }
      }}
      tabIndex={0}
    >
      <div
        className="camping-hero-slider-viewport"
        onTouchEnd={(event) => {
          if (touchStartX === null) return;
          const delta = event.changedTouches[0].clientX - touchStartX;
          if (Math.abs(delta) < TOUCH_THRESHOLD) {
            setTouchStartX(null);
            showTouchControls();
            return;
          }
          goTo(delta < 0 ? safeActiveIndex + 1 : safeActiveIndex - 1);
          setTouchStartX(null);
          showTouchControls();
        }}
        onTouchStart={(event) => {
          setTouchStartX(event.touches[0].clientX);
          showTouchControls();
        }}
      >
        <div className="camping-hero-slider-track" style={{ transform: `translateX(-${safeActiveIndex * 100}%)` }}>
          {visibleImages.map((item, index) => {
            const altText = toLocalized(locale, item.altText, labels.fallbackTitle);
            const imageSrc = failedImageIds[item.id] ? HERO_IMAGE_FALLBACK : item.src;

            return (
              <figure className="camping-hero-slide" key={item.id}>
                <Image
                  alt={altText}
                  fill
                  onError={() => {
                    setFailedImageIds((previous) => (previous[item.id] ? previous : { ...previous, [item.id]: true }));
                  }}
                  priority={index === 0}
                  sizes="100vw"
                  src={imageSrc}
                  unoptimized
                />
              </figure>
            );
          })}
        </div>
      </div>

      {total > 1 ? (
        <>
          <button
            aria-label={labels.previous}
            className="camping-hero-slider-nav camping-hero-slider-nav--prev"
            onClick={() => goTo(safeActiveIndex - 1)}
            type="button"
          >
            <span aria-hidden>{"<"}</span>
          </button>
          <button
            aria-label={labels.next}
            className="camping-hero-slider-nav camping-hero-slider-nav--next"
            onClick={() => goTo(safeActiveIndex + 1)}
            type="button"
          >
            <span aria-hidden>{">"}</span>
          </button>

          <div className="camping-hero-slider-dots" role="tablist">
            {visibleImages.map((item, index) => {
              const isActive = index === safeActiveIndex;
              return (
                <button
                  aria-label={`${labels.indicator} ${index + 1} ${labels.of} ${total}`}
                  aria-selected={isActive}
                  className={`camping-hero-slider-dot ${isActive ? "is-active" : ""}`}
                  key={`${item.id}-dot`}
                  onClick={() => goTo(index)}
                  role="tab"
                  type="button"
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
