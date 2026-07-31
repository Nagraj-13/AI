import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "emerald" | "amber" | "rose" | "indigo" | "cyan";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const styles = {
    default: "bg-[#1f1f1f] text-slate-300 border-[#333333]",
    emerald: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
    amber: "bg-amber-950/60 text-amber-400 border-amber-800/60",
    rose: "bg-rose-950/60 text-rose-400 border-rose-800/60",
    indigo: "bg-indigo-950/60 text-indigo-300 border-indigo-800/60",
    cyan: "bg-cyan-950/60 text-cyan-300 border-cyan-800/60",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border",
          styles[variant],
          className
        )
      )}
    >
      {children}
    </span>
  );
}
