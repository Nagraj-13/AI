import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none rounded-md";

  const variants = {
    primary: "bg-white text-black hover:bg-slate-200 shadow-sm",
    secondary: "bg-[#1f1f1f] text-white hover:bg-[#2e2e2e] border border-[#333333]",
    outline: "bg-transparent text-white border border-[#222222] hover:bg-[#111111] hover:border-[#444444]",
    ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-[#111111]",
    destructive: "bg-rose-950 text-rose-200 border border-rose-800 hover:bg-rose-900",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-semibold",
    md: "px-4 py-2 text-xs font-semibold",
    lg: "px-5 py-2.5 text-sm font-semibold",
  };

  return (
    <button className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {children}
    </button>
  );
}
