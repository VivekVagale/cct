import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react';

/**
 * Static, reusable button — primary (filled accent) or secondary
 * (outlined). No hover animation/transition library per the
 * static-foundation brief; renders as <a> when href is passed.
 */

type Variant = 'primary' | 'secondary';

const base =
  'inline-flex items-center justify-center px-7 py-3 rounded-md text-sm font-semibold';

const variants: Record<Variant, string> = {
  primary: 'bg-[#FFFFFF] text-[#05070A] hover:bg-[#E5E5E5]',
  secondary: 'border border-white/[0.16] text-[#F5F7FA] hover:bg-white/[0.04]',
};

interface CommonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type StaticButtonProps = ButtonAsButton | ButtonAsAnchor;

export function StaticButton({ variant = 'primary', children, className = '', ...rest }: StaticButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if ('href' in rest && rest.href) {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
