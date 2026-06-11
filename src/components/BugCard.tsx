import { useState } from "react";
import {
  ChevronDown,
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
  Bug,
  Brain,
} from "lucide-react";
import type { BugMatchResult } from "../types/bug";
import { severityLabels } from "../types/bug";
import { cn } from "../lib/utils";
import { BugCardDetail } from "./BugCardDetail";
import { BrainSimulator } from "./BrainSimulator";

interface BugCardProps {
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
    badge: "bg-museum-gold/20 text-museum-gold border-museum-gold/30",
    dot: "bg-museum-gold",
    bar: "bg-museum-gold",
  },
  medium: {
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
  },
  high: {
    badge: "bg-museum-warning/20 text-museum-warningLight border-museum-warning/30",
    dot: "bg-museum-warning",
    bar: "bg-museum-warning",
  },
};

export function BugCard({
  matchResult,
  index,
  isExpanded,
  onToggle,
}: BugCardProps) {
  const { bug, matchScore } = matchResult;
  const IconComponent = bug.icon ? iconMap[bug.icon] || Bug : Bug;
  const styles = severityStyles[bug.severity];
  const [showSimulator, setShowSimulator] = useState(false);

  return (
    <article
      className={cn(
        "relative group animate-fade-up opacity-0",
        `stagger-delay-${Math.min(index + 1, 6)}`
      )}
      style={{ animationDelay: `${Math.min(index, 6) * 0.08}s` }}
    >
      <div
        className={cn(
          "relative rounded-2xl bg-paper-texture shadow-exhibit",
          "transition-all duration-400 ease-out cursor-pointer",
          "hover:shadow-exhibit-hover hover:-translate-y-1",
          isExpanded && "shadow-exhibit-hover"
        )}
        onClick={onToggle}
      >
        <span className="corner-decoration corner-decoration-tl" />
        <span className="corner-decoration corner-decoration-tr" />
        <span className="corner-decoration corner-decoration-bl" />
        <span className="corner-decoration corner-decoration-br" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "relative flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300",
                "bg-museum-wall/80 border border-museum-gold/30",
                "group-hover:bg-museum-wall group-hover:border-museum-gold/50"
              )}
            >
              <IconComponent className="w-7 h-7 text-museum-gold" />
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-museum-paper",
                  styles.dot
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <h3 className="font-display text-xl font-bold text-museum-ink tracking-wide">
                    {bug.name}
                  </h3>
                  {bug.tagline && (
                    <p className="text-xs text-museum-ink/60 font-body italic mt-0.5">
                      「{bug.tagline}」
                    </p>
                  )}
                  <p className="text-xs font-mono text-museum-inkLight/50 mt-0.5">
                    {bug.museumNumber}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                      styles.badge
                    )}
                  >
                    {severityLabels[bug.severity]}
                  </span>
                </div>
              </div>

              <p className="text-sm text-museum-inkLight font-body leading-relaxed mt-2 line-clamp-2">
                {bug.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-museum-inkLight/50 font-body">
                      匹配度
                    </span>
                    <div className="w-20 h-1.5 bg-museum-paperDark rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", styles.bar)}
                        style={{ width: `${matchScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-museum-inkLight tabular-nums">
                      {Math.round(matchScore * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSimulator(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-museum-gold/20 to-museum-gold/10 border border-museum-gold/40 text-museum-gold hover:from-museum-gold/30 hover:to-museum-gold/20 transition-all duration-300 text-xs font-medium group"
                  >
                    <Brain className="w-3.5 h-3.5 group-hover:animate-pulse" />
                    脑内模拟
                  </button>

                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium transition-all duration-300",
                      isExpanded
                        ? "text-museum-gold"
                        : "text-museum-inkLight/50 group-hover:text-museum-gold"
                    )}
                  >
                    {isExpanded ? "收起" : "查看详情"}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <BugCardDetail
            matchResult={matchResult}
            isExpanded={isExpanded}
            onToggle={onToggle}
          />
        </div>
      </div>

      {showSimulator && (
        <BrainSimulator bug={bug} onClose={() => setShowSimulator(false)} />
      )}
    </article>
  );
}
