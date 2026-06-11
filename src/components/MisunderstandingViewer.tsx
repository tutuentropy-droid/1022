import { Eye, EyeOff, RefreshCw, Lightbulb } from "lucide-react";
import type { MisunderstandingFormation } from "../types/bug";
import { cn } from "../lib/utils";

interface MisunderstandingViewerProps {
  misunderstanding: MisunderstandingFormation;
  participantAName: string;
  participantBName: string;
}

export function MisunderstandingViewer({
  misunderstanding,
  participantAName,
  participantBName,
}: MisunderstandingViewerProps) {
  const nameA = participantAName || "A";
  const nameB = participantBName || "B";

  return (
    <div className="rounded-2xl border border-museum-gold/20 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-display text-xl font-bold text-museum-paper">
            误解是如何形成的
          </h3>
        </div>
        <p className="text-sm text-museum-paper/60">
          从系统视角看，误解通常不是谁故意的，而是信息在传递过程中被「扭曲」了
        </p>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-museum-wallLight/30 border border-museum-gold/15">
        <div className="flex items-center gap-2 mb-2">
          <EyeOff className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">
            误解的起源
          </span>
        </div>
        <p className="text-sm text-museum-paper/80 leading-relaxed">
          {misunderstanding.origin}
        </p>
      </div>

      {misunderstanding.points.length > 0 && (
        <div className="space-y-4 mb-6">
          <h4 className="text-xs text-museum-paper/50 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            关键误解节点
          </h4>
          {misunderstanding.points.map((point, index) => (
            <div
              key={point.id}
              className="relative p-4 rounded-xl border border-museum-gold/10 bg-museum-wallLight/20"
            >
              <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-museum-wall border border-museum-gold/20 text-[10px] text-museum-gold font-medium">
                节点 {index + 1}
              </div>

              <div className="grid gap-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
                    <div className="text-[10px] text-blue-400/70 uppercase tracking-wider mb-1">
                      {nameA} 说的是
                    </div>
                    <p className="text-sm text-blue-300/90 leading-relaxed">
                      「{point.whatASaid}」
                    </p>
                    <div className="mt-2 pt-2 border-t border-blue-400/10">
                      <div className="text-[10px] text-blue-400/50 mb-0.5">TA 真正想表达的</div>
                      <p className="text-xs text-blue-300/70">{point.whatAIntended}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-400/20">
                    <div className="text-[10px] text-rose-400/70 uppercase tracking-wider mb-1">
                      {nameB} 听到的是
                    </div>
                    <p className="text-sm text-rose-300/90 leading-relaxed">
                      「{point.whatBHeard}」
                    </p>
                    <div className="mt-2 pt-2 border-t border-rose-400/10">
                      <div className="text-[10px] text-rose-400/50 mb-0.5">TA 回应的是</div>
                      <p className="text-xs text-rose-300/70">{point.whatBResponded}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/20">
                  <div className="flex items-center gap-2 mb-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-amber-400/80">
                      信息是怎么被扭曲的
                    </span>
                  </div>
                  <p className="text-sm text-amber-300/80 leading-relaxed">
                    {point.distortion}
                  </p>
                  {point.missingContext && (
                    <p className="text-xs text-amber-300/60 mt-2 italic">
                      💡 {point.missingContext}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-400/20">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-medium text-rose-400/80 uppercase tracking-wider">
              恶性循环
            </span>
          </div>
          <p className="text-sm text-rose-300/80 leading-relaxed">
            {misunderstanding.reinforcementLoop}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider">
              换个角度看
            </span>
          </div>
          <p className="text-sm text-emerald-300/80 leading-relaxed italic">
            「{misunderstanding.alternativeInterpretation}」
          </p>
        </div>
      </div>
    </div>
  );
}
