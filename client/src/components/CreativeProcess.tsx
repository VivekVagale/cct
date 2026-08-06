import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import { processStages, type ProcessStage } from "@/data/content";
import { Mascot } from "@/components/Mascot";
import { useScene } from "@/components/SceneDeck";
import { useIsPhone } from "@/hooks/useIsPhone";
import {
  useStableViewportHeight,
  useStableScrollProgress,
} from "@/hooks/useStableViewport";
import { FoldHeading } from "@/components/FoldHeading";
import DepthText from "@/components/DepthText";

/**
 * A vertical cinematic journey: the section pins once and each stage occupies
 * the whole viewport, crossfading into the next as you scroll.
 *
 * Stages overlap deliberately — the outgoing mascot is still fading as the
 * incoming one arrives — so there is never a frame where the stage is empty
 * and never a hard cut between them.
 *
 * Each stage is split rather than stacked: copy on the left, mascot on the
 * right, both filling their half. The type used to sit over a centred mascot,
 * which capped how large either could go — the mascot had to stay clear of the
 * words and the words had to stay legible over it. Side by side, neither is
 * competing for the same pixels, so both are much bigger.
 *
 * Note this deliberately avoids a progress rail with stage dots down the edge;
 * that pattern was built once before and rejected.
 */
export function CreativeProcess() {
  const ref = useRef<HTMLDivElement>(null);
  /*
   * A phone does not pin this section.
   *
   * Five stages crossfading inside a `position: sticky` stage is a fine effect
   * on a desktop and a poor bargain on a phone. It costs a scroll listener, a
   * spring and five absolutely-positioned stages alive at once — and, worse, it
   * pins against a viewport whose height changes every time the browser's own
   * chrome slides in and out. That is what "smooth going down, glitches going
   * up" describes: the bar reappears on an upward scroll, the sticky stage is
   * measured against a viewport that just changed, and the pinned content jumps
   * while the page around it does not.
   *
   * Stacked, each stage is an ordinary block that scrolls like everything else
   * and reveals like everything else. The story is the same five steps in the
   * same order; what goes is a pinning effect nobody on a phone was getting
   * cleanly anyway.
   */
  const isPhone = useIsPhone();
  // Measured against the scene's scroller — see the same note in Hero. In the
  // deck the window never moves, so the five stages would all sit on stage one.
  const { scroller } = useScene();
  /* Pixels from a frozen viewport height, for the reason spelled out in
     useStableViewport and again in Hero: `vh` moves when browser chrome does,
     and this section is five viewports tall. A portrait tablet is not a phone
     by the test above, so it keeps the pin — and it has a URL bar. */
  const viewportHeight = useStableViewportHeight();
  const stableProgress = useStableScrollProgress(ref, viewportHeight);
  const { scrollYProgress: deckProgress } = useScroll({
    target: ref,
    container: scroller ? { current: scroller } : undefined,
    offset: ["start start", "end end"],
  });
  const scrollYProgress = scroller ? deckProgress : stableProgress;

  const progress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 36,
    mass: 0.4,
    restDelta: 0.0005,
  });

  // The heading recedes as the first stage takes over, so the section reads as
  // one continuous move rather than a titled block followed by content.
  const headingOpacity = useTransform(progress, [0, 0.12], [1, 0]);
  const headingY = useTransform(progress, [0, 0.12], ["0vh", "-8vh"]);

  return (
    <section
      id="process"
      ref={ref}
      className="relative pointer-events-auto"
      style={
        isPhone
          ? undefined
          : {
              height: viewportHeight
                ? `${processStages.length * viewportHeight}px`
                : `${processStages.length * 100}vh`,
            }
      }
    >
      <div
        className={
          isPhone
            ? "w-full"
            : "sticky top-0 h-[100svh] w-full overflow-hidden"
        }
      >
        {/* Absolute only while the stage is pinned, where it is laid over a
            fixed screen. Unpinned it was still absolute, and the nearest
            positioned ancestor is the section — so on a phone it hung over the
            top eighth of all five stacked stages, fading out against whichever
            stage happened to be under it. Stacked, it is simply the block that
            comes first, and the page's own reveal brings it in. */}
        <motion.div
          style={isPhone ? undefined : { opacity: headingOpacity, y: headingY }}
          className={`scene-heading z-20 px-6 sm:px-10 max-w-[1600px] mx-auto pointer-events-none ${
            isPhone
              ? "relative pt-16 pb-10"
              : "absolute inset-x-0 top-[12%] sm:top-[16%]"
          }`}
        >
          <p className="text-[10px] sm:text-xs tracking-[0.24em] uppercase text-[#B8C4D6] mb-3 sm:mb-4">
            How We Work
          </p>
          {/* Held under the others: this one shares its screen with a stage
              heading and a five-figure step number, and at 9xl the two
              headings were competing for the same eye. */}
          <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F5F7FA] leading-[0.98]">
            <FoldHeading text="Creative Process" />
          </h2>
        </motion.div>

        {processStages.map((stage, i) => (
          <Stage
            key={stage.index}
            stage={stage}
            index={i}
            progress={progress}
            pinned={!isPhone}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Poses that are wider than they are tall, or close to it.
 *
 * Every pose is sized by its height and lets its width follow, which keeps the
 * proportions honest and means a wide render claims far more of the row than a
 * narrow one — laptop is 1.11 wide against 0.77 for the rest.
 *
 * They were simply made much shorter, which stopped the overlap and left
 * stages 03 and 04 visibly smaller figures than the four around them. The
 * width is the problem, not the height, so the width is what moves: these are
 * pushed off the right edge like stages 01 and 05, and the extra reach leaves
 * the frame instead of landing on the copy. That buys back all but a hair of
 * the height, and the part now off-screen is the far edge of the laptop and
 * the clapperboard — which is where their square cut is anyway.
 */
const WIDE_POSES = new Set(["laptop", "clapperboard"]);

function Stage({
  stage,
  index,
  progress,
  pinned,
}: {
  stage: ProcessStage;
  index: number;
  progress: MotionValue<number>;
  /** False on a phone, where the stages stack and scroll — see CreativeProcess. */
  pinned: boolean;
}) {
  const isPhone = useIsPhone();
  const count = processStages.length;
  // Each stage owns a slice of the scroll, with the window reaching into its
  // neighbours so the crossfades overlap instead of butting up against each other.
  const span = 1 / count;
  const at = (index + 0.5) * span;

  // Narrow enough that only one stage is ever legible — a wider window puts
  // two stages' type on top of each other — but still wide enough that the
  // handover is a crossfade rather than a cut.
  const opacity = useTransform(
    progress,
    [at - span * 0.58, at - span * 0.24, at + span * 0.24, at + span * 0.58],
    [0, 1, 1, 0],
  );
  // A slow drift through the frame; the mascot never simply cuts into place.
  const y = useTransform(progress, [at - span, at + span], ["8vh", "-8vh"]);
  const scale = useTransform(progress, [at - span, at, at + span], [0.95, 1, 1.03]);

  return (
    <motion.div
      /* Unpinned, the stage is a block in the flow with its own space, and
         nothing about it is driven by the section's scroll — it reveals on the
         way past like every other section on the page. */
      style={pinned ? { opacity } : undefined}
      className={
        pinned
          ? "absolute inset-0"
          : "scene-body relative w-full py-16 first:pt-0"
      }
    >
      {/* Two columns from md up: copy left, mascot right. Below that there is
          not enough width to sit them side by side, so they stack — mascot
          above, copy beneath — and both centre. */}
      {/* pb in vh, not %. A percentage padding resolves against the container's
          width even when it is the bottom edge — 8% of a 390px viewport is 31px,
          not the 8% of height it reads as. The stage also drifts ±8vh as it
          crosses, so the clearance has to cover that drift as well as sit the
          copy off the bottom: at 31px the description's last line ended up flush
          against the viewport edge at the bottom of the travel. */}
      <div
        className={`relative w-full max-w-[1600px] mx-auto px-6 sm:px-10 flex flex-col items-center gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between md:gap-10 md:pb-0 ${
          pinned ? "h-full justify-end pb-[14vh]" : "justify-start"
        }`}
      >
        <motion.div
          style={pinned ? { y } : undefined}
          className="order-2 md:order-1 md:w-[46%] flex flex-col items-center text-center md:items-start md:text-left gap-2 md:gap-4 pointer-events-none"
        >
          {/* The stacked layout has one viewport for a mascot and all three of
              these, so the mobile step of each is a size down from what the
              scale would otherwise give — the number most of all, since it is
              decoration and the description is the part that has to be read. */}
          {/* No font-black. The display face is a single-weight family, so
              asking for 900 does not select a heavier cut — there isn't one —
              it makes the browser synthesise the weight by smearing the
              outlines, which at 13rem is plainly visible against the real
              headline beside it. The face is already black. */}
          <span className="font-display text-[#F5F7FA]/20 leading-none text-5xl sm:text-8xl md:text-[10rem] lg:text-[13rem]">
            {stage.index}
          </span>
          {/* The five stage titles are extruded rather than flat. They are the
              one heading on the site with a whole screen to themselves and
              nothing to compete with, which is the only place this is worth its
              cost — it draws the word once per layer.

              Sized here rather than by a type class: the component lays its
              layers out against a font size it has to know, so a Tailwind step
              would set the box and leave the extrusion measuring something
              else. The face is the page's near-white and the extrusion the
              brand violet, so the depth reads as the site's colour rather than
              as a drop shadow. */}
          <h3 className="font-display text-[#F5F7FA] leading-[1.0]">
            <DepthText
              text={stage.title}
              fontSize="clamp(2rem, 7vw, 6rem)"
              fontWeight={400}
              faceColor="#F5F7FA"
              depthColor="#9F6EF2"
              /* Half the layers and no pointer tracking on a phone: each
                 layer is another draw of the same word, and there is no cursor
                 on a touch screen for the tracking to follow. */
              layers={isPhone ? 7 : 14}
              depth={5}
              tilt={9}
              pointerTracking={!isPhone}
              shadow
            />
          </h3>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#B8C4D6] leading-relaxed max-w-lg md:max-w-xl">
            {stage.description}
          </p>
        </motion.div>

        {/* Bottom-aligned and taller than the space it has.

            The poses are cut off square at the waist, and at a height that fit
            inside the stage that cut edge — plus the soft rectangle of shadow
            under it — sat in open frame, which reads as a badly masked PNG
            rather than as a figure. Grown past the stage and anchored to its
            bottom, the cut falls below the sticky stage's edge and is clipped
            by the `overflow-hidden` on it, so the figure runs off the bottom of
            the screen the way a person standing close to camera would.

            `items-end` rather than the row's `items-center`: centred, the extra
            height would have hung off the top as well and taken the helmet with
            it. */}
        <motion.div
          style={pinned ? { y, scale } : undefined}
          className={`order-1 md:order-2 md:w-[50%] flex items-end justify-center md:justify-end md:self-stretch pointer-events-none${
            /* The first pose is cut square down its right side as well as its
               hem, and unlike the hem there is no bottom edge to hide it under.
               Pushed off the right of the frame instead, so the cut leaves the
               screen and what is left reads as a figure standing at the edge of
               shot. Only this one — the other four are cut at the waist alone
               and sit where the row puts them. */
            index === 0 || index === 4 || WIDE_POSES.has(stage.pose)
              ? " md:-mr-[11vw] lg:-mr-[8vw]"
              : ""
          }`}
        >
          {/* Height-sized, so width is intrinsic and a wide pose can overrun a
              narrow viewport: laptop and thumbsUp are near-square, and at the
              42vh this used to be that is ~378px across on a 375px phone. The
              vw term caps the width by capping the height that produces it —
              the image itself cannot carry a max-width, because with a fixed
              height that would constrain both axes and render it fill-stretched.

              Past 100vh from md up, which is what puts the cut edge off the
              bottom of the stage. The phone step grows far less: there the
              layout is stacked and the copy sits directly underneath, so a
              pose tall enough to bury its own hem would bury the description
              with it. */}
          <Mascot
            pose={stage.pose}
            animateIn={false}
            parallax
            sizing="height"
            /* The -12vh is the drift's allowance, and it has to be a margin
               rather than a translate class: the wrapper's transform is written
               by framer for the y and the scale, and a Tailwind translate on
               this element would be a second transform on the same node. The
               stage drifts each pose from 8vh down to -8vh as it crosses, so at
               the top of that travel a hem sitting exactly on the stage's edge
               would rise 8vh into frame — the whole cut edge, back again. 12
               keeps it under by 4 at the worst moment. */
            /* The heights are what they are because of the *top* of the pose,
               not the bottom. Bottom-anchored at 104vh with the -12vh margin,
               a pose's head sat 8vh below the stage's top edge — and the stage
               drifts each one 8vh upwards as it crosses, which put the helmet
               into the nav bar at the top of that travel. Every step is now
               short enough that the head stays clear of the bar at the worst
               moment of the drift, while the hem is still well under the
               bottom edge. */
            className={`md:-mb-[12vh] ${
              /* Height is what sets the width here, so a wide pose needs a
                 shorter one or it grows across the column and sits on top of
                 the copy. laptop is 1.11 wide against 0.77 for the rest —
                 at the tall poses' height it was ~300px into the text. */
              WIDE_POSES.has(stage.pose)
                /* Every step is capped against vw as well as vh, because
                   height is what sets width here and a tall, narrow viewport
                   turns a generous height into a pose wider than the screen. A
                   768x1024 tablet was drawing the laptop 794px across a 768px
                   viewport, straight over the copy beside it. The vw figures
                   are the widest each aspect may be: 40vw x 1.25 and 60vw x
                   0.77 both land inside the column. */
                ? "h-[min(34vh,66vw)] sm:h-[44vh] md:h-[min(74vh,44vw)] lg:h-[min(84vh,44vw)]"
                : "h-[min(38vh,74vw)] sm:h-[48vh] md:h-[min(92vh,60vw)] lg:h-[min(102vh,60vw)]"
            }`}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
