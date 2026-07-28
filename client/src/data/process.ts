export interface ProcessStepData {
  number: string;
  title: string;
  description: string;
}

export const processSteps: ProcessStepData[] = [
  {
    number: '01',
    title: 'Discovery',
    description: 'Understanding your vision, brand identity, and project goals through detailed consultation.',
  },
  {
    number: '02',
    title: 'Planning',
    description: 'Developing creative concepts, storyboards, and technical specifications for execution.',
  },
  {
    number: '03',
    title: 'Production',
    description: 'Building 3D models, scenes, and lighting, then rendering with premium attention to detail.',
  },
  {
    number: '04',
    title: 'Delivery',
    description: 'Final assets, revisions, and seamless handoff of your premium CGI content.',
  },
];
