export interface Vehicle {
  id: string;
  name: string;
}

/**
 * Selectable models for the booking form. No images yet — cards
 * render an empty reserved slot until real thumbnails are added.
 */
export const vehicles: Vehicle[] = [
  { id: 'ducati-panigale', name: 'Ducati Panigale' },
  { id: 'kawasaki-ninja', name: 'Kawasaki Ninja' },
  { id: 'yamaha-r1', name: 'Yamaha R1' },
  { id: 'porsche-911', name: 'Porsche 911' },
  { id: 'bmw-m4', name: 'BMW M4' },
  { id: 'audi-rs6', name: 'Audi RS6' },
];
