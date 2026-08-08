import { useReducedMotion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { MASCOT_POSES } from "@/data/mascot";
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

/** The pass, in texture pixels. Portrait, at the proportions of a real one. */
const CARD_W = 640;
const CARD_H = 1024;

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
  const poseH = CARD_H * 0.44;
  const poseW = (mascot.width / mascot.height) * poseH;
  ctx.drawImage(mascot, (CARD_W - poseW) / 2, CARD_H * 0.06, poseW, poseH);

  const margin = 56;
  const textW = CARD_W - margin * 2;
  let y = CARD_H * 0.56;

  ctx.textAlign = "center";
  ctx.fillStyle = "#F5F7FA";
  ctx.font = "700 46px Inter, system-ui, sans-serif";
  for (const line of wrap(ctx, HEAD, textW)) {
    ctx.fillText(line, CARD_W / 2, y);
    y += 54;
  }

  y += 26;
  ctx.fillStyle = "#B8C4D6";
  ctx.font = "400 28px Inter, system-ui, sans-serif";
  for (const line of wrap(ctx, BODY, textW)) {
    ctx.fillText(line, CARD_W / 2, y);
    y += 38;
  }

  y += 26;
  ctx.fillStyle = "rgba(184, 196, 214, 0.65)";
  ctx.font = "400 23px Inter, system-ui, sans-serif";
  for (const line of wrap(ctx, FOLLOW, textW)) {
    ctx.fillText(line, CARD_W / 2, y);
    y += 31;
  }

  return canvas.toDataURL("image/png");
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

  useEffect(() => {
    if (reduceMotion) return;
    let live = true;
    void paintPass().then((url) => {
      if (live) setPass(url);
    });
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
    <div className="thankyou-scene">
      {/* Announced and searchable, while the pass is the thing on screen. */}
      <div role="status" className="sr-only">
        <p>{HEAD}</p>
        <p>{BODY}</p>
        <p>{FOLLOW}</p>
      </div>

      {/* Nothing while the scene loads. The card has already arrived as far as
          the reader is concerned — the announcement above fires on render — so a
          spinner here would be asking them to wait for the decoration. */}
      <Suspense fallback={null}>
        {pass && (
          <Lanyard
            position={[0, 0, 20]}
            gravity={[0, -40, 0]}
            frontImage={pass}
            backImage={pass}
            imageFit="contain"
          />
        )}
      </Suspense>
    </div>
  );
}
