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
    pose: "thinking",
    description:
      "We start with the machine, not the brief — reference photography, spec sheets, and a conversation about the story you want it to tell.",
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
      "Full CAD-accurate modeling and scene build. Every material, every surface imperfection, considered against real-world reference.",
  },
  {
    index: "04",
    title: "Rendering",
    pose: "laptop",
    description:
      "Physically based lighting and simulation, rendered in layers so every frame can be graded with the precision of a color session.",
  },
  {
    index: "05",
    title: "Delivery",
    pose: "thumbsUp",
    description:
      "Final color, final grade, delivered in the formats your platform needs — from a single hero frame to a full cinematic sequence.",
  },
];

export interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  comingSoon?: boolean;
}

export const experiences: Experience[] = [
  {
    id: "bike-free-fall",
    title: "Bike Free Fall",
    description: "Suspended motion, gravity rendered with intent.",
    image:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "jet-escort",
    title: "Jet Escort",
    description: "Formation flight alongside your machine, to scale.",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "water-impact",
    title: "Water Impact",
    description: "The instant of contact, held a beat past real time.",
    image:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format&fit=crop",
    comingSoon: true,
  },
  {
    id: "space-ride",
    title: "Space Ride",
    description: "Zero gravity, full detail — a machine off-world.",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    comingSoon: true,
  },
  {
    id: "firestorm",
    title: "Firestorm",
    description: "Volumetric heat and light, simulated frame by frame.",
    image:
      "https://images.unsplash.com/photo-1495954380655-01ec3939a26f?q=80&w=1200&auto=format&fit=crop",
    comingSoon: true,
  },
  {
    id: "drone-chase",
    title: "Drone Chase",
    description: "A pursuit shot with no crew, no rig, no limit.",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1200&auto=format&fit=crop",
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
