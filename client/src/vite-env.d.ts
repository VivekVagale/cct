/// <reference types="vite/client" />

/*
 * The model import, and nothing else.
 *
 * This file has no top-level import or export on purpose. A .d.ts with either
 * becomes a module, and `declare module "*.glb"` inside a module is scoped to
 * that module rather than being ambient — which is how the first version of
 * this file compiled cleanly and changed nothing at all.
 *
 * `.glb` also has to be listed in `assetsInclude` in vite.config.ts. The
 * declaration satisfies the compiler; that tells the bundler to hand the file
 * through as a URL rather than try to parse a binary as source.
 *
 * Nothing here for `*.png` or for meshline: vite/client already declares image
 * imports, meshline ships its own types, and Lanyard.tsx augments
 * @react-three/fiber for the two elements it registers. Restating any of it
 * would be a second definition to keep in step with the first.
 */
declare module "*.glb";
