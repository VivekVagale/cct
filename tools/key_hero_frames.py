"""
Key the black backdrop out of the built hero frames, in place.

Run:
    python tools/key_hero_frames.py --dir client/public/hero

Why this exists separately from build_hero_frames.py
-----------------------------------------------------
build_hero_frames.py keys by reconstructing a clean *plate* and matching each
frame against it by absolute difference. That was built for the original
render, whose backdrop was not black: it faded up from black into a static
gradient (~8 at top-left, ~50 at top-right), so a luminance threshold either
missed most of the backdrop or ate the helmet. The plate handled that, but it
never keyed the character's black clothing convincingly, which is why the
frames were ultimately shipped opaque under --keep-background.

The 4K source that replaced it does not have that problem. Its backdrop is a
true black -- the first frame is all zeros, and the frame borders stay at 0-1
until the glow reaches them -- which makes a much more direct matte available:

    the backdrop is the black that is *connected to the frame border*.

Black inside the silhouette -- the helmet, the visor, the clothing -- is not
reachable from the border, so it stays fully opaque. That is the distinction
the plate method could not draw, and it is what makes keying viable here where
it was not before. No thresholding of the character against the backdrop is
involved, so there is no fringing and no frame-shaped rectangle.

Outside the silhouette the ambient glow keeps a luminance-proportional alpha,
so it composites over the starfield as light rather than being clipped to a
hard silhouette edge.

This runs over the built frames rather than the source render because they are
already the finished 1920x1080 output -- watermark repaired, frame step
applied. Deriving the matte from them costs one re-encode and avoids having to
reproduce the extraction from the 4K master exactly.
"""

import argparse
import glob
import os

import numpy as np
from PIL import Image
from scipy import ndimage

BACKDROP_MAX = 10   # a pixel at or below this is a backdrop candidate
ALPHA_FLOOR = 0.06  # below this, snap to clear so the empty field compresses
MIN_BLOB = 40       # drop surviving specks smaller than this
FEATHER = 1.2       # px, so the silhouette does not alias against the stars

# Floor on the unpremultiply divisor.
#
# The frames are composited over black, so recovering straight alpha means
# dividing colour by coverage. Done unclamped that amplifies grain in the
# barely-covered pixels by up to 1/ALPHA_FLOOR, turning a nearly-flat field
# into high-frequency noise -- invisible at those alphas, but exactly what
# WebP cannot predict, so it costs real bytes. Clamping caps the gain at 4x.
UNPREMULT_MIN = 0.25

# Everything outside the silhouette is cleared outright, including the render's
# faint ambient haze.
#
# That haze covers about a third of each frame at an alpha of 0.06-0.16, which
# is far too low to see over a starfield and far too large an area to encode --
# carrying it cost ~2.4x the frame size against ~1.8x without it. Composited
# side by side the two are indistinguishable, so it goes.



def matte(rgb):
    """Solid inside the silhouette, feathered at its edge, clear outside."""
    dark = rgb.max(2) <= BACKDROP_MAX

    # The backdrop is the dark region reachable from the frame border. Dark
    # pixels not reachable from it are interior -- black clothing, the visor --
    # and must stay solid.
    labels, _ = ndimage.label(dark)
    edge = np.unique(np.concatenate([labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]]))
    inside = ndimage.binary_fill_holes(~np.isin(labels, edge[edge != 0]))

    a = inside.astype(np.float32)
    labels, n = ndimage.label(a > 0.5)
    if n:
        sizes = np.bincount(labels.ravel())
        a[np.isin(labels, np.where(sizes < MIN_BLOB)[0]) & (labels > 0)] = 0.0

    a = ndimage.gaussian_filter(a, FEATHER)
    a[a < ALPHA_FLOOR] = 0.0
    return np.clip(a, 0.0, 1.0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default="client/public/hero")
    ap.add_argument("--quality", type=int, default=80)
    # WebP stores alpha losslessly by default, which on a 1920-wide silhouette
    # is the single largest line item in the frame. Lossy alpha at 60 halves it
    # with no edge artefact you can find at playback scale.
    ap.add_argument("--alpha-quality", type=int, default=60)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    paths = sorted(glob.glob(os.path.join(args.dir, "f_*.webp")))
    if not paths:
        raise SystemExit(f"no frames in {args.dir}")

    before = sum(os.path.getsize(p) for p in paths)
    after = 0
    for p in paths:
        src = Image.open(p)
        if src.mode == "RGBA":
            raise SystemExit(f"{p} already has an alpha channel; nothing to do")
        rgb = np.asarray(src.convert("RGB")).astype(np.float32)
        a = matte(rgb)
        # Undo the darkening partial-coverage pixels picked up from being
        # composited over black, so no grey halo forms at the silhouette edge.
        colour = np.clip(rgb / np.maximum(a, UNPREMULT_MIN)[..., None], 0, 255)
        # Clear pixels carry no colour anyone can see, so flatten them to black
        # rather than leaving amplified noise for the encoder to chew on.
        colour[a <= 0.0] = 0.0
        rgba = np.dstack([colour, a * 255.0]).astype(np.uint8)
        if not args.dry_run:
            Image.fromarray(rgba, "RGBA").save(
                p, "WEBP", quality=args.quality, method=4,
                alpha_quality=args.alpha_quality,
            )
        after += os.path.getsize(p)

    print(f"{len(paths)} frames: {before/1e6:.2f} MB -> {after/1e6:.2f} MB")


if __name__ == "__main__":
    main()
