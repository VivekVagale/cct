import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Vehicle } from "@/data/vehicles";

interface VehicleCardProps {
  vehicle: Vehicle;
  selected: boolean;
  onSelect: () => void;
}

export function VehicleCard({ vehicle, selected, onSelect }: VehicleCardProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const mvX = useMotionValue(0.5);
  const mvY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mvY, [0, 1], [12, -12]), {
    stiffness: 220,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mvX, [0, 1], [-12, 12]), {
    stiffness: 220,
    damping: 20,
  });
  const glowX = useTransform(mvX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(mvY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width);
    mvY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mvX.set(0.5);
    mvY.set(0.5);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={`group relative text-left overflow-hidden rounded-sm border transition-colors duration-300 ${
        selected
          ? "border-white/70 bg-white/[0.04]"
          : "border-white/[0.1] bg-white/[0.02] hover:border-white/30"
      }`}
    >
      {/* Cursor-follow highlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform([glowX, glowY], (latest) => {
            const [gx, gy] = latest as [string, string];
            return `radial-gradient(280px circle at ${gx} ${gy}, rgba(255,255,255,0.14), transparent 65%)`;
          }),
        }}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover"
          animate={{ scale: selected ? 1.06 : 1 }}
          whileHover={{ scale: 1.08, y: -4 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/70 via-transparent to-transparent" />
      </div>

      <motion.div
        className="relative p-5"
        animate={{ y: selected ? -2 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {vehicle.manufacturer && (
          <p className="text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6] mb-1">
            {vehicle.manufacturer}
          </p>
        )}
        <h4 className="font-display text-xl text-[#F5F7FA]">{vehicle.name}</h4>
      </motion.div>

      {selected && (
        <motion.div
          layoutId="vehicle-selected-indicator"
          className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white"
        />
      )}
    </motion.button>
  );
}
