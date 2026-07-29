import type { Vehicle } from '@/data/vehicles';

interface VehicleCardProps extends Vehicle {
  selected: boolean;
  onSelect: (id: string) => void;
}

/**
 * Selectable vehicle card — reserved empty image slot (no images
 * yet), keyboard-operable, single-select. No animation library.
 */
export function VehicleCard({ id, name, selected, onSelect }: VehicleCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(id)}
      className={`flex flex-col rounded-lg border overflow-hidden text-left ${
        selected ? 'border-[#FFFFFF]' : 'border-white/[0.08] hover:border-white/[0.2]'
      }`}
    >
      {/* Reserved image slot — intentionally empty */}
      <div className="aspect-[4/3] bg-[#0D1117]" />
      <span className="px-3 py-2 text-sm font-medium text-[#F5F7FA]">{name}</span>
    </button>
  );
}
