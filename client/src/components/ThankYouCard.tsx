import { MASCOT_POSES } from "@/data/mascot";
/* The same module specifier Lanyard.tsx uses, so this is the same URL and the
   same cache entry — importing it here warms the fetch without duplicating the
   asset. */
import cardGLB from "./card.glb";
import "./ThankYouCard.css";

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
  /*
   * The load event, not `decode()`.
   *
   * `decode()` is the tidier call and it does not resolve while the page is
   * hidden — the browser has no reason to decode a picture nobody is looking
   * at. Submit the form, switch tabs while it saves, and the confirmation is
   * still waiting on that promise when you come back. `load` fires either way,
   * and `drawImage` decodes when it needs to.
   */
  try {
    await new Promise<void>((resolve, reject) => {
      if (mascot.complete && mascot.naturalWidth > 0) return resolve();
      mascot.onload = () => resolve();
      mascot.onerror = () => reject(new Error("mascot failed to load"));
    });
  } catch {
    return null;
  }

  /* The page's own faces, once they are actually available — a canvas asked for
     a font it does not have yet silently draws the fallback, and unlike the DOM
     it never redraws when the real one arrives.

     Capped, because this is the last thing between a booking and its
     confirmation. A face that has not arrived in two seconds is not worth
     holding the card back for; the stack falls through to something readable. */
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
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

export function getPass() {
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

export function warmModel() {
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
 * What replaces the form once a request is in: the words.
 *
 * It used to be the words and the pass together, the scene taking the height of
 * this section. The pass hangs from the nav bar now and stays there for the
 * rest of the visit -- see `PersistentLanyard`, which owns the scene, the
 * model and the painted texture. The two are drawn from the constants above,
 * so the object and the message cannot drift apart.
 *
 * What is left is better than what it replaced in one respect that was not the
 * point of the change. The scene took several megabytes to say anything at all,
 * so the confirmation used to arrive behind a loader; these are three
 * paragraphs and they are on screen in the frame the insert returns.
 *
 * `role="status"` rather than an alert: the reader asked for this by pressing
 * the button and the page has already moved to it, so it wants announcing, not
 * interrupting.
 */
export function ThankYouCard() {
  return (
    <div role="status" className="thankyou-plain">
      <p className="thankyou-plain__head">{HEAD}</p>
      <p>{BODY}</p>
      <p className="thankyou-plain__small">{FOLLOW}</p>
    </div>
  );
}
