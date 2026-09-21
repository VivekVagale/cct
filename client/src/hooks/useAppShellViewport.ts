import { useEffect, useState } from "react";

/**
 * Hold the document still, and report how much of it is actually visible.
 *
 * Both halves of this exist because most of this site's phone traffic arrives
 * through Instagram's in-app browser, which is a WKWebView rather than Safari.
 *
 * ── Holding it still ─────────────────────────────────────────────────────────
 *
 * `overscroll-behavior: none` on the root is the correct way to stop a
 * rubber-band, and WebKit has honoured it since iOS 16 — but an in-app browser
 * is whatever WebKit the host app was built against, and the bounce was reported
 * from one. The reliable lock in a WebView is older and blunter: fix the
 * document in place and let a box inside it do the scrolling. A fixed body has
 * no scroll to overscroll, so there is nothing to bounce, on every engine rather
 * than on the recent ones.
 *
 * ── Reporting what is visible ────────────────────────────────────────────────
 *
 * A fixed document brings its own problem, and it is the reason this was not
 * done first: on iOS the on-screen keyboard does not resize the layout viewport.
 * It covers it. A shell sized to `100dvh` is still 100dvh with a keyboard over
 * the bottom 300px of it, so the submit button and whatever field is being typed
 * into end up underneath the keyboard.
 *
 * `visualViewport` is the part that does shrink, and it is what the shell is
 * sized to here. The keyboard opens, the shell becomes the height of what is
 * left, the footer sits on top of the keyboard rather than behind it, and the
 * step's own scroller takes the remainder.
 *
 * Note this is not the same bug as `100vh` versus `100dvh`, which is about the
 * browser's own chrome. This is about the keyboard, and dvh does not answer it.
 *
 * Returns null where there is no visualViewport to ask — the caller falls back
 * to a CSS height, which is the behaviour that was there before.
 */
export interface AppShellViewport {
  /** Height of what is actually visible, keyboard subtracted. */
  height: number;
  /**
   * How far the visible region has been pushed down the layout viewport.
   *
   * The missing half of the story, and the one that put a black band under the
   * footer. iOS does not only shrink the visual viewport when the keyboard
   * opens — it scrolls it, so the focused field clears the keys. A `position:
   * fixed` shell is pinned to the *layout* viewport and does not move with it,
   * so it ends up drawn above the region the reader can see, with the body
   * showing through underneath.
   *
   * Almost always 0. It is not while a field near the bottom of a form has
   * focus, which is exactly when this shell is being typed into.
   */
  offsetTop: number;
}

export function useAppShellViewport() {
  const [viewport, setViewport] = useState<AppShellViewport | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const previous = {
      rootOverflow: root.style.overflow,
      rootOverscroll: root.style.overscrollBehavior,
      bodyPosition: body.style.position,
      bodyOverflow: body.style.overflow,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    /* The modern declaration and the old lock together: engines that honour the
       first never reach the second, and the ones that do not are held anyway. */
    body.style.position = "fixed";
    body.style.overflow = "hidden";
    body.style.width = "100%";
    body.style.height = "100%";
    body.style.overscrollBehavior = "none";

    const vv = window.visualViewport;
    const sync = () => {
      if (!vv) return;
      setViewport(previous =>
        previous &&
        previous.height === vv.height &&
        previous.offsetTop === vv.offsetTop
          ? previous
          : { height: vv.height, offsetTop: vv.offsetTop }
      );
    };
    sync();
    /* Three triggers, because no one of them is fired by every engine for every
       reason the visible height changes.

       visualViewport resize is the keyboard opening and closing, and is the one
       that matters most. Its scroll fires when a zoomed viewport is panned,
       which changes what is visible without resizing it. And window resize is
       the backstop: rotation and browser-chrome changes reliably fire it where
       the visualViewport events can be skipped — that was not theoretical, the
       shell stayed at 812 against a 500px viewport with only the first two
       bound.

       React bails out of a set to the same number, but this now sets an object,
       which is never equal to the last one — so the overlap would re-render on
       every event without the guard in `sync`. */
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);

    return () => {
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      root.style.overflow = previous.rootOverflow;
      root.style.overscrollBehavior = previous.rootOverscroll;
      body.style.position = previous.bodyPosition;
      body.style.overflow = previous.bodyOverflow;
      body.style.width = previous.bodyWidth;
      body.style.height = previous.bodyHeight;
      body.style.overscrollBehavior = previous.bodyOverscroll;
    };
  }, []);

  return viewport;
}
