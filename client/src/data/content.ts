import type { MascotPose } from "@/data/mascot";

export interface ProcessStage {
  index: string;
  title: string;
  description: string;
  /** The mascot personally guides the visitor through each stage. */
  pose: MascotPose;
}

export const processStages: ProcessStage[] = [
  {
    index: "01",
    title: "Discovery",
    pose: "sideCloseUp",
    description:
      /* The warning is the useful part of this step and belongs here rather
         than in a contract nobody reads at this stage. Framed as the reason for
         the questions, not as a threat: a client who understands why the detail
         is asked for supplies it, where one who is told what they cannot change
         later goes looking for a studio that sounds friendlier. Step 04 says
         what a render costs in hours, which is what makes this land. */
      "We start with the machine, not the brief — reference photography, spec sheets, and a conversation about the story you want it to tell. Bring every detail now: colour, finish, angle, badge, the lot. Once a shot is rendered it is hours of compute deep, and changing it means rendering it again.",
  },
  {
    index: "02",
    title: "Planning",
    pose: "pointing",
    description:
      "Shot list, lighting philosophy, and environment design locked before a single render begins. Nothing is improvised in production.",
  },
  {
    index: "03",
    title: "Production",
    pose: "clapperboard",
    description:
      /* Blender, named. The line said "CAD-accurate", which described neither
         the tool nor the work — CAD is what a manufacturer hands over, not what
         this studio models in. What the claim was reaching for is the accuracy,
         and that survives the correction. */
      "Modelled and built in Blender — every panel, every material, every surface imperfection, measured against real-world reference until the machine is right.",
  },
  {
    index: "04",
    title: "Rendering",
    pose: "laptop",
    description:
      /* The hours and the hardware are stated because this is the step a
         client cannot see and most misjudge — it is where the schedule and the
         cost actually come from. Said as fact, not as a complaint. */
      "Physically based lighting and simulation, rendered in layers so every frame can be graded with the precision of a colour session. This is the slow part: hours of GPU compute per shot, and every second of footage is a few hundred frames of it.",
  },
  {
    index: "05",
    title: "Delivery",
    /* Was "thumbsUp", which pointed at a file holding the side close-up — a
       head-and-shoulders shot with no hands in frame, on the one stage whose
       whole point is handing something over. The unveil is the delivery pose.
       It appears again in the booking section, far enough away to read as the
       studio's gesture for finished work rather than as a repeat. */
    pose: "projectReady",
    description:
      /* Says what arrives, and stops there. The collab post is offered without
         a word about what it costs — the studio charges for it, and copy that
         mentions it alongside everything else included would imply otherwise. */
      "Final colour, final grade, cut for Instagram and delivered post-ready — a reel you can put straight up, from a single hero frame to a full cinematic sequence. A collab post on your handle if you want one.",
  },
];

export interface Project {
  id: string;
  title: string;
  description: string;
  /**
   * The card's picture, where one exists.
   *
   * Optional, and a build with no frame yet should leave it unset rather than
   * borrow. The two ways of filling this in when there is nothing to show are a
   * stock photograph of somebody else's motorcycle and a studio frame that
   * argues with the description beside it, and this file already carries a
   * comment calling one of those the lesser wrong. Unset, the card draws the
   * same placeholder a machine with no render draws, which says so.
   */
  image?: string;
  /**
   * A short silent loop, played in the card's thumbnail while this build is the
   * selected one in the booking form.
   *
   * Optional, and most builds will not have one. The still is what the card is
   * built around — it is the poster, the fallback, and what every unselected
   * card shows — so a build with no loop loses nothing and a loop that fails to
   * load is invisible rather than broken.
   *
   * Nothing is fetched until a visitor picks the build (`preload="none"`), which
   * is what keeps nine of these off a phone's data plan. Keep them short and
   * small: a card is roughly 320px wide and the file is downloaded during a
   * click, not before it.
   */
  video?: string;
  comingSoon?: boolean;
  /**
   * Newly offered, and worth pointing at.
   *
   * Separate from `comingSoon` because they are opposite claims: one says a
   * build cannot be ordered yet, this says it can and has not been here long.
   * Take it off when it stops being true — a badge that never expires stops
   * being read.
   */
  isNew?: boolean;
  /**
   * The higher tier of a build that also ships in a standard form.
   *
   * Separate from `isNew` because they are unrelated claims — one is about how
   * long it has been offered, the other about what you get — and a build can
   * reasonably be both. They render as the same badge shape for that reason;
   * if the two ever appear on one card they will need telling apart by colour
   * rather than by reading them.
   */
  isPremium?: boolean;
  /**
   * What this build costs, already formatted.
   *
   * A string rather than a number, and deliberately: "1.7k" is how the studio
   * quotes it and how a client reads it, and a formatter given 1700 would
   * produce "1,700" or "1.7K" depending on locale. Set only where a price is
   * actually fixed — the rest are quoted after a conversation, and the form
   * says so rather than inventing a figure.
   */
  price?: string;
}

export const projects: Project[] = [
  {
    id: "studio",
    title: "Project Studio",
    price: "₹799",
    isNew: true,
    description: "Your machine on a seamless floor, lit like a product.",
    /* The studio's own render, frame 49 of the GT 650 cinematic, pulled from
       the graded film rather than from the raw frames -- the PNG sequence is
       deliberately flat and would have looked washed on the card.

       Re-cut from the studio's finished export, which is not the file this
       frame came from first. The sequencer's own mp4 and the export are the
       same edit in two grades, and the export is the darker of them: about
       twenty levels lower in average luma, with the shadows the flatter file
       lifts. The loop below is from the export, so the still had to be as well
       -- a poster and a loop of one shot in two grades would have brightened
       the card the moment it was picked.

       Cropped 4:3 around the machine rather than left at the source's 9:16. The
       bike sits in the upper third of that frame, so the card's own crop of a
       tall image would have kept the floor and lost the motorcycle. The other
       two cards are 9:16 because their subjects happen to sit low enough to
       survive it; this one does not. */
    image: "/showcase/project-studio.webp",
    /* The film's first two shots, cut off at the frame before its third: the
       wide the still is a frame of, and then the push in to the three-quarter
       front. The same 4:3 window as the still, so the loop opens on the shot
       the poster was already showing and then moves.

       Shot 01 on its own would have been the tidier match for the two cards
       below, which are each a single unbroken drift. It is also 2.2 seconds of
       a very slow orbit around a small side-on machine, which at 320px is the
       still over again -- the reason for putting a loop on this card at all.
       Carrying through into shot 02 buys the movement and lands the length
       within a second of the other two. The cut inside it is the film's own,
       placed on the musical accent rather than at a round number. */
    video: "/projects/studio.mp4",
  },  {
    id: "jet-mist",
    title: "Project Jet Mist",
    price: "₹1.7k",
    isNew: true,
    description: "Formation flight alongside your machine, to scale.",
    // The studio's own frame. The bike, the cruiser and the jet all sit in the
    // lower two-thirds, so the card's 4:3 crop of a 9:16 source keeps the whole
    // arrangement and loses only mist and mountain.
    //
    // The build was briefly called Jet Escort and is Jet Mist again. The still
    // never moved — it was left under its original name through the rename
    // rather than being renamed twice, which is the whole reason there is
    // nothing to undo here.
    image: "/showcase/project-jet-mist.webp",
    /* The same set as the still: the jet, the two cars and the machine on wet
       tarmac. A slow drift across it, so picking this build carries on the shot
       the card was already showing rather than cutting to a different one. */
    video: "/projects/jet-mist.mp4",
  },
  {
    id: "bike-free-fall",
    title: "Project Free Fall",
    price: "₹799",
    description: "Suspended motion, gravity rendered with intent.",
    // The studio's own frame, not a stock photograph — the same render the
    // sphere carries as "It Say Grrr". The card crops it 4:3 from a 9:16
    // source, which keeps the fork and front wheel and loses the sky.
    image: "/showcase/it-say-grrr.webp",
    /* The last shot of the Guerrilla 450 reel, and the only one in it with no
       aircraft: the machine alone, turning over the rock. The shots with a
       helicopter or a bomber in frame are the build next to this one on the
       page, and putting one here would make two cards argue about which is
       which. Same reel and same grade as the still, a different moment of it. */
    video: "/projects/bike-free-fall.mp4",
  },
  {
    id: "bike-free-fall-premium",
    title: "Project Free Fall Premium",
    price: "₹1.3k",
    isPremium: true,
    /* PLACEHOLDER — the studio's words, not mine.

       Sitting next to Free Fall, this line is the only thing on the card that
       says why one costs ₹799 and the other ₹1.3k. I know the brief drops the
       jets question and nothing else, which is not enough to write a claim
       from, so this says only what is certainly true and leaves the selling to
       be written by someone who knows what the tier includes. */
    description: "The Free Fall treatment, taken further.",
    /* Free Fall's own still and loop, deliberately.

       The build is the same subject at a higher tier, so a different frame
       would be arguing it is a different film. WorkShowcase dedupes its warm
       list through a Set, so sharing a source costs no second request; the
       Projects grid does show the two cards carrying one image, which is worth
       a look once there is a frame that belongs to this tier. */
    image: "/showcase/it-say-grrr.webp",
    video: "/projects/bike-free-fall.mp4",
  },
  {
    id: "minecraft",
    title: "Project Minecraft",
    description: "Your machine in a world built out of blocks.",
    /* No image, on purpose. There is no voxel frame in the library and nothing
       in it stands in for one — a photograph of a real motorcycle under this
       title says the opposite of what the build is. The card draws the
       placeholder until the first frame exists, and then this gets a path like
       every other.

       On the name: Minecraft is Mojang's trademark. Naming a paid build after
       it was the studio's call, made with the exposure pointed out. If it ever
       needs to change, it is the title on this line and nothing else — the id
       is already generic. */
    comingSoon: true,
  },
  {
    id: "custom-cgi",
    title: "Custom CGI",
    description: "Bring the concept. We build the world around it.",
    image:
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop",
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

/*
 * Empty, and the section is hidden until it is not.
 *
 * Three invented quotes lived here — Aarav Mehta, Elena Kovač, Rohan Iyer, and
 * the studios they were attributed to — none of them real. On a page whose whole
 * argument is that its numbers are measured and its captions are not guessed,
 * three fictional clients were the one thing on it that could not survive being
 * asked about.
 *
 * Add real ones here and the section returns on its own, tickets and all. The
 * shape is the shape: a quote, who said it, and what they do.
 */
export const testimonials: Testimonial[] = [];

export interface FaqItem {
  question: string;
  answer: string;
}

/*
 * The studio's own answers, in the studio's plural voice.
 *
 * The turnaround here is days where the old set said two to three weeks for a
 * single hero frame, and the scope is the whole edit suite rather than vehicle
 * CGI alone. Both are the studio's to state and neither is inferred, so the
 * substance stands as they sent it — including the last one, which is the only
 * charging term on the page and the reason the preview passes exist.
 *
 * Two edits to the wording, and only the wording. One answer arrived as "I
 * specialize" while the rest said "we", so a reader met a person and a studio
 * in the same list; it says "we" now. The question about a bike that is not
 * listed was written here rather than supplied, and matches. Every other page
 * on the site is already plural — About, Booking, the confirmation — so this is
 * the set falling in with them rather than a new house style.
 */
export const faqItems: FaqItem[] = [
  {
    question: "How long does a project usually take?",
    answer:
      "Every project is different, but most edits are completed within 3–7 business days. Larger VFX, CGI, or 3D animation projects may take 1–3 weeks depending on complexity. You'll receive a clear timeline before work begins.",
  },
  {
    question: "What do you need from me to get started?",
    answer:
      "To get started, simply provide your footage or assets, a project brief, any reference examples, and your vision for the final result. The more details you provide upfront, the more accurately your project can be brought to life.",
  },
  /* Written here rather than supplied, unlike the six around it. The list in
     step 01 is what has been modelled, not what can be — this is the one
     question the configurator itself raises and had no answer to. Reword
     freely; the address is the part that has to stay right, and it is the same
     one the footer carries. */
  {
    question: "What if my bike isn't listed in the models above?",
    answer:
      "Email coldchaintheory@gmail.com and tell us what you ride. The picker lists the machines already modelled, not the limit of what can be built — anything missing is a conversation, not a no.",
  },
  {
    question: "Can I request revisions?",
    answer:
      "Yes. Revision rounds are included as discussed before the project begins. Preview versions are shared during production to ensure everything aligns with your expectations before final delivery.",
  },
  {
    question: "What types of content do you create?",
    answer:
      "We specialize in cinematic video editing, VFX, CGI, 3D motion graphics, product animations, promotional videos, social media content, and custom visual experiences tailored to your brand or creative vision.",
  },
  {
    question: "How do we communicate during the project?",
    answer:
      "Communication is simple and transparent throughout the process. You'll receive regular updates, preview renders when necessary, and direct support until the project is successfully delivered.",
  },
  {
    question: "Will I be charged for revisions after the final render?",
    answer:
      "Please review all preview versions carefully before approving the final render. Once the project has been approved, rendered, and delivered, any additional changes that require re-rendering, re-editing, or significant modifications will incur an extra charge based on the scope of the requested work.",
  },
];
