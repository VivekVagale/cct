"""
Build the transparent hero frame sequence used by the scroll-driven Hero.

Input:  the black-background render frames (branch `hero-src`, frames/*.jpg)
Output: client/public/hero/f_XXXX.webp + manifest.json

Run:
    python tools/build_hero_frames.py --frames <dir>/*.jpg --out client/public/hero

Why it works the way it does
----------------------------
The render has two things that have to come off: a Gemini watermark in the
bottom-right corner, and the black backdrop.

The watermark cannot be cleared with a fixed rectangle. Voxel cubes drift
through that corner on ~9% of frames, so a rectangle would punch holes in
them and pop visibly in motion. Instead its exact footprint is derived --
it is the only thing bright in *every* frame, because cubes move and it does
not -- and those pixels are repaired from their nearest neighbours *before*
keying. The repair then inherits whatever was behind it: backdrop repairs to
backdrop and keys out, a cube underneath repairs to cube colour and stays.

The backdrop is not black. It fades up from black over the first ~20% of the
clip into a static gradient (~8 at top-left, ~50 at top-right). A single
luminance threshold either misses most of it or eats the black helmet, so
instead the gradient is reconstructed as a clean plate from the steady-state
frames, scaled per frame to follow the fade, and matched by *absolute*
difference. Absolute matters: the helmet reads as foreground by being darker
than the backdrop, not brighter.
"""

import argparse
import glob
import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

STATIC_BRIGHT = 60   # a pixel bright in every frame is watermark, not content
PLATE_FROM = 0.25    # ignore the fade-in when building the clean plate
MATTE_LO = 14        # |frame - plate| below this is backdrop
MATTE_HI = 32        # and above this is fully foreground
MIN_BLOB = 40        # drop surviving specks smaller than this


def watermark_mask(paths, pad=4):
    mn = None
    for p in paths[::5]:
        l = np.asarray(Image.open(p).convert("RGB")).max(2)
        mn = l if mn is None else np.minimum(mn, l)
    ys, xs = np.where(mn > STATIC_BRIGHT)
    mask = np.zeros(mn.shape, bool)
    if len(xs):
        mask[ys.min() - pad:ys.max() + pad + 1, xs.min() - pad:xs.max() + pad + 1] = True
    return mask, (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())) if len(xs) else None


def make_repair(mask):
    _, (iy, ix) = ndimage.distance_transform_edt(mask, return_indices=True)

    def repair(rgb):
        rgb = rgb.copy()
        rgb[mask] = rgb[iy[mask], ix[mask]]
        return rgb

    return repair


def build_plate(paths, repair):
    acc = None
    # Every third steady-state frame is plenty: the plate is a per-pixel
    # minimum, and content has long since moved on three frames later.
    for p in paths[int(len(paths) * PLATE_FROM)::3]:
        a = repair(np.asarray(Image.open(p).convert("RGB")).astype(np.float32))
        acc = a if acc is None else np.minimum(acc, a)
    return ndimage.gaussian_filter(acc, 3)


def matte(rgb, plate):
    lit = plate.max(2) > 6
    scale = min(float(np.median(rgb.max(2)[lit] / np.maximum(plate.max(2)[lit], 1e-3))), 1.0)
    d = np.abs(rgb - plate * scale).max(2)

    a = np.clip((d - MATTE_LO) / float(MATTE_HI - MATTE_LO), 0.0, 1.0)
    a = np.maximum(a, ndimage.binary_fill_holes(a > 0.5).astype(np.float32))

    labels, n = ndimage.label(a > 0.15)
    if n:
        sizes = np.bincount(labels.ravel())
        a[np.isin(labels, np.where(sizes < MIN_BLOB)[0]) & (labels > 0)] = 0.0
    return ndimage.gaussian_filter(a, 0.6)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--frames", required=True, help="glob for source frames")
    ap.add_argument("--out", required=True)
    ap.add_argument("--step", type=int, default=2, help="keep every Nth frame")
    # 960 rather than the source's 1280: the hero is a full-bleed canvas, so
    # the frames are resampled anyway, and 150 of them at 1280 came to 11 MB.
    ap.add_argument("--width", type=int, default=960)
    ap.add_argument("--quality", type=int, default=80)
    args = ap.parse_args()

    paths = sorted(glob.glob(args.frames))
    if not paths:
        raise SystemExit(f"no frames matched {args.frames}")

    mask, box = watermark_mask(paths)
    repair = make_repair(mask)
    print(f"{len(paths)} source frames; watermark at {box}")

    plate = build_plate(paths, repair)
    print(f"clean plate built, peak luma {plate.max():.1f}")

    os.makedirs(args.out, exist_ok=True)
    kept = paths[::args.step]
    total = 0
    for i, p in enumerate(kept):
        rgb = repair(np.asarray(Image.open(p).convert("RGB")).astype(np.float32))
        a = matte(rgb, plate)
        # Undo the darkening that partial-coverage pixels picked up from being
        # composited over black, so no grey halo forms over the galaxy.
        rgba = np.dstack([np.clip(rgb / np.maximum(a, 1e-3)[..., None], 0, 255),
                          a * 255.0]).astype(np.uint8)
        im = Image.fromarray(rgba, "RGBA")
        if args.width != im.width:
            im = im.resize((args.width, round(im.height * args.width / im.width)), Image.LANCZOS)
        f = os.path.join(args.out, f"f_{i:04d}.webp")
        im.save(f, "WEBP", quality=args.quality, method=6)
        total += os.path.getsize(f)

    manifest = {
        "count": len(kept),
        "width": args.width,
        "height": im.height,
        "pattern": "f_{i}.webp",
        "sourceFrames": len(paths),
        "step": args.step,
    }
    with open(os.path.join(args.out, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    # Emit the same numbers as a typed module so the Hero cannot fall out of
    # sync with whatever this script last produced.
    ts = os.path.join("client", "src", "data", "heroSequence.ts")
    if os.path.isdir(os.path.dirname(ts)):
        with open(ts, "w") as f:
            f.write(
                "// Generated by tools/build_hero_frames.py — do not edit by hand.\n"
                "export const HERO_SEQUENCE = {\n"
                f"  count: {len(kept)},\n"
                f"  width: {args.width},\n"
                f"  height: {im.height},\n"
                '  srcFor: (i: number) => `/hero/f_${String(i).padStart(4, "0")}.webp`,\n'
                "} as const;\n"
            )
        print(f"wrote {ts}")

    print(f"wrote {len(kept)} frames, {total/1e6:.2f} MB total "
          f"({total/len(kept)/1024:.1f} KB avg), {args.width}x{im.height}")


if __name__ == "__main__":
    main()
