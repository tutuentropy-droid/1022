import {
  AlertTriangle,
  Lightbulb,
  Quote,
  BookMarked,
  ChevronUp,
} from "lucide-react";
import type { CognitiveBug, BugMatchResult } from "../types/bug";
import { categoryLabels, severityLabels } from "../types/bug";
import { cn } from "../lib/utils";

interface BugCardDetailProps {
  matchResult: BugMatchResult;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

const severityStyles = {
  low: "bg-museum-gold/20 text-museum-gold border-museum-gold/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-museum-warning/20 text-museum-warningLight border-museum-warning/30",
};

export function BugCardDetail({
  matchResult,
  isExpanded,
  onToggle,
  className,
}: BugCardDetailProps) {
  const { bug, matchedKeywords, matchReason } = matchResult;

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-500 ease-out",
        isExpanded
          ? "max-h-[2000px] opacity-100"
          : "max-h-0 opacity-0"
      )}
    >
      <div className={cn("pt-4", className)}>
        <div className="border-t border-museum-gold/20 pt-4 space-y-5">
          {matchReason && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-museum-wall/5 border border-museum-gold/20">
              <AlertTriangle className="w-5 h-5 text-museum-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-museum-gold mb-1">
                  匹配依据
                </p>
                <p className="text-sm text-museum-ink/75 font-body leading-relaxed">
                  {matchReason}
                </p>
                {matchedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {matchedKeywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-museum-gold/15 text-museum-gold border border-museum-gold/30"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DetailSection
            icon={<BookMarked className="w-4 h-4" />}
            title="分类与严重度"
          >
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-museum-wall/10 text-museum-ink/70 border border-museum-ink/10">
                {categoryLabels[bug.category]}
              </span>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border",
                  severityStyles[bug.severity]
                )}
              >
                {severityLabels[bug.severity]}影响
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono text-museum-inkLight bg-museum-ink/5">
                藏品编号 {bug.museumNumber}
              </span>
            </div>
          </DetailSection>

          {bug.alias && bug.alias.length > 0 && (
            <DetailSection icon={<Quote className="w-4 h-4" />} title="别名">
              <p className="text-sm text-museum-ink/70 font-body italic">
                {bug.alias.join("、")}
              </p>
            </DetailSection>
          )}

          <DetailSection icon={<AlertTriangle className="w-4 h-4" />} title="典型表现">
            <ul className="space-y-2">
              {bug.examples.map((example, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-museum-gold/60 mt-1">•</span>
                  <p className="text-sm text-museum-ink/75 font-body leading-relaxed">
                    <span className="text-museum-ink/30">「</span>
                    {example}
                    <span className="text-museum-ink/30">」</span>
                  </p>
                </li>
              ))}
            </ul>
          </DetailSection>

          {bug.triggers && bug.triggers.length > 0 && (
            <DetailSection
              icon={<AlertTriangle className="w-4 h-4" />}
              title="常见触发场景"
            >
              <div className="flex flex-wrap gap-2">
                {bug.triggers.map((trigger, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-museum-warning/10 text-museum-warningLight/80 border border-museum-warning/20"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          <DetailSection icon={<Lightbulb className="w-4 h-4" />} title="应对策略">
            <ul className="space-y-2.5">
              {bug.coping.map((strategy, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-museum-gold/20 flex items-center justify-center text-museum-goldDark text-xs font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-museum-ink/80 font-body leading-relaxed">
                    {strategy}
                  </p>
                </li>
              ))}
            </ul>
          </DetailSection>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="w-full pt-2 flex items-center justify-center gap-1.5 text-museum-gold/60 hover:text-museum-gold transition-colors duration-200 text-sm font-body"
          >
            <ChevronUp className="w-4 h-4" />
            收起详情
          </button>
        </div>
      </div>
    </div>
  );
}

interface DetailSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function DetailSection({ icon, title, children }: DetailSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-museum-gold">{icon}</span>
        <h4 className="text-sm font-semibold text-museum-ink font-display tracking-wide">
          {title}
        </h4>
        <div className="flex-1 h-px bg-gradient-to-r from-museum-gold/30 to-transparent" />
      </div>
      {children}
    </div>
  );
}

export type { CognitiveBug };
