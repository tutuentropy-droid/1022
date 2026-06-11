import { TrendingUp, ArrowRight, Zap } from "lucide-react";
import type { EscalationStep, ParticipantRole } from "../types/bug";
import { cn } from "../lib/utils";

interface EscalationPathViewerProps {
  steps: EscalationStep[];
  participantAName: string;
  participantBName: string;
}

const mechanismColors: Record<string, { bg: string; border: string; text: string }> = {
  "以牙还牙": { bg: "bg-rose-500/20", border: "border-rose-400/30", text: "text-rose-300" },
  "上纲上线": { bg: "bg-amber-500/20", border: "border-amber-400/30", text: "text-amber-300" },
  "揣测动机": { bg: "bg-purple-500/20", border: "border-purple-400/30", text: "text-purple-300" },
  "灾难化": { bg: "bg-red-500/20", border: "border-red-400/30", text: "text-red-300" },
  "防御反击": { bg: "bg-orange-500/20", border: "border-orange-400/30", text: "text-orange-300" },
  "冷战回避": { bg: "bg-gray-500/20", border: "border-gray-400/30", text: "text-gray-300" },
  "指责推诿": { bg: "bg-rose-600/20", border: "border-rose-500/30", text: "text-rose-400" },
  "否定感受": { bg: "bg-blue-500/20", border: "border-blue-400/30", text: "text-blue-300" },
  "情绪传递": { bg: "bg-yellow-500/20", border: "border-yellow-400/30", text: "text-yellow-300" },
};

const getMechanismColor = (mechanism: string) => {
  return mechanismColors[mechanism] || mechanismColors["情绪传递"];
};

const getSpeakerStyle = (speaker: ParticipantRole) => {
  return speaker === "A"
    ? {
        avatar: "bg-blue-500/20 text-blue-300 border-blue-400/30",
        label: "text-blue-400",
      }
    : {
        avatar: "bg-rose-500/20 text-rose-300 border-rose-400/30",
        label: "text-rose-400",
      };
};

export function EscalationPathViewer({
  steps,
  participantAName,
  participantBName,
}: EscalationPathViewerProps) {
  if (steps.length === 0) {
    return (
      <div className="rounded-2xl border border-museum-gold/20 bg-museum-wallLight/20 p-8 text-center">
        <TrendingUp className="w-10 h-10 text-museum-gold/50 mx-auto mb-3" />
        <p className="text-museum-paper/50 text-sm">未检测到明显的冲突升级路径</p>
      </div>
    );
  }

  const totalEscalation = steps.reduce((sum, s) => sum + Math.max(0, s.intensityChange), 0);
  const isHighEscalation = totalEscalation > 5;

  const getSpeakerName = (speaker: ParticipantRole) => {
    return speaker === "A" ? participantAName || "A" : participantBName || "B";
  };

  return (
    <div className="rounded-2xl border border-museum-gold/20 bg-gradient-to-br from-museum-wallLight/30 to-museum-wallDark/40 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display text-xl font-bold text-museum-paper">
              冲突升级路径
            </h3>
            {isHighEscalation && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-400/30">
                <Zap className="w-3 h-3" />
                快速升温
              </span>
            )}
          </div>
          <p className="text-sm text-museum-paper/60">
            看看情绪是如何在 {steps.length} 轮互动中逐步升级的
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-museum-gold">+{Math.round(totalEscalation)}</div>
          <div className="text-xs text-museum-paper/50">情绪强度累计上升</div>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const mechanismColor = getMechanismColor(step.mechanism);
          const speakerStyle = getSpeakerStyle(step.speaker);

          return (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-full w-0.5 h-4 bg-gradient-to-b from-museum-gold/40 to-transparent" />
              )}

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                      speakerStyle.avatar
                    )}
                  >
                    {step.step}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-sm font-medium", speakerStyle.label)}>
                      {getSpeakerName(step.speaker)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-museum-paper/30" />
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                        mechanismColor.bg,
                        mechanismColor.border,
                        mechanismColor.text
                      )}
                    >
                      {step.mechanism}
                    </span>
                    {step.intensityChange > 0 && (
                      <span className="text-xs text-rose-400 font-medium">
                        +{step.intensityChange}
                      </span>
                    )}
                    {step.intensityChange < 0 && (
                      <span className="text-xs text-emerald-400 font-medium">
                        {step.intensityChange}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-museum-wallLight/20 border border-museum-gold/10">
                      <div className="text-[10px] text-museum-paper/40 uppercase tracking-wider mb-1">
                        触发行为（对方说/做的）
                      </div>
                      <p className="text-sm text-museum-paper/80 leading-relaxed">
                        「{step.action}」
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-museum-wallLight/30 border border-museum-gold/15">
                      <div className="text-[10px] text-museum-paper/40 uppercase tracking-wider mb-1">
                        TA 的反应
                      </div>
                      <p className="text-sm text-museum-paper/90 leading-relaxed">
                        「{step.reaction}」
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-museum-gold/5 border border-museum-gold/20">
        <h4 className="text-xs text-museum-gold/80 uppercase tracking-wider mb-2 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          系统洞察
        </h4>
        <p className="text-sm text-museum-paper/70 leading-relaxed">
          每一次升级都不是单方面的「谁失控了」，而是双方的反应在互相喂养。
          {isHighEscalation
            ? "这个案例中，情绪强度在短时间内快速上升，说明双方都有敏感的「情绪按钮」被连续触碰到了。"
            : "这个案例中的升级相对温和，但如果没有觉察，也可能发展成更严重的冲突。"}
        </p>
      </div>
    </div>
  );
}
