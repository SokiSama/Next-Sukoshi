"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { vrcPhotos } from "../data/vrcPhotos";
import { ArrowsOut, CaretLeft, CaretRight, X } from "@phosphor-icons/react";

const photos = vrcPhotos;

export function CyberWorldCard() {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = activePhoto !== null;

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const trigger = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = originalOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  const changePhoto = (direction: number) => {
    setActivePhoto((current) => current === null ? null : (current + direction + photos.length) % photos.length);
  };

  return (
    <>
      <section className="card cyber-world-card" aria-labelledby="cyber-world-title">
        <header className="cyber-world-heading">
          <div>
            <span>CYBER WORLD</span>
            <h2 id="cyber-world-title">VRChat 记录</h2>
          </div>
          <p>在这里收集你自己的照片与回忆。</p>
        </header>

        <div className="cyber-world-wall">
          {photos.map((photo, index) => (
            <button
              className="cyber-world-photo"
              type="button"
              key={photo.src}
              onClick={() => setActivePhoto(index)}
              aria-label={`放大查看：${photo.alt}`}
            >
              <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
              <span className="cyber-world-photo__zoom" aria-hidden="true">
                <ArrowsOut weight="bold" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {activePhoto !== null && createPortal(
        <dialog
          ref={dialogRef}
          className="cyber-world-lightbox"
          aria-modal="true"
          aria-label="照片大图预览"
          aria-describedby="cyber-world-photo-caption"
          onCancel={(event) => {
            event.preventDefault();
            setActivePhoto(null);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setActivePhoto(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              changePhoto(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          <button
            type="button"
            className="cyber-world-lightbox__close"
            onClick={() => setActivePhoto(null)}
            aria-label="关闭大图"
            autoFocus
          >
            <X weight="bold" />
          </button>
          <button
            type="button"
            className="cyber-world-lightbox__previous"
            onClick={() => changePhoto(-1)}
            aria-label="上一张照片"
          >
            <CaretLeft weight="bold" />
          </button>
          <figure>
            <img src={photos[activePhoto].src} alt={photos[activePhoto].alt} />
            <figcaption id="cyber-world-photo-caption" aria-live="polite" aria-atomic="true">
              <span>{activePhoto + 1} / {photos.length}</span>
              {photos[activePhoto].alt}
            </figcaption>
          </figure>
          <button
            type="button"
            className="cyber-world-lightbox__next"
            onClick={() => changePhoto(1)}
            aria-label="下一张照片"
          >
            <CaretRight weight="bold" />
          </button>
        </dialog>,
        document.body,
      )}
    </>
  );
}
