import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";

/** Parallel frame fetches. Enough to saturate the connection, few enough
 *  not to starve the eager window at the front of the sequence. */
const CONCURRENCY = 8;

interface ScrollImageSequenceProps {
  /** Number of frames in the sequence. */
  count: number;
  /** Builds the URL for frame i. */
  srcFor: (i: number) => string;
  /** 0–1 scrub position. Read imperatively, never through React state. */
  progress: MotionValue<number>;
  /** Native pixel size of a frame, used for the backing canvas. */
  width: number;
  height: number;
  className?: string;
  /** Fires once the sequence has enough frames to scrub without gaps. */
  onReady?: () => void;
  /** Decode priority window, in frames, around the current position. */
  eager?: number;
  /**
   * How the frame fills the canvas. "cover" crops to fill, which is what
   * opaque frames need — "contain" would letterbox and expose the frame's
   * own edges against the page.
   */
  fit?: "contain" | "cover";
}

/**
 * Scroll-driven frame sequence on a canvas.
 *
 * This exists because scrubbing an MP4's currentTime is inherently janky:
 * the decoder has to hunt for the nearest keyframe on every seek, and the
 * hero clip has a ~150-frame GOP, so most scroll positions land nowhere near
 * one. Drawing pre-decoded frames sidesteps the decoder entirely — every
 * scroll position maps to an exact image with no seeking at all.
 *
 * Frames are decoded to ImageBitmaps up front. An ImageBitmap is already in
 * GPU-ready form, so drawImage is a blit rather than a decode, which is what
 * keeps this at 60fps where <img> would stutter on first paint of each frame.
 */
export function ScrollImageSequence({
  count,
  srcFor,
  progress,
  width,
  height,
  className,
  onReady,
  eager = 24,
  fit = "contain",
}: ScrollImageSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(ImageBitmap | null)[]>([]);
  const drawnRef = useRef(-1);
  const rafRef = useRef<number | undefined>(undefined);

  // Held in a ref, deliberately. If the callback were a dependency of the
  // effect below, every parent re-render would pass a new closure, tear the
  // sequence down and re-download all of it — which is exactly what happens
  // while scrolling, since the parent re-renders as its own state changes.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let cancelled = false;
    framesRef.current = new Array(count).fill(null);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const w = fit === "cover" && rect.width ? rect.width : width;
      const h = fit === "cover" && rect.height ? rect.height : height;
      const nextW = Math.round(w * dpr);
      const nextH = Math.round(h * dpr);
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
        drawnRef.current = -1;
        return true;
      }
      return false;
    };
    sizeCanvas();

    /** Nearest already-decoded frame, so scrubbing never shows a blank. */
    const resolve = (i: number) => {
      const frames = framesRef.current;
      if (frames[i]) return frames[i];
      for (let d = 1; d < count; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    };

    const draw = () => {
      rafRef.current = undefined;
      const i = Math.min(count - 1, Math.max(0, Math.round(progress.get() * (count - 1))));
      if (i === drawnRef.current && framesRef.current[i]) return;

      const bitmap = resolve(i);
      if (!bitmap) return;
      drawnRef.current = i;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Preserve the frame's aspect ratio rather than stretching it: "contain"
      // fits it inside the canvas, "cover" fills the canvas and crops.
      const scale =
        fit === "cover"
          ? Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height)
          : Math.min(canvas.width / bitmap.width, canvas.height / bitmap.height);
      const w = bitmap.width * scale;
      const h = bitmap.height * scale;
      ctx.drawImage(bitmap, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };

    const schedule = () => {
      if (rafRef.current === undefined) rafRef.current = requestAnimationFrame(draw);
    };

    const unsubscribe = progress.on("change", schedule);

    const onResize = () => {
      if (sizeCanvas()) schedule();
    };
    window.addEventListener("resize", onResize);

    // Decode order: the frames nearest the start first, so the hero is
    // scrubbable almost immediately, then everything else fills in behind.
    const load = async () => {
      const order = [
        ...Array.from({ length: Math.min(eager, count) }, (_, i) => i),
        ...Array.from({ length: count }, (_, i) => i).slice(eager),
      ];

      // Fetched by a pool rather than one at a time. Awaiting each frame
      // before starting the next means 150 sequential round-trips, which is
      // slow enough that scrubbing outruns the download and the character
      // stops part-way through assembling.
      let cursor = 0;
      let loaded = 0;
      let readyFired = false;

      const worker = async () => {
        while (!cancelled) {
          const slot = cursor++;
          if (slot >= order.length) return;
          const i = order[slot];
          try {
            const res = await fetch(srcFor(i));
            const bitmap = await createImageBitmap(await res.blob());
            if (cancelled) {
              bitmap.close();
              return;
            }
            framesRef.current[i] = bitmap;
          } catch {
            // A dropped frame degrades to the nearest neighbour via resolve().
          }
          loaded++;
          schedule();
          if (!readyFired && loaded >= Math.min(eager, count)) {
            readyFired = true;
            onReadyRef.current?.();
          }
        }
      };

      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    };
    void load();

    schedule();

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("resize", onResize);
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
      framesRef.current.forEach((f) => f?.close());
      framesRef.current = [];
    };
  }, [count, srcFor, progress, width, height, eager, fit]);

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
