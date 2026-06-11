import { useState } from "react";
import {
  Sparkles,
  Repeat,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useRelationshipMapStore } from "../store/useRelationshipMapStore";
import type { RelationshipCategory } from "../types/relationshipMap";
import {
  relationshipCategoryLabels,
  relationshipCategoryColors,
  commonRelationshipPatterns,
} from "../types/relationshipMap";

interface PatternViewerProps {
  limit?: number;
  category?: RelationshipCategory;
}

export function PatternViewer({ limit = 5, category }: PatternViewerProps) {
  const { getPatternFrequencies, getCategoryStats } = useRelationshipMapStore();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "byCategory">("all");

  const patterns = getPatternFrequencies({ category });
  const displayPatterns = patterns.slice(0, limit);
  const categoryStats = getCategoryStats();

  const getPatternInfo = (patternName: string) => {
    return commonRelationshipPatterns.find((p) => p.name === patternName);
  };

  const totalPatternOccurrences = patterns.reduce((sum, p) => sum + p.count, 0);

  if (patterns.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/10">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-museum-gold/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-museum-gold/40" />
          </div>
          <p className="text-museum-paper/50 font-body text-sm">
            还没有检测到重复模式
          </p>
          <p className="text-museum-paper/30 text-xs mt-2">
            多记录几次互动，系统会自动识别你的关系模式
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-museum-wallLight/50 to-museum-wall/30 border border-museum-gold/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-museum-gold/20 to-museum-gold/5 border border-museum-gold/30 flex items-center justify-center">
            <Repeat className="w-5 h-5 text-museum-gold" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-museum-paper">
              高频触发模式
            </h3>
            <p className="text-xs text-museum-paper/50 font-body">
              你在不同关系中重复出现的互动模式
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-museum-paper/40">
          <span>共 {totalPatternOccurrences} 次触发</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            activeTab === "all"
              ? "bg-museum-gold/20 text-museum-gold border border-museum-gold/30"
              : "text-museum-paper/50 hover:text-museum-paper/70"
          )}
        >
          总览
        </button>
        <button
          onClick={() => setActiveTab("byCategory")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            activeTab === "byCategory"
              ? "bg-museum-gold/20 text-museum-gold border border-museum-gold/30"
              : "text-museum-paper/50 hover:text-museum-paper/70"
          )}
        >
          按关系分类
        </button>
      </div>

      {activeTab === "all" ? (
        <div className="space-y-3">
          {displayPatterns.map((pattern, index) => {
            const patternInfo = getPatternInfo(pattern.patternName);
            const percentage = totalPatternOccurrences > 0
              ? Math.round((pattern.count / totalPatternOccurrences) * 100)
              : 0;

            return (
              <div
                key={pattern.patternName}
                className={cn(
                  "relative p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                  "bg-museum-wall/40 hover:bg-museum-wall/60",
                  "border-museum-gold/10 hover:border-museum-gold/30",
                  selectedPattern === pattern.patternName && "ring-2 ring-museum-gold/30"
                )}
                onClick={() =>
                  setSelectedPattern(
                    selectedPattern === pattern.patternName
                      ? null
                      : pattern.patternName
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-museum-gold/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">{patternInfo?.icon || "🔄"}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-museum-paper text-sm">
                        {pattern.patternName}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-museum-gold/20 text-museum-gold">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-museum-wallLight overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-museum-gold to-museum-goldLight transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-museum-gold w-10 text-right">
                        {pattern.count} 次
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="text-2xl font-bold text-museum-paper/20">
                      {percentage}%
                    </span>
                  </div>
                </div>

                {selectedPattern === pattern.patternName && (
                  <div className="mt-4 pt-4 border-t border-museum-gold/10 animate-fade-in">
                    {patternInfo?.description && (
                      <p className="text-sm text-museum-paper/60 font-body mb-3">
                        {patternInfo.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-museum-gold/60" />
                      <span className="text-xs text-museum-paper/50">
                        出现在以下关系类型中：
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {pattern.relationshipCategories.map((cat) => {
                        const colors = relationshipCategoryColors[cat];
                        return (
                          <span
                            key={cat}
                            className={cn(
                              "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium border",
                              colors.bg,
                              colors.border,
                              colors.text
                            )}
                          >
                            {relationshipCategoryLabels[cat]}
                          </span>
                        );
                      })}
                    </div>

                    {patternInfo && patternInfo.bugKeywords.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] text-museum-paper/40 mb-2">
                          典型表现：
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {patternInfo.bugKeywords.slice(0, 5).map((kw) => (
                            <span
                              key={kw}
                              className="px-1.5 py-0.5 rounded bg-museum-warning/10 text-museum-warningLight/70 text-[10px] border border-museum-warning/20"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {categoryStats.map((stat) => {
            if (stat.topPatterns.length === 0) return null;
            const colors = relationshipCategoryColors[stat.category];

            return (
              <div
                key={stat.category}
                className={cn(
                  "p-4 rounded-xl border",
                  colors.bg,
                  colors.border
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("font-medium text-sm", colors.text)}>
                    {relationshipCategoryLabels[stat.category]}
                  </span>
                  <span className="text-xs text-museum-paper/40">
                    · {stat.totalInteractions} 次互动
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {stat.topPatterns.slice(0, 3).map((p) => (
                    <span
                      key={p.patternName}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-museum-wall/30 text-museum-paper/70 text-xs border border-museum-gold/10"
                    >
                      <span className="font-bold text-museum-gold">{p.count}</span>
                      <span>{p.patternName}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-museum-gold/10">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-museum-gold/60 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-museum-paper/40 font-body leading-relaxed">
            💡 模式本身没有好坏之分，它们是你大脑的「快捷方式」。
            觉察是改变的第一步——看见这些重复模式，你就有了选择不同回应方式的能力。
          </p>
        </div>
      </div>
    </div>
  );
}
