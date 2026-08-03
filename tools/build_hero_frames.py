"""
Build the hero frame sequence from the 4K master.

Input:  the master render (branch `hero-src`, video/*.mp4)
Output: client/public/hero/f_XXXX.webp + manifest.json + heroSequence.ts

Run:
    python tools/build_hero_frames.py --video <path>/master.mp4

Requires a full ffmpeg. The one Playwright ships is a minimal build with no
H.264 decoder; `pip install imageio-ffmpeg` provides a complete static binary
and this script will find it automatically.

Why it works the way it does
----------------------------
Two earlier versions of this pipeline are worth knowing about, because the
problems they were built around no longer exist.

The *first* source was a render with a Gemini watermark and a backdrop that was
not black: it faded up from black into a static gradient (~8 at top-left, ~50
at top-right). Keying that needed a reconstructed clean plate and an absolute
per-pixel difference, because a single luminance threshold either missed most
of the backdrop or ate the black helmet. Even then the character's black
clothing was never convincingly separable from the backdrop, so the frames were
shipped opaque and the page's starfield was faded in over them instead.

The *current* source has neither problem. There is no watermark, and the
backdrop is a true black, which makes a much more direct matte available:

    the backdrop is the black *connected to the frame border*.

Black inside the silhouette -- the helmet, the visor, the clothing -- is not
reachable from the border, so it stays fully opaque. No threshold is ever drawn
between character and backdrop, which is why this leaves no fringing and no
frame-shaped rectangle where the older attempts did.

Everything outside the silhouette is cleared, including the render's faint
ambient haze. That haze covers about a third of each frame at an alpha of
0.06-0.16 -- too faint to see over a starfield, too large an area to encode.
Carrying it cost ~2.4x the frame size against ~1.8x without it, and the two
composite indistinguishably.

Resolution, and why it is not 1920
----------------------------------
The hero canvas is overscanned to 110% of the viewport and sized at
`rect * devicePixelRatio`, capped at 2. On a 1440px-wide retina laptop that is
~3170 device pixels filled from the frame, so a 1920-wide sequence is upscaled
1.65x and reads as soft -- which looks like compression but is not. 2560 brings
that to 1.24x.

Encoder quality is a separate axis and a much weaker one: the 1920 sequence
this replaces measured 41.8 dB PSNR against a clean encode of the same frame,
i.e. very nearly transparent already. Spending the bytes on quality rather than
resolution would have doubled the payload and fixed nothing you can see.

The matte is computed at the source's full 3840 and downsampled together with
the colour, so the alpha edge is antialiased by the resample rather than by a
blur applied after the fact.
"""

import argparse
import json
import os
import subprocess

import numpy as np
from PIL import Image
from scipy import ndimage

SRC_W, SRC_H = 3840, 2160

BACKDROP_MAX = 10    # a pixel at or below this is a backdrop candidate
ALPHA_FLOOR = 0.06   # below this, snap to clear so the empty field compresses
MIN_BLOB = 160       # drop specks smaller than this (40 at 1920, 4x the pixels)
FEATHER = 2.4        # px at 3840, so ~1.2px once resampled

# Floor on the unpremultiply divisor.
#
# The render is composited over black, so recovering straight alpha means
# dividing colour by coverage. Unclamped, that amplifies grain in the barely-
# covered pixels by up to 1/ALPHA_FLOOR -- invisible at those alphas, but
# exactly what WebP cannot predict, so it costs real bytes. This caps the gain
# at 4x.
UNPREMULT_MIN = 0.25


def ffmpeg_exe():
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def source_frame_count(video):
    """Count by decoding rather than trusting container metadata."""
    probe = subprocess.run(
        [ffmpeg_exe(), "-v", "error", "-i", video, "-map", "0:v:0",
         "-f", "rawvideo", "-pix_fmt", "gray", "-vf", "scale=2:2", "-"],
        capture_output=True,
    )
    return len(probe.stdout) // 4


def matte(rgb):
    """Solid inside the silhouette, feathered at its edge, clear outside."""
    dark = rgb.max(2) <= BACKDROP_MAX

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
    ap.add_argument("--video", required=True)
    ap.add_argument("--out", default="client/public/hero")
    ap.add_argument("--count", type=int, default=298, help="frames to emit")
    ap.add_argument("--width", type=int, default=2560)
    ap.add_argument("--quality", type=int, default=90)
    # WebP stores alpha losslessly by default, which on a silhouette this size
    # is the single largest line item in the frame.
    ap.add_argument("--alpha-quality", type=int, default=80)
    args = ap.parse_args()

    n_src = source_frame_count(args.video)
    if n_src < args.count:
        raise SystemExit(f"source has {n_src} frames, fewer than the {args.count} requested")

    # Even resample across the whole clip rather than a fixed integer step: the
    # source frame count is not a multiple of the output count.
    picks = {int(round(i * (n_src - 1) / (args.count - 1))): i for i in range(args.count)}
    print(f"{n_src} source frames -> {args.count} output frames at {args.width}w", flush=True)

    os.makedirs(args.out, exist_ok=True)
    stride = SRC_W * SRC_H * 3
    proc = subprocess.Popen(
        [ffmpeg_exe(), "-v", "error", "-i", args.video,
         "-pix_fmt", "rgb24", "-f", "rawvideo", "-"],
        stdout=subprocess.PIPE, bufsize=stride,
    )

    total = 0
    height = None
    n = 0
    while True:
        buf = proc.stdout.read(stride)
        if len(buf) < stride:
            break
        if n in picks:
            i = picks[n]
            rgb = np.frombuffer(buf, np.uint8).reshape(SRC_H, SRC_W, 3).astype(np.float32)
            a = matte(rgb)
            colour = np.clip(rgb / np.maximum(a, UNPREMULT_MIN)[..., None], 0, 255)
            # Clear pixels carry no colour anyone can see, so flatten them to
            # black rather than leaving amplified noise for the encoder.
            colour[a <= 0.0] = 0.0
            im = Image.fromarray(np.dstack([colour, a * 255.0]).astype(np.uint8), "RGBA")
            if args.width != im.width:
                im = im.resize(
                    (args.width, round(im.height * args.width / im.width)), Image.LANCZOS)
            height = im.height
            path = os.path.join(args.out, f"f_{i:04d}.webp")
            im.save(path, "WEBP", quality=args.quality, method=6,
                    alpha_quality=args.alpha_quality)
            total += os.path.getsize(path)
            if i % 25 == 0:
                print(f"  {i}/{args.count}", flush=True)
        n += 1
    proc.stdout.close()
    proc.wait()

    manifest = {
        "count": args.count,
        "width": args.width,
        "height": height,
        "pattern": "f_{i}.webp",
        "sourceFrames": n_src,
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
                f"  count: {args.count},\n"
                f"  width: {args.width},\n"
                f"  height: {height},\n"
                '  srcFor: (i: number) => `/hero/f_${String(i).padStart(4, "0")}.webp`,\n'
                "} as const;\n"
            )
        print(f"wrote {ts}")

    print(f"wrote {args.count} frames, {total/1e6:.2f} MB total "
          f"({total/args.count/1024:.1f} KB avg), {args.width}x{height}")


if __name__ == "__main__":
    main()
