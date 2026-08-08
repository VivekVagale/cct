import { useReducedMotion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { MASCOT_POSES } from "@/data/mascot";
import { Loader } from "./Loader";
/* The same module specifier Lanyard.tsx uses, so this is the same URL and the
   same cache entry — importing it here warms the fetch without duplicating the
   asset. */
import cardGLB from "./card.glb";
import "./ThankYouCard.css";

/*
 * The lanyard is loaded on demand, and this is not optional.
 *
 * It pulls a physics engine, a mesh-line library and a 2.4MB model, none of
 * which any visitor needs until they have actually sent a booking — which is
 * once, at the end, if at all. Imported normally it would be in the bundle every
 * visitor downloads before the hero's first frame.
 */
const Lanyard = lazy(() => import("./Lanyard"));

/** The confirmation, in one place. Drawn onto the pass and read out below it. */
const HEAD = "Thank you for booking!";
const BODY =
  "We'll reply on your Instagram handle, or on WhatsApp. Double-check you left the right handle and number.";
const FOLLOW =
  "Follow @coldchaintheory so our reply reaches you instead of sitting in your message requests.";

/*
 * The pass, in texture pixels, at the proportions of the face it is painted on.
 *
 * The ratio is the point. `contain` fits the image inside the face and leaves
 * the model's own texture showing around it — which is the pale frame the pass
 * had down its sides. `cover` fills the face and crops whatever does not fit, so
 * the closer this is to the real thing the less there is to crop. The margins
 * below are the rest of the answer: nothing is drawn near an edge that a few
 * per cent of crop could reach.
 */
const CARD_W = 720;
const CARD_H = 1040;

/** Wrap `text` to `width`, returning the lines. Canvas has no text box. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Paint the pass: the mascot over the message, as one image.
 *
 * The card's faces are textures, so anything that appears on the pass has to be
 * drawn rather than laid out — there is no DOM on a mesh. Drawn here at runtime
 * rather than committed as a PNG so the words stay in this file, where they can
 * be edited, reviewed in a diff and kept in step with the copy read out below.
 *
 * Returns null if the mascot cannot be loaded, which leaves the card wearing its
 * own texture rather than a half-drawn one.
 */
async function paintPass(): Promise<string | null> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const mascot = new Image();
  mascot.crossOrigin = "anonymous";
  mascot.src = MASCOT_POSES.thankYou;
  try {
    await mascot.decode();
  } catch {
    return null;
  }

  /* The page's own faces, once they are actually available — a canvas asked for
     a font it does not have yet silently draws the fallback, and unlike the DOM
     it never redraws when the real one arrives. */
  try {
    await document.fonts.ready;
  } catch {
    /* No font loading API. The stack below still resolves to something. */
  }

  ctx.fillStyle = "#05070A";
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  /* A violet wash behind the pose, so the pass reads as the site's and not as a
     black rectangle with a figure on it. */
  const wash = ctx.createLinearGradient(0, 0, 0, CARD_H);
  wash.addColorStop(0, "rgba(122, 68, 224, 0.35)");
  wash.addColorStop(0.55, "rgba(5, 7, 10, 0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  /* Contained, not cropped: the pose is the subject and a pass that cuts its
     head off is worse than one with space around it. */
  const poseH = CARD_H * 0.4;
  const poseW = (mascot.width / mascot.height) * poseH;
  ctx.drawImage(mascot, (CARD_W - poseW) / 2, CARD_H * 0.05, poseW, poseH);

  /* Generous, because `cover` crops from the edges and because this is read at
     whatever size a swinging card happens to present. */
  const margin = 64;
  const textW = CARD_W - margin * 2;
  /*
   * Where the type starts, and it is the number that decides whether the last
   * line survives.
   *
   * Nothing here reflows: `fillText` draws at a baseline and a baseline past the
   * bottom of the canvas is simply not drawn. At 0.54 the block ran to about
   * 1,082 on a 1,040 canvas, so the follow line lost its last row — and `cover`
   * crops a little more off the edges on top of that. Starting at 0.46 with
   * tighter leading ends it around 976, which leaves a margin the crop cannot
   * reach.
   *
   * Changing the copy changes this. Anything longer wants a smaller start, or
   * fewer words.
   */
  let y = CARD_H * 0.46;

  ctx.textAlign = "center";
  ctx.fillStyle = "#F5F7FA";
  ctx.font = "700 62px Inter, system-ui, sans-serif";
  for (const line of wrap(ctx, HEAD, textW)) {
    ctx.fillText(line, CARD_W / 2, y);
    y += 72;
  }

  y += 24;
  ctx.fillStyle = "#D5DEEA";
  ctx.font = "400 38px Inter, system-ui, sans-serif";
  for (const line of wrap(ctx, BODY, textW)) {
    ctx.fillText(line, CARD_W / 2, y);
    y += 48;
  }

  y += 24;
  ctx.fillStyle = "rgba(184, 196, 214, 0.8)";
  ctx.font = "400 30px Inter, system-ui, sans-serif";
  for (const line of wrap(ctx, FOLLOW, textW)) {
    ctx.fillText(line, CARD_W / 2, y);
    y += 38;
  }

  return canvas.toDataURL("image/png");
}

/*
 * The painted pass, kept once it exists.
 *
 * Painting it costs a decode, a font wait and a canvas readback, and the result
 * never changes — so it is done once and held, whether it was started by the
 * submit button or by this component mounting.
 */
let passCache: Promise<string | null> | null = null;

function getPass() {
  passCache ??= paintPass();
  return passCache;
}

/*
 * The model, pulled into the browser's cache before the scene asks for it.
 *
 * Rendering the lanyard is not the end of the wait — it mounts, then fetches
 * 2.4MB, and the screen is empty for all of it. Fetching it here means the
 * loader is still up while that happens and the scene has the bytes in hand the
 * moment it is allowed to draw.
 */
let modelCache: Promise<void> | null = null;

function warmModel() {
  modelCache ??= fetch(cardGLB)
    .then((response) => response.arrayBuffer())
    .then(() => undefined)
    /* A failed warm is not a failed scene: three will ask for it again, and the
       loader has already done its job by then. */
    .catch(() => undefined);
  return modelCache;
}

/**
 * Start everything the confirmation needs, while the request is still in flight.
 *
 * Called from the submit handler. Without it the sequence is: the insert
 * returns, then a 3MB chunk is fetched, then a model is parsed, then the pass is
 * painted — and only then does anything appear, which reads as the button
 * having done nothing. Started at the click, all of that happens against the
 * network round trip and the scene is ready when the answer is.
 *
 * Deliberately not awaited and deliberately silent. It is a head start, not a
 * step: if it fails the component will simply do the work itself on mount.
 */
export function preloadThankYou() {
  void import("./Lanyard");
  void getPass();
  void warmModel();
}

/**
 * What replaces the form once a request is in.
 *
 * A pass on a lanyard: the band hangs from the top of the screen and the card
 * settles in the middle, carrying the mascot and the message. It can be picked
 * up and thrown. This is the one moment on the site with nothing else to do,
 * which is what makes it the right place for the most expensive thing on it.
 *
 * The message exists twice, and it has to. On the pass it is pixels — a texture
 * on a mesh, which cannot be selected, read aloud, translated or found. So the
 * same words are also in the document, visually hidden and carrying
 * `role="status"`, which is what actually announces the confirmation to a screen
 * reader. Both are drawn from the constants above, so they cannot drift.
 *
 * Under reduced motion there is no lanyard and the message is plain text on the
 * page. It is a swinging object with momentum; there is no gentler version of
 * it, and a confirmation does not need one to be read.
 */
export function ThankYouCard() {
  const reduceMotion = useReducedMotion();
  const [pass, setPass] = useState<string | null>(null);
  const [scene, setScene] = useState<HTMLDivElement | null>(null);
  /*
   * Whether the lanyard is actually on screen, which is when the loader stops.
   *
   * Not when the pass is painted, and not when the scene's module arrives:
   * those both happen a beat before React mounts the canvas, and measured, that
   * beat is a blank screen with the loader already gone. The canvas element
   * appearing is the first moment there is something to look at, so that is
   * what is watched — a mutation observer rather than a timer, because the
   * duration is a download and a parse on someone else's machine.
   */
  const [sceneUp, setSceneUp] = useState(false);

  useEffect(() => {
    if (!scene || sceneUp) return;
    if (scene.querySelector("canvas")) {
      setSceneUp(true);
      return;
    }
    const observer = new MutationObserver(() => {
      if (scene.querySelector("canvas")) setSceneUp(true);
    });
    observer.observe(scene, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [scene, sceneUp]);

  /*
   * Everything the scene needs, waited on together.
   *
   * The loader has to come down when the lanyard appears, not when this
   * component decides to render one — and those are different moments. The pass
   * has to be painted, the scene's 3MB chunk has to arrive, and the 2.4MB model
   * has to be fetched; render before any of them and the screen is blank again
   * behind a loader that has already gone. Waiting on all three leaves three.js
   * with a parse to do and nothing to download.
   */
  useEffect(() => {
    if (reduceMotion) return;
    let live = true;
    void Promise.all([getPass(), import("./Lanyard"), warmModel()]).then(
      ([url]) => {
        if (live) setPass(url);
      },
    );
    return () => {
      live = false;
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <div role="status" className="thankyou-plain">
        <p className="thankyou-plain__head">{HEAD}</p>
        <p>{BODY}</p>
        <p className="thankyou-plain__small">{FOLLOW}</p>
      </div>
    );
  }

  return (
    <div className="thankyou-scene" ref={setScene}>
      {/* Announced and searchable, while the pass is the thing on screen. */}
      <div role="status" className="sr-only">
        <p>{HEAD}</p>
        <p>{BODY}</p>
        <p>{FOLLOW}</p>
      </div>

      {/* The wait, shown.

          This was deliberately empty once, on the reasoning that the
          confirmation had already arrived and a spinner would be asking the
          reader to wait for decoration. That was wrong about what is on screen:
          the form is gone, the scene is a full viewport of nothing, and several
          megabytes are in flight. An empty screen after a submit reads as a
          failure, whatever the markup says. */}
      {!sceneUp && (
        <div className="thankyou-loading">
          <Loader />
        </div>
      )}

      <Suspense fallback={null}>
        {pass && (
          /* Closer than the component's own default, because this pass has to be
             read rather than admired — at 20 the card was a thumbnail in the
             middle of a large dark screen and the message on it was too small to
             take in.

             `cover` rather than `contain`: contain fits the image inside the
             face and leaves the model's own texture showing around it, which is
             the pale frame the pass had down its sides. */
          <Lanyard
            position={[0, 0, 13]}
            gravity={[0, -40, 0]}
            frontImage={pass}
            backImage={pass}
            imageFit="cover"
          />
        )}
      </Suspense>
    </div>
  );
}
