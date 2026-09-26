import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Wordmark({
  dark,
  large,
  className,
}: {
  dark?: boolean;
  large?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("wm", dark && "dk", large && "lg", className)}>
      <b>VIMBISO</b>
      <i>NETWORK</i>
    </span>
  );
}

export function Photo({
  src,
  alt,
  overlay = "navy",
  kenBurns,
  className,
  children,
}: {
  src: string;
  alt: string;
  overlay?: "navy" | "teal" | "header" | "soft" | "none";
  kenBurns?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("vn-photo", kenBurns && "ken", className)}>
      <img src={src} alt={alt} />
      {overlay !== "none" ? <div className={cn("vn-ov", `vn-ov-${overlay}`)} /> : null}
      {children}
    </div>
  );
}

type BtnVariant = "navy" | "teal" | "gold" | "outline" | "ghost" | "white";

export function Btn({
  variant = "navy",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      className={cn(
        "relative w-full overflow-hidden rounded-md px-4 py-3.5 text-[15px] font-extrabold transition duration-150",
        "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
        variant === "navy" &&
          "bg-navy text-white shadow-[0_10px_24px_rgb(14_42_71_/_0.32)] hover:-translate-y-0.5",
        variant === "teal" &&
          "bg-teal text-white shadow-[0_10px_24px_rgb(15_118_110_/_0.34)] hover:-translate-y-0.5",
        variant === "gold" &&
          "bg-gold text-navy-3 shadow-[0_10px_24px_rgb(224_163_43_/_0.36)] hover:-translate-y-0.5",
        variant === "outline" &&
          "bg-surf text-navy shadow-[inset_0_0_0_2px_var(--color-navy)] hover:bg-navy hover:text-white",
        variant === "ghost" && "bg-transparent text-navy hover:bg-navy/5",
        variant === "white" && "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-lg bg-surf p-4 shadow-[var(--shadow-card)]",
        onClick && "transition duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-mut">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-sm border-[1.5px] border-line bg-white px-3.5 py-3.5 text-[15px] text-ink outline-none",
        "transition focus:border-teal focus:shadow-[0_0_0_4px_rgb(15_118_110_/_0.14)]",
        props.className,
      )}
    />
  );
}

export function Badge({
  tone = "navy",
  children,
  className,
}: {
  tone?: "navy" | "teal" | "gold" | "ok" | "warn" | "err" | "live" | "glass";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold",
        tone === "navy" && "bg-navy/10 text-navy",
        tone === "teal" && "bg-teal/12 text-teal",
        tone === "gold" && "bg-gold/20 text-gold-d",
        tone === "ok" && "bg-ok/12 text-ok",
        tone === "warn" && "bg-warn/15 text-warn",
        tone === "err" && "bg-err/12 text-err",
        tone === "live" && "bg-teal-2/16 text-teal",
        tone === "glass" && "bg-white/14 text-teal-3",
        className,
      )}
    >
      {tone === "live" ? <i className="vn-live" /> : null}
      {children}
    </span>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-px text-gold">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={i < Math.round(value) ? "fill-current" : "fill-[#d9dee6]"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
        </svg>
      ))}
    </span>
  );
}

export function Avatar({
  src,
  alt,
  size = "md",
  verified,
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  verified?: boolean;
}) {
  const dim =
    size === "sm"
      ? "h-9 w-9"
      : size === "lg"
        ? "h-16 w-16"
        : size === "xl"
          ? "h-[84px] w-[84px]"
          : "h-11 w-11";
  return (
    <span className={cn("relative inline-block shrink-0", dim)}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full rounded-full object-cover shadow-[0_0_0_2px_#fff,0_4px_12px_rgb(14_42_71_/_0.18)]"
      />
      {verified ? (
        <span className="absolute -right-0.5 -bottom-0.5 grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-white bg-teal">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

export function Steps({ total, current }: { total: number; current: number }) {
  return (
    <div className="mb-4 flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <i
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            i < current ? "bg-gradient-to-r from-teal to-teal-2" : "bg-line",
          )}
        />
      ))}
    </div>
  );
}

export function TopBar({
  left,
  title,
  right,
  ghost,
}: {
  left?: ReactNode;
  title?: ReactNode;
  right?: ReactNode;
  ghost?: boolean;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-30 pt-[max(env(safe-area-inset-top),6px)]",
        ghost
          ? "bg-transparent"
          : "border-b border-line/90 bg-surf/72 backdrop-blur-md",
      )}
    >
      <div className="flex h-[54px] items-center justify-between px-4">
        <div className="flex min-w-[38px] items-center">{left}</div>
        <div className="text-center text-[16px] font-extrabold tracking-[-0.02em] text-navy">
          {title}
        </div>
        <div className="flex min-w-[38px] items-center justify-end">{right}</div>
      </div>
    </div>
  );
}

export function IconBtn({
  onClick,
  children,
  light,
  className,
}: {
  onClick?: () => void;
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid h-[38px] w-[38px] place-items-center rounded-sm text-xl transition hover:bg-navy/10",
        light ? "text-white hover:bg-white/15" : "text-navy",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Choice({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-sm border-[1.5px] bg-white px-3.5 py-3 text-left font-bold text-navy transition",
        active
          ? "border-teal bg-teal/6 shadow-[0_0_0_3px_rgb(15_118_110_/_0.12)]"
          : "border-line hover:-translate-y-px hover:border-teal",
        className,
      )}
    >
      <span className="flex-1">{children}</span>
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full border-2 text-[11px] font-black text-white",
          active ? "border-teal bg-teal" : "border-line",
        )}
      >
        {active ? "✓" : ""}
      </span>
    </button>
  );
}

export function Pad({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative z-[2] px-4 pb-24 pt-4", className)}>{children}</div>;
}
