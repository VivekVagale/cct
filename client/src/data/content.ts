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
  image: string;
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
    id: "jet-escort",
    title: "Project Jet Escort",
    price: "₹1.7k",
    isNew: true,
    description: "Formation flight alongside your machine, to scale.",
    // The studio's own frame. The bike, the cruiser and the jet all sit in the
    // lower two-thirds, so the card's 4:3 crop of a 9:16 source keeps the whole
    // arrangement and loses only mist and mountain.
    //
    // The file is still named for the old title. Renaming it would mean
    // renaming the sphere's frame too, and the picture has not changed — only
    // what the build is called.
    image: "/showcase/project-jet-mist.webp",
    /* The same set as the still: the jet, the two cars and the machine on wet
       tarmac. A slow drift across it, so picking this build carries on the shot
       the card was already showing rather than cutting to a different one. */
    video: "/projects/jet-escort.mp4",
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
    id: "water-impact",
    title: "Project Water Impact",
    description: "The instant of contact, held a beat past real time.",
    image:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop",
    comingSoon: true,
  },
  {
    id: "space-ride",
    title: "Project Space Ride",
    description: "Zero gravity, full detail — a machine off-world.",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    comingSoon: true,
  },
  {
    id: "drop-zone",
    title: "Project Drop Zone",
    description:
      "Two machines, a drop zone and a lot of smoke — game-key art staging, rendered as stills.",
    /* The studio's own render, and now one that argues the description: a gunship
       carrying a car out over the cloud deck on four cables is two machines and a
       delivery. It replaces a chrome Continental at sunset, which was the studio's
       work — the point of that swap — but had nothing to do with this brief.
       Still a stand-in until the card's own frames are shot. */
    image: "/showcase/chopper-delivery.webp",
    comingSoon: true,
  },
  {
    id: "hellfire",
    title: "Project Hellfire",
    description: "A rider wreathed in fire — volumetric flame and heat haze, simulated frame by frame.",
    /* The nearest thing the studio has to this shot, which is not very near:
       there is no flame render in the library at all, so this is the hottest
       frame in it — black and red under a low sun, embers along the frame rails.
       It is the same frame the sphere shows, and reusing it is the lesser wrong
       against a stock photograph of somebody else's motorcycle. Replace it the
       moment a flame sim exists; the description is writing a cheque this image
       does not cash. */
    image: "/showcase/f-0475.webp",
    comingSoon: true,
  },
  {
    id: "drone-chase",
    title: "Project Drone Chase",
    description: "A pursuit shot with no crew, no rig, no limit.",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1200&auto=format&fit=crop",
    comingSoon: true,
  },
  {
    id: "re-9",
    title: "Project RE 9",
    description: "Nine frames of a single machine, built end to end.",
    // The studio's own frame. 9:16, cropped 4:3 by the card, which keeps the
    // rider and the roof edge and loses the top of the sky.
    image: "/showcase/project-re-9.webp",
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
