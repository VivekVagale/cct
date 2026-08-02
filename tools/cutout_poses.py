"""
Cut mascot poses out of their black backgrounds.

Run:
    python tools/cutout_poses.py "<src>/*.png" --out client/public/mascot

Why not a brightness threshold
------------------------------
The mascot wears a black helmet and black gloves, and several poses hold black
props -- a clapperboard, a laptop, a CCT cover cloth. Anything keyed on "this
pixel is dark" deletes those along with the backdrop.

So the backdrop is identified by connectivity instead: flood inward from the
frame border through pure black only. Black that belongs to the character is
not reachable from the border and survives.

That alone is not enough, because a prop's black often runs continuously into
the backdrop with no edge between them -- where both are literally (0,0,0)
there is no information separating them, and the flood leaks in. Filling
enclosed holes afterwards recovers those regions: a prop surrounded by the
character's silhouette comes back solid even where the flood reached it.

What this cannot fix is a black prop that touches the frame border, since it is
genuinely continuous with the backdrop there. Poses are reported with their
border contact so those cases are visible rather than silent. The real fix for
one of those is a re-export with a real alpha channel.
"""

import argparse
import glob
import os
import re

import numpy as np
from PIL import Image
from scipy import ndimage

BG_MAX = 1        # backdrop renders as exact black; keep this tight
CLOSE = 5         # px, seals hairline gaps before holes are filled
FEATHER = 0.8


def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", os.path.splitext(name)[0].lower()).strip("-")


def cutout(rgb):
    luma = rgb.max(axis=2)

    labels, n = ndimage.label(luma <= BG_MAX)
    if n == 0:
        return np.ones(luma.shape, np.float32), 0.0
    border = np.concatenate([labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])
    bg_labels = np.unique(border)
    background = np.isin(labels, bg_labels[bg_labels != 0])

    solid = ~background
    solid = ndimage.binary_closing(solid, np.ones((CLOSE, CLOSE)))
    solid = ndimage.binary_fill_holes(solid)

    alpha = ndimage.gaussian_filter(solid.astype(np.float32), FEATHER)

    edge = np.concatenate([alpha[0, :], alpha[-1, :], alpha[:, 0], alpha[:, -1]])
    return alpha, float((edge > 0.15).mean())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("--out", required=True)
    ap.add_argument("--max-size", type=int, default=1200)
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    paths = [p for pat in args.inputs for p in sorted(glob.glob(pat))]

    for p in paths:
        rgb = np.asarray(Image.open(p).convert("RGB"))
        alpha, contact = cutout(rgb)

        ys, xs = np.where(alpha > 0.02)
        im = Image.fromarray(
            np.dstack([rgb, (alpha * 255).astype(np.uint8)]), "RGBA"
        ).crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))

        if max(im.size) > args.max_size:
            s = args.max_size / max(im.size)
            im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)

        out = os.path.join(args.out, slugify(os.path.basename(p)) + ".png")
        im.save(out, optimize=True)
        flag = f"  <-- touches border ({contact*100:.1f}%)" if contact > 0.02 else ""
        print(f"{os.path.basename(p):24} -> {os.path.basename(out):20} "
              f"{im.size[0]}x{im.size[1]}  {os.path.getsize(out)/1024:.0f} KB{flag}")


if __name__ == "__main__":
    main()
