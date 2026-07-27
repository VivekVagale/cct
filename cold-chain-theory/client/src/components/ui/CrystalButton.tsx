import SpecularButton from "./SpecularButton";
import { ComponentProps } from "react";

type CrystalButtonProps = ComponentProps<typeof SpecularButton>;

export default function CrystalButton({
  children,
  ...props
}: CrystalButtonProps) {
  return (
    <SpecularButton
      size="lg"
      radius={18}
      tint="#7FDBFF"
      tintOpacity={0.08}
      blur={10}
      textColor="#F5F7FA"
      lineColor="#7FDBFF"
      baseColor="#0A0F16"
      intensity={1.3}
      shineSize={18}
      shineFade={45}
      thickness={1.3}
      speed={0.35}
      followMouse
      proximity={300}
      autoAnimate={false}
      {...props}
    >
      {children}
    </SpecularButton>
  );
}