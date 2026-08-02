import { AnimatePresence, motion } from "framer-motion";
import { vehicles } from "@/data/vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { ColorCard } from "@/components/ColorCard";

interface VehicleConfiguratorProps {
  selectedVehicleId: string | null;
  selectedColorId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  onSelectColor: (colorId: string) => void;
}

export function VehicleConfigurator({
  selectedVehicleId,
  selectedColorId,
  onSelectVehicle,
  onSelectColor,
}: VehicleConfiguratorProps) {
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs tracking-[0.14em] uppercase text-[#B8C4D6]">Vehicle</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            selected={vehicle.id === selectedVehicleId}
            onSelect={() => onSelectVehicle(vehicle.id)}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {selectedVehicle && (
          <motion.div
            key={selectedVehicle.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 border-t border-white/[0.08]">
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#B8C4D6] mt-4 mb-3">
                Colour — {selectedVehicle.manufacturer} {selectedVehicle.name}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedVehicle.colors.map((color) => (
                  <ColorCard
                    key={color.id}
                    color={color}
                    selected={color.id === selectedColorId}
                    onSelect={() => onSelectColor(color.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
