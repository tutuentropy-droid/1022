import { useState } from "react";
import { ChevronDown, ChevronUp, Zap, Brain, Heart, AlertCircle } from "lucide-react";
import type { ParticipantTriggerChain, ParticipantRole } from "../types/bug";
import { cn } from "../lib/utils";

interface TriggerChainViewerProps {
  chain: ParticipantTriggerChain;
  participantLabel: string;
}

const emotionColorMap: Record<string, { bg: string; border: string; text: string }> = {
  愤怒: { bg: "bg-rose-500/20", border: "border-rose-400/30", text: "text-rose-300" },
  受伤: { bg: "bg-purple-500/20", border: "border-purple-400/30", text: "text-purple-300" },
  被忽视: { bg: "bg-gray-500/20", border: "border-gray-400/30", text: "text-gray-300" },
  被攻击: { bg: "bg-red-500/20", border: "border-red-400/30", text: "text-red-300" },
  被误解: { bg: "bg-amber-500/20", border: "border-amber-400/30", text: "text-amber-300" },
  不被重视: { bg: "bg-orange-500/20", border: "border-orange-400/30", text: "text-orange-300" },
  焦虑: { bg: "bg-yellow-500/20", border: "border-yellow-400/30", text: "text-yellow-300" },
  挫败: { bg: "bg-blue-500/20", border: "border-blue-400/30", text: "text-blue-300" },
  平静: { bg: "bg-emerald-500/20", border: "border-emerald-400/30", text: "text-emerald-300" },
};

const getEmotionColor = (emotion: string) => {
  return emotionColorMap[emotion] || emotionColorMap["平静"];
};

const getParticipantGradient = (role: ParticipantRole) => {
  return role === "A"
    ? "from-blue-500/10 to-blue-600/5 border-blue-400/20"
    : "from-rose-500/10 to-rose-600/5 border-rose-400/20";
};

const getParticipantAccent = (role: ParticipantRole) => {
  return role === "A" ? "text-blue-400" : "text-rose-400";
};

export function TriggerChainViewer({ chain, participantLabel }: TriggerChainViewerProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const emotionColor = getEmotionColor(chain.dominantEmotion);

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 bg-gradient-to-br",
        getParticipantGradient(chain.participant)
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3
              className={cn(
                "font-display text-xl font-bold",
                getParticipantAccent(chain.participant)
              )}
            >
              {participantLabel} 的触发链
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                emotionColor.bg,
                emotionColor.border,
                emotionColor.text
              )}
            >
              <Heart className="w-3 h-3" />
              主导情绪：{chain.dominantEmotion}
            </span>
          </div>
          <p className="text-sm text-museum-paper/60">
            核心触发点：
            <span className="text-museum-gold font-medium">「{chain.primaryTrigger}」</span>
          </p>
        </div>
      </div>

      {chain.coreBugs.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs text-museum-paper/50 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Brain className="w-3.5 h-3.5" />
            识别到的认知 Bug
          </h4>
          <div className="flex flex-wrap gap-2">
            {chain.coreBugs.map((bugMatch, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-museum-gold/10 border border-museum-gold/20 text-museum-gold/90 text-xs"
              >
                <Bug className="w-3 h-3" />
                {bugMatch.bug.name}
                <span className="text-museum-gold/50">
                  {Math.round(bugMatch.matchScore * 100)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-xs text-museum-paper/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          情绪触发过程
        </h4>
        {chain.chain.map((node, index) => {
          const nodeEmotionColor = getEmotionColor(node.emotion);
          const isExpanded = expandedStep === index;

          return (
            <div
              key={index}
              className={cn(
                "relative rounded-xl border transition-all duration-300",
                "bg-museum-wallLight/20 border-museum-gold/10",
                isExpanded && "bg-museum-wallLight/40"
              )}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedStep(isExpanded ? null : index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2",
                          nodeEmotionColor.bg,
                          nodeEmotionColor.border,
                          nodeEmotionColor.text
                        )}
                      >
                        {node.step}
                      </div>
                      {index < chain.chain.length - 1 && (
                        <div
                          className={cn(
                            "w-0.5 flex-1 mt-1",
                            nodeEmotionColor.bg,
                            "opacity-40"
                          )}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                            nodeEmotionColor.bg,
                            nodeEmotionColor.text
                          )}
                        >
                          {node.emotion}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all",
                                i < node.emotionIntensity
                                  ? nodeEmotionColor.bg.replace("/20", "")
                                  : "bg-museum-paper/10"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-museum-paper/90 leading-relaxed">
                        「{node.content}」
                      </p>
                    </div>
                  </div>

                  <button className="text-museum-paper/40 hover:text-museum-paper/70 transition-colors flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-museum-gold/10 mt-0 pt-4">
                  <div className="grid gap-4">
                    {node.bug && (
                      <div className="p-3 rounded-lg bg-museum-gold/5 border border-museum-gold/15">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-museum-gold" />
                          <span className="text-xs font-medium text-museum-gold">
                            认知 Bug：{node.bug.name}
                          </span>
                        </div>
                        <p className="text-xs text-museum-paper/70 leading-relaxed">
                          {node.bug.description}
                        </p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-amber-400/80">
                          TA 的解读
                        </span>
                      </div>
                      <p className="text-sm text-museum-paper/80 leading-relaxed pl-6">
                        {node.interpretation}
                      </p>
                    </div>

                    {node.underlyingBelief && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-medium text-purple-400/80">
                            深层信念
                          </span>
                        </div>
                        <p className="text-sm text-museum-paper/80 leading-relaxed pl-6 italic">
                          「{node.underlyingBelief}」
                        </p>
                      </div>
                    )}

                    {node.triggers.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-rose-400" />
                          <span className="text-xs font-medium text-rose-400/80">
                            情绪触发点
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-6">
                          {node.triggers.map((trigger, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-rose-500/10 text-rose-300/80 border border-rose-400/20"
                            >
                              {trigger.keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Bug({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="8" y="6" width="8" height="14" rx="4" />
      <path d="M10.414 6L8 3.586A2 2 0 0110.828 1L12 2.172 13.172 1A2 2 0 0116 3.586L13.586 6" />
      <path d="M12 20v3" />
      <path d="M8 20H5" />
      <path d="M16 20h3" />
      <path d="M5 10H3" />
      <path d="M21 10h-2" />
      <path d="M5 14H3" />
      <path d="M21 14h-2" />
      <circle cx="10" cy="10" r="0.5" fill="currentColor" />
      <circle cx="14" cy="10" r="0.5" fill="currentColor" />
    </svg>
  );
}
