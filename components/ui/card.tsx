import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge(clsx("vercel-card rounded-xl p-5 border border-[#1f1f1f]", className))}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge(clsx("pb-3 border-b border-[#1f1f1f] mb-4", className))}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={twMerge(clsx("text-base font-semibold text-white tracking-tight", className))}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={twMerge(clsx("text-xs text-slate-400 mt-0.5", className))}>{children}</p>;
}
