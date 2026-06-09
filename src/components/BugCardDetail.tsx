import {
  AlertTriangle,
  Lightbulb,
  Quote,
  BookMarked,
  ChevronUp,
  MessageCircle,
  BrainCircuit,
  BookOpen,
  Zap,
  Tag,
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
          ? "max-h-[4000px] opacity-100"
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
            title="基本信息"
          >
            <div className="space-y-3">
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
              {bug.scientificName && (
                <p className="text-xs text-museum-ink/50 font-body italic">
                  心理学原名：{bug.scientificName}
                </p>
              )}
              {bug.alias && bug.alias.length > 0 && (
                <p className="text-sm text-museum-ink/60 font-body">
                  <span className="text-museum-ink/40">别名：</span>
                  <span className="italic">{bug.alias.join("、")}</span>
                </p>
              )}
              {bug.tags && bug.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {bug.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-museum-ink/5 text-museum-ink/60 border border-museum-ink/10"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </DetailSection>

          <DetailSection
            icon={<MessageCircle className="w-4 h-4" />}
            title="常见句子"
          >
            <ul className="space-y-2">
              {bug.commonPhrases.map((phrase, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Quote className="w-3.5 h-3.5 text-museum-gold/50 mt-1 flex-shrink-0" />
                  <p className="text-sm text-museum-ink/75 font-body leading-relaxed italic">
                    {phrase}
                  </p>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection
            icon={<Zap className="w-4 h-4" />}
            title="触发条件"
          >
            <div className="space-y-2">
              {bug.triggerConditions.map((trigger, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-museum-warning/5 border border-museum-warning/15"
                >
                  <p className="text-sm font-medium text-museum-warningLight mb-0.5">
                    {trigger.scenario}
                  </p>
                  {trigger.description && (
                    <p className="text-xs text-museum-ink/55 font-body leading-relaxed">
                      {trigger.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection
            icon={<BrainCircuit className="w-4 h-4" />}
            title="错误推理路径"
          >
            <div className="relative">
              {bug.reasoningPath.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-museum-gold/20 border-2 border-museum-gold/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-museum-goldDark">
                        {step.step}
                      </span>
                    </div>
                    {idx < bug.reasoningPath.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-museum-gold/30 to-museum-gold/10 my-1" />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-sm text-museum-ink/80 font-body leading-relaxed mb-1">
                      {step.thought}
                    </p>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-museum-warning/10 border border-museum-warning/20">
                      <span className="text-[10px] font-medium text-museum-warningLight">
                        ↯ 认知跳跃
                      </span>
                      <span className="text-xs text-museum-ink/60 font-body">
                        {step.cognitiveLeap}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection
            icon={<BookOpen className="w-4 h-4" />}
            title="现实案例"
          >
            <div className="space-y-3">
              {bug.realCases.map((caseItem, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-paper-texture/50 border border-museum-gold/15 relative overflow-hidden"
                >
                  <p className="text-sm font-semibold text-museum-ink mb-2 font-display tracking-wide">
                    📖 {caseItem.title}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[11px] font-medium text-museum-gold/80 mb-0.5">
                        背景
                      </p>
                      <p className="text-sm text-museum-ink/70 font-body leading-relaxed">
                        {caseItem.context}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-museum-gold/80 mb-0.5">
                        Bug 发作
                      </p>
                      <p className="text-sm text-museum-ink/70 font-body leading-relaxed">
                        {caseItem.bugManifestation}
                      </p>
                    </div>
                    {caseItem.consequence && (
                      <div>
                        <p className="text-[11px] font-medium text-museum-gold/80 mb-0.5">
                          后续
                        </p>
                        <p className="text-sm text-museum-ink/65 font-body leading-relaxed italic">
                          {caseItem.consequence}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>

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
