import { useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";

/** Parallel frame fetches. Enough to saturate the connection, few enough
 *  not to starve the eager window at the front of the sequence. */
const CONCURRENCY = 8;

/**
 * How much decoded pixel data may be alive at once.
 *
 * An ImageBitmap is uncompressed: at 2560x1440 that is 14.75 MB a frame, so
 * holding all 298 — which this used to do — cost 4.4 GB. Measured, the page
 * went from 686 MB at launch to 5,195 MB once the sequence had loaded. Desktop
 * absorbs that; a phone kills the tab long before it, and it is very likely
 * what was killing headless renderers mid-screenshot.
 *
 * So frames are decoded in a window that travels with the scrub, and the budget
 * is expressed in bytes rather than in frames: the same number has to hold for
 * a 2560x1440 landscape frame and a 900x1600 portrait one, and those differ by
 * 2.6x. The window falls out of the frame size instead of being retuned by hand
 * every time the sequence is rebuilt.
 */
const DEFAULT_DECODED_BUDGET_BYTES = 500 * 1024 * 1024;
/** Enough either side of the cursor to survive a fast flick; capped so a small
 *  frame size cannot make the window pointlessly large. */
const MIN_WINDOW = 24;
const MAX_WINDOW = 96;

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
  /**
   * Ceiling on decoded pixel data, in bytes. Phones want a far lower one than
   * desktops: the tab is killed at a fraction of the memory, and the budget is
   * what the decode window is sized from.
   */
  budgetBytes?: number;
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
 * Frames are decoded to ImageBitmaps. An ImageBitmap is already in GPU-ready
 * form, so drawImage is a blit rather than a decode, which is what keeps this
 * at 60fps where <img> would stutter on first paint of each frame.
 *
 * Two tiers of storage, because those bitmaps are enormous. Every frame is held
 * as its compressed blob — the whole sequence is 40 MB that way, which is
 * nothing — and only a travelling window of them is decoded, sized from
 * `budgetBytes`. Evicted frames are re-decoded from the retained blob, so a
 * window miss costs a decode and never a network round trip.
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
  budgetBytes = DEFAULT_DECODED_BUDGET_BYTES,
}: ScrollImageSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(ImageBitmap | null)[]>([]);
  const blobsRef = useRef<(Blob | null)[]>([]);
  const decodingRef = useRef<Set<number>>(new Set());
  const cursorRef = useRef(0);
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
    blobsRef.current = new Array(count).fill(null);
    decodingRef.current = new Set();

    // How many frames may stay decoded, from the byte budget and this
    // sequence's own frame size. Halved either side of the cursor below.
    const windowSize = Math.max(
      MIN_WINDOW,
      Math.min(MAX_WINDOW, Math.floor(budgetBytes / (width * height * 4))),
    );
    const halfWindow = Math.ceil(windowSize / 2);

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

    /** Decode a retained blob back into the window. */
    const decode = async (i: number) => {
      const blob = blobsRef.current[i];
      if (!blob || framesRef.current[i] || decodingRef.current.has(i)) return;
      decodingRef.current.add(i);
      try {
        const bitmap = await createImageBitmap(blob);
        if (cancelled) {
          bitmap.close();
          return;
        }
        // Kept even if the cursor has travelled out of range meanwhile. Work
        // already paid for is worth more as a fallback than as a discard, and
        // the budget is enforced in one place — evictIfOverBudget — rather than
        // being second-guessed here.
        framesRef.current[i] = bitmap;
        schedule();
      } catch {
        // Leave it undecoded; resolve() falls back to a neighbour.
      } finally {
        decodingRef.current.delete(i);
      }
    };

    /**
     * Drop frames only when there are more decoded than the budget allows, and
     * drop the ones furthest from the cursor first.
     *
     * Evicting purely by distance instead — anything outside the window, always
     * — looked equivalent and was much worse. When the loader is behind, which
     * is exactly when the visitor jumps somewhere new, nothing near the cursor
     * has arrived yet, so distance-eviction throws away every frame it has and
     * leaves the hero with nothing decoded at all: no frame to draw and none for
     * resolve() to fall back to. Measured at zero live frames across most of
     * the scrub. Being under budget is the only reason to keep nothing.
     */
    const evictIfOverBudget = (i: number) => {
      const frames = framesRef.current;
      const live: number[] = [];
      for (let j = 0; j < count; j++) if (frames[j]) live.push(j);
      if (live.length <= windowSize) return;

      live.sort((a, b) => Math.abs(b - i) - Math.abs(a - i));
      let excess = live.length - windowSize;
      for (const j of live) {
        if (excess <= 0) break;
        if (j === drawnRef.current || j === i) continue;
        frames[j]!.close();
        frames[j] = null;
        excess--;
      }
    };

    /** Pull in what is missing around the cursor, then trim to the budget. */
    const reconcileWindow = (i: number) => {
      // Nearest-first, so the frames about to be scrubbed through arrive first.
      for (let d = 0; d <= halfWindow; d++) {
        if (i + d < count) void decode(i + d);
        if (d && i - d >= 0) void decode(i - d);
      }
      evictIfOverBudget(i);
    };

    const draw = () => {
      rafRef.current = undefined;
      const i = Math.min(count - 1, Math.max(0, Math.round(progress.get() * (count - 1))));
      cursorRef.current = i;
      reconcileWindow(i);
      if (i === drawnRef.current && framesRef.current[i]) return;

      // Distinguish the frame that was asked for from a stand-in. Marking a
      // fallback as drawn would satisfy the check above once the real frame
      // finally decoded, so the correct frame would never replace the
      // approximation — the sequence would silently stick on whichever
      // neighbour happened to be decoded first.
      const exact = framesRef.current[i];
      const bitmap = exact ?? resolve(i);
      if (!bitmap) return;
      drawnRef.current = exact ? i : -1;

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

    /**
     * Fetch order follows the scrub rather than running 0..n.
     *
     * A fixed order and a windowed decoder do not mix. Land deep in the page —
     * a reload partway down, or an anchor jump — and the loader is still
     * walking up from frame 0, while the decoder will only decode near the
     * cursor. Nothing near the cursor has been fetched, so there is nothing to
     * decode and nothing to fall back to, and the hero renders empty until the
     * loader crawls all the way there. This picks the nearest unfetched frame
     * to wherever the visitor actually is, and spreads outward from there.
     */
    const claimed = new Set<number>();
    const nextIndex = () => {
      const c = cursorRef.current;
      for (let d = 0; d < count; d++) {
        const ahead = c + d;
        if (ahead < count && !blobsRef.current[ahead] && !claimed.has(ahead)) return ahead;
        const behind = c - d;
        if (d && behind >= 0 && !blobsRef.current[behind] && !claimed.has(behind)) return behind;
      }
      return -1;
    };

    const load = async () => {
      // Fetched by a pool rather than one at a time. Awaiting each frame
      // before starting the next means hundreds of sequential round-trips,
      // slow enough that scrubbing outruns the download and the character
      // stops part-way through assembling.
      let loaded = 0;
      let readyFired = false;

      const worker = async () => {
        while (!cancelled) {
          const i = nextIndex();
          if (i < 0) return;
          claimed.add(i);
          try {
            const res = await fetch(srcFor(i));
            const blob = await res.blob();
            if (cancelled) return;
            // Every frame is kept compressed — cheap, and it means eviction
            // never costs a round trip. Decoding is deliberately not done here:
            // it belongs to reconcileWindow, which knows where the cursor is.
            //
            // This worker used to await the decode. That coupled network
            // throughput to decode throughput, and a 2560x1440 WebP is slow
            // enough to decode that eight workers spent their time decoding
            // rather than fetching — 16 frames in 12 seconds, none of them near
            // a cursor that had moved. The hero rendered empty.
            blobsRef.current[i] = blob;
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
      blobsRef.current = [];
      decodingRef.current.clear();
    };
  }, [count, srcFor, progress, width, height, eager, fit, budgetBytes]);

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
