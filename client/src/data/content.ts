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
    pose: "thumbsUp",
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
  comingSoon?: boolean;
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
    id: "bike-free-fall",
    title: "Project Free Fall",
    price: "₹799",
    description: "Suspended motion, gravity rendered with intent.",
    // The studio's own frame, not a stock photograph — the same render the
    // sphere carries as "It Say Grrr". The card crops it 4:3 from a 9:16
    // source, which keeps the fork and front wheel and loses the sky.
    image: "/showcase/it-say-grrr.webp",
  },
  {
    id: "jet-escort",
    title: "Project Jet Mist",
    price: "₹1.7k",
    description: "Formation flight alongside your machine, to scale.",
    // The studio's own frame. The bike, the cruiser and the jet all sit in the
    // lower two-thirds, so the card's 4:3 crop of a 9:16 source keeps the whole
    // arrangement and loses only mist and mountain.
    image: "/showcase/project-jet-mist.webp",
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
    /* A real render of the studio's own, standing in until this one is shot.
       The other coming-soon cards carry Unsplash photographs of other people's
       motorcycles, which is the thing this section was cleaned of once already
       — a placeholder that is at least the studio's work is the lesser wrong. */
    image: "/showcase/too-clean.webp",
    comingSoon: true,
  },
  {
    id: "hellfire",
    title: "Project Hellfire",
    description: "A rider wreathed in fire — volumetric flame and heat haze, simulated frame by frame.",
    image:
      "https://images.unsplash.com/photo-1495954380655-01ec3939a26f?q=80&w=1200&auto=format&fit=crop",
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

export const testimonials: Testimonial[] = [
  {
    quote:
      "They didn't just render our bike — they gave it a scene, a mood, a reason to look twice. It didn't feel like CGI.",
    name: "Aarav Mehta",
    role: "Founder, Torque Collective",
  },
  {
    quote:
      "Every frame came back looking like it had been shot, lit, and graded by a real crew. The precision is the whole point.",
    name: "Elena Kovač",
    role: "Marketing Lead, Velocity Moto",
  },
  {
    quote:
      "We gave them a concept that had no physical way of existing. Three weeks later it looked like it always had.",
    name: "Rohan Iyer",
    role: "Creative Director, Apex Studios",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "What do you need from me to start?",
    answer:
      "Reference photography or manufacturer CAD if you have it, a sense of the mood you're after, and the vehicle's spec. We fill in the rest during Discovery.",
  },
  {
    question: "How long does a project take?",
    answer:
      "A single hero frame typically runs two to three weeks. Full cinematic sequences run longer, scoped during Planning once the shot list is locked.",
  },
  {
    question: "Do you work with vehicles that don't exist yet?",
    answer:
      "Yes — concept vehicles, pre-production models, and machines that only exist as sketches are some of our favorite briefs.",
  },
  {
    question: "Can you match our existing brand's visual language?",
    answer:
      "Yes. We build a lighting and color philosophy around your brand during Planning, so the delivery feels native to what you already publish.",
  },
  {
    question: "What formats do you deliver in?",
    answer:
      "Stills at print resolution, video sequences graded for your platform, and layered source files on request — whatever your team needs downstream.",
  },
];
