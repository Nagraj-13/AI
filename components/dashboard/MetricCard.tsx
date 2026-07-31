import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
  accentColor?: "indigo" | "cyan" | "emerald" | "purple";
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "indigo",
}: MetricCardProps) {
  const colorMap = {
    indigo: "from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20",
    cyan: "from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20",
    emerald: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20",
    purple: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="glass-card rounded-2xl p-5 border relative overflow-hidden group">
      {/* Background Subtle Gradient Glow */}
      <div
        className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-br ${colorMap[accentColor]} blur-xl group-hover:scale-150 transition-transform duration-500 opacity-60`}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl bg-slate-900/80 border ${colorMap[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {trend && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-400 font-normal">{subtitle}</p>
    </div>
  );
}
