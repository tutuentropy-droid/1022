import { useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Activity,
  RefreshCw,
  Bug,
  Flame,
  Contrast,
  Layers,
  Eye,
  Sparkles,
  User,
  ScrollText,
  Heart,
  ThumbsDown,
  Tag,
  Filter,
  Scale,
} from "lucide-react";
import type { BugMatchResult } from "../types/bug";
import { severityLabels, rankLabels, rankColors } from "../types/bug";
import { cn } from "../lib/utils";
import { BugCardDetail } from "./BugCardDetail";

interface ExhibitCardProps {
  matchResult: BugMatchResult;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Contrast,
  Layers,
  Eye,
  Sparkles,
  User,
  ScrollText,
  Heart,
  ThumbsDown,
  Tag,
  Filter,
  Scale,
};

const severityStyles = {
  low: {
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  medium: {
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    glow: "shadow-amber-500/20",
  },
  high: {
    badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    glow: "shadow-rose-500/30",
  },
};

export function ExhibitCard({
  matchResult,
  index,
  isExpanded,
  onToggle,
}: ExhibitCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { bug, matchScore } = matchResult;
  const IconComponent = bug.icon ? iconMap[bug.icon] || Bug : Bug;
  const severityStyle = severityStyles[bug.severity];
  const rankColor = rankColors[bug.rank];

  const dangerLevel = bug.severity === "high" ? 90 : bug.severity === "medium" ? 60 : 30;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mouse-x", `${x}%`);
      card.style.setProperty("--mouse-y", `${y}%`);
    };

    card.addEventListener("mousemove", handleMouseMove);
    return () => card.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <article
      className={cn(
        "relative group animate-fade-up opacity-0",
        `stagger-delay-${Math.min(index + 1, 6)}`
      )}
      style={{ animationDelay: `${Math.min(index, 6) * 0.1}s` }}
    >
      <div
        ref={cardRef}
        className={cn(
          "relative rounded-xl overflow-hidden transition-all duration-500 ease-out cursor-pointer",
          "bg-gradient-to-br from-museum-wallLight/40 to-museum-wallDark/60",
          "border border-museum-gold/20 backdrop-blur-sm",
          "hover:border-museum-gold/50 hover:shadow-2xl",
          "hover:shadow-museum-gold/10 hover:-translate-y-2",
          isExpanded && "border-museum-gold/50 shadow-2xl shadow-museum-gold/10"
        )}
        onClick={onToggle}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-museum-gold/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-museum-gold/30 to-transparent" />

        <div
          className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(201, 169, 98, 0.1), transparent 40%)`,
          }}
        />

        <div className="relative p-5">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div
                className={cn(
                  "relative w-16 h-16 rounded-xl flex items-center justify-center",
                  "bg-museum-wall/80 border border-museum-gold/30",
                  "transition-all duration-300 group-hover:border-museum-gold/50"
                )}
              >
                <IconComponent
                  className="w-8 h-8 text-museum-gold"
                  style={{ filter: "drop-shadow(0 0 8px rgba(201, 169, 98, 0.4))" }}
                />

                <div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-museum-wall"
                  style={{
                    backgroundColor: rankColor,
                    color: "#1a3a3a",
                    boxShadow: `0 0 12px ${rankColor}80`,
                  }}
                >
                  {bug.rank}
                </div>
              </div>

              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono bg-museum-wall/90 border border-museum-gold/30 text-museum-gold/70">
                {bug.museumNumber}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <h3 className="font-display text-lg font-bold text-museum-paper tracking-wide">
                    {bug.name}
                  </h3>
                  {bug.tagline && (
                    <p className="text-xs text-museum-gold/60 font-body italic mt-0.5 line-clamp-1">
                      「{bug.tagline}」
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
                      severityStyle.badge
                    )}
                  >
                    {severityLabels[bug.severity]}
                  </span>
                  <span className="text-[10px] font-mono text-museum-gold/50">
                    {rankLabels[bug.rank]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <MetricGauge
              icon={<Activity className="w-3.5 h-3.5" />}
              label="匹配度"
              value={matchScore * 100}
              color="#c9a962"
            />
            <MetricGauge
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
              label="危险度"
              value={dangerLevel}
              color={bug.severity === "high" ? "#ff6b6b" : bug.severity === "medium" ? "#ffa94d" : "#69db7c"}
              pulse={bug.severity === "high"}
            />
            <MetricGauge
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              label="复发率"
              value={bug.recurrenceRate}
              color="#74c0fc"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {bug.tags?.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-museum-gold/10 text-museum-gold/70 border border-museum-gold/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-all duration-300",
                isExpanded
                  ? "text-museum-gold"
                  : "text-museum-paper/40 group-hover:text-museum-gold"
              )}
            >
              {isExpanded ? (
                <>
                  <span className="text-xs">收起</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span className="text-xs">查看标本</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </div>
          </div>
        </div>

        <BugCardDetail
          matchResult={matchResult}
          isExpanded={isExpanded}
          onToggle={onToggle}
          className="bg-museum-wallLight/30 border-t border-museum-gold/20 px-5"
        />
      </div>
    </article>
  );
}

interface MetricGaugeProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  pulse?: boolean;
}

function MetricGauge({ icon, label, value, color, pulse }: MetricGaugeProps) {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-museum-paper/10"
          />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: pulse ? `drop-shadow(0 0 6px ${color})` : "none",
            }}
          />
        </svg>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            pulse && "animate-pulse"
          )}
        >
          <span style={{ color }} className="text-[11px] font-bold tabular-nums">
            {Math.round(value)}%
          </span>
        </div>
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <span className="text-[10px] text-museum-paper/50 mt-1.5 font-medium">
        {label}
      </span>
    </div>
  );
}
