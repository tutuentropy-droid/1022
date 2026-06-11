import { useState } from "react";
import { User, ChevronDown, ChevronUp, Sparkles, Sliders } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import {
  ARCHETYPES,
  DIMENSION_NAMES,
  DIMENSION_LABELS,
  getDimensionLevel,
  getDimensionLevelLabel,
} from "../types/personality";
import type { PersonalityArchetype, BigFiveDimension } from "../types/personality";
import { cn } from "../lib/utils";

export function PersonalitySelector() {
  const {
    personalityProfile,
    selectedArchetype,
    setPersonalityArchetype,
    setPersonalityDimension,
  } = useAppStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showCustomSliders, setShowCustomSliders] = useState(false);

  const currentArchetype = ARCHETYPES[selectedArchetype];

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in opacity-0 stagger-delay-1">
      <div
        className={cn(
          "rounded-2xl border transition-all duration-300 overflow-hidden",
          "bg-museum-wallLight/20 border-museum-gold/20",
          isExpanded && "shadow-lg"
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-museum-gold/5 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-museum-gold/15 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-museum-gold" />
            </div>
            <div className="text-left">
              <p className="text-xs text-museum-gold/70 font-body tracking-wide mb-0.5">
                人格档案
              </p>
              <p className="font-display text-museum-paper text-base">
                {currentArchetype.name}
                <span className="text-museum-paper/50 font-body text-sm ml-2">
                  「{currentArchetype.tagline}」
                </span>
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-museum-gold/60 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-museum-gold/60 flex-shrink-0" />
          )}
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-500 ease-out",
            isExpanded
              ? "max-h-[5000px] opacity-100"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 pb-4 space-y-4">
            <div className="pt-2 border-t border-museum-gold/15">
              <p className="text-xs text-museum-paper/50 font-body mb-3 leading-relaxed">
                {currentArchetype.description}
              </p>

              <div className="space-y-1.5 mb-4">
                {(Object.keys(DIMENSION_NAMES) as BigFiveDimension[]).map((dim) => {
                  const value = personalityProfile.dimensions[dim];
                  const level = getDimensionLevel(value);
                  const labels = DIMENSION_LABELS[dim];
                  return (
                    <div key={dim} className="flex items-center gap-2">
                      <span className="text-xs text-museum-paper/60 font-body w-14 flex-shrink-0">
                        {DIMENSION_NAMES[dim]}
                      </span>
                      <div className="flex-1 h-1.5 bg-museum-paper/10 rounded-full overflow-hidden relative">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            level === "high"
                              ? "bg-gradient-to-r from-museum-gold to-amber-400"
                              : level === "low"
                              ? "bg-gradient-to-r from-sky-400 to-museum-gold/50"
                              : "bg-museum-gold/50"
                          )}
                          style={{ width: `${Math.round(value * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-museum-paper/40 font-body w-16 text-right flex-shrink-0">
                        {level === "high" ? labels.high : level === "low" ? labels.low : "中等"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-museum-gold/15">
              <p className="text-xs text-museum-gold/70 font-body tracking-wide mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                选择你的人格原型
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  Object.keys(ARCHETYPES) as PersonalityArchetype[]
                ).map((archetypeId) => {
                  const archetype = ARCHETYPES[archetypeId];
                  const isSelected = selectedArchetype === archetypeId;
                  return (
                    <button
                      key={archetypeId}
                      onClick={() => {
                        setPersonalityArchetype(archetypeId);
                        if (archetypeId === "custom") {
                          setShowCustomSliders(true);
                        } else {
                          setShowCustomSliders(false);
                        }
                      }}
                      className={cn(
                        "p-3 rounded-xl text-left transition-all duration-200",
                        "border",
                        isSelected
                          ? "bg-museum-gold/15 border-museum-gold/50 shadow-inner"
                          : "bg-museum-wallLight/10 border-museum-gold/10 hover:bg-museum-gold/5 hover:border-museum-gold/30"
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm font-display mb-0.5",
                          isSelected ? "text-museum-gold" : "text-museum-paper/80"
                        )}
                      >
                        {archetype.name}
                      </p>
                      <p className="text-[10px] text-museum-paper/40 font-body leading-snug">
                        {archetype.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {(showCustomSliders || selectedArchetype === "custom") && (
              <div className="pt-3 border-t border-museum-gold/15">
                <p className="text-xs text-museum-gold/70 font-body tracking-wide mb-3 flex items-center gap-1.5">
                  <Sliders className="w-3 h-3" />
                  自定义人格维度
                </p>
                <div className="space-y-4">
                  {(Object.keys(DIMENSION_NAMES) as BigFiveDimension[]).map((dim) => {
                    const value = personalityProfile.dimensions[dim];
                    const level = getDimensionLevel(value);
                    const labels = DIMENSION_LABELS[dim];
                    return (
                      <div key={dim}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-museum-paper/70 font-body">
                            {DIMENSION_NAMES[dim]}
                          </span>
                          <span className="text-[10px] text-museum-paper/50 font-body">
                            {getDimensionLevelLabel(dim, level)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-museum-paper/40 font-body w-12 text-right flex-shrink-0">
                            {labels.low}
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={value}
                            onChange={(e) =>
                              setPersonalityDimension(dim, parseFloat(e.target.value))
                            }
                            className="flex-1 h-1.5 accent-museum-gold cursor-pointer"
                          />
                          <span className="text-[10px] text-museum-paper/40 font-body w-12 flex-shrink-0">
                            {labels.high}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-museum-gold/15">
              <p className="text-[11px] text-museum-gold/60 font-body mb-2 tracking-wide">
                你的易感模式：
              </p>
              <ul className="space-y-1">
                {currentArchetype.vulnerabilityPatterns.map((pattern, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-museum-paper/50 font-body leading-relaxed"
                  >
                    <span className="text-museum-gold/50 mt-0.5">•</span>
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
