import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  RefreshCw,
  Wand2,
  ArrowRight,
  Heart,
  HeartCrack,
  Shield,
  Clock,
  RotateCcw,
  X,
  ArrowDown,
  Zap,
  Globe2,
} from "lucide-react";
import type {
  RelationshipFuturePath,
  RelationshipStep,
  RelationshipReplacementOption,
  RelationshipSimulationResult,
  RelationshipDebugResult,
  FuturePathType,
} from "../types/bug";
import { createRelationshipAnalyzer } from "../services/relationshipAnalyzer";
import bugsData from "../data/bugs.json";
import type { CognitiveBug } from "../types/bug";
import { cn } from "../lib/utils";

interface RelationshipFutureSimulatorProps {
  result: RelationshipDebugResult;
}

const toneConfig = {
  negative: {
    label: "风险路径",
    color: "text-museum-warningLight",
    bgColor: "bg-museum-warning/10",
    borderColor: "border-museum-warning/30",
    barColor: "bg-gradient-to-r from-museum-warning to-museum-warningLight",
  },
  neutral: {
    label: "中性路径",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    barColor: "bg-gradient-to-r from-amber-500 to-amber-400",
  },
  positive: {
    label: "积极路径",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    barColor: "bg-gradient-to-r from-emerald-500 to-emerald-400",
  },
};

const pathIcons: Record<FuturePathType, React.ReactNode> = {
  deterioration: <HeartCrack className="w-5 h-5" />,
  repair: <Heart className="w-5 h-5" />,
  drifting_apart: <Clock className="w-5 h-5" />,
  boundary_rebuild: <Shield className="w-5 h-5" />,
  stagnation: <Clock className="w-5 h-5" />,
};

export function RelationshipFutureSimulator({ result }: RelationshipFutureSimulatorProps) {
  const [simulation, setSimulation] = useState<RelationshipSimulationResult | null>(
    result.simulation || null
  );
  const [selectedPathId, setSelectedPathId] = useState<FuturePathType | null>(
    result.simulation?.selectedPathId || null
  );
  const [animatingIndex, setAnimatingIndex] = useState(-1);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showReplacements, setShowReplacements] = useState(false);
  const [isResimulating, setIsResimulating] = useState(false);
  const [isModified, setIsModified] = useState(false);

  const selectedPath = simulation?.paths.find((p) => p.id === selectedPathId) || null;

  useEffect(() => {
    if (result.simulation) {
      setSimulation(result.simulation);
      if (!selectedPathId) {
        setSelectedPathId(result.simulation.selectedPathId || null);
      }
    }
  }, [result.simulation]);

  useEffect(() => {
    if (selectedPath) {
      startAnimation(selectedPath.steps.length);
      setSelectedStepId(null);
      setShowReplacements(false);
    }
  }, [selectedPathId, selectedPath?.steps.length]);

  const startAnimation = useCallback((stepCount: number) => {
    setAnimatingIndex(-1);
    let current = -1;
    const interval = setInterval(() => {
      current++;
      if (current >= stepCount) {
        clearInterval(interval);
        return;
      }
      setAnimatingIndex(current);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  const handleStepClick = (step: RelationshipStep) => {
    if (step.isReplaceable && step.replacementOptions && !isModified) {
      setSelectedStepId(step.id);
      setShowReplacements(true);
    }
  };

  const handleReplace = (replacement: RelationshipReplacementOption) => {
    if (!selectedStepId || !selectedPath || !simulation) return;

    setShowReplacements(false);
    setIsResimulating(true);

    setTimeout(() => {
      const analyzer = createRelationshipAnalyzer(bugsData as CognitiveBug[]);
      const newSimulation = analyzer.resimulatePathWithReplacement(
        result,
        selectedPath.id,
        selectedStepId,
        replacement
      );

      if (newSimulation) {
        setSimulation(newSimulation);
        setIsModified(true);
      }

      setIsResimulating(false);
      setSelectedStepId(null);
    }, 700);
  };

  const handleReset = () => {
    setIsResimulating(true);
    setTimeout(() => {
      if (result.simulation) {
        setSimulation(result.simulation);
        setSelectedPathId(result.simulation.selectedPathId || null);
      }
      setIsModified(false);
      setSelectedStepId(null);
      setShowReplacements(false);
      setIsResimulating(false);
    }, 500);
  };

  if (!simulation) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-2 border-museum-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  const baselineHealth = simulation.baselineHealthScore;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-400/20">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/40 flex items-center justify-center">
                <Globe2 className="w-6 h-6 text-indigo-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-museum-gold flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-museum-ink" />
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-museum-paper mb-1">
                关系未来模拟器
              </h2>
              <p className="text-sm text-museum-paper/60 font-body">
                基于你们的互动模式，推演未来可能走向的 5 种路径
              </p>
            </div>
          </div>
          {isModified && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-museum-paper/5 border border-museum-paper/20 text-museum-paper/70 hover:bg-museum-paper/10 hover:text-museum-paper transition-all duration-200 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              重置模拟
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {simulation.paths.map((path) => {
            const isSelected = selectedPathId === path.id;
            const tone = toneConfig[path.overallTone];
            return (
              <button
                key={path.id}
                onClick={() => setSelectedPathId(path.id)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-300 text-left",
                  "hover:scale-[1.02]",
                  isSelected
                    ? cn(tone.bgColor, tone.borderColor, "scale-[1.02] shadow-lg")
                    : "bg-museum-wallLight/20 border-museum-gold/10 hover:border-museum-gold/30"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(isSelected ? tone.color : "text-museum-paper/50")}>
                    {pathIcons[path.id] || path.icon}
                  </span>
                  <span className="text-lg">{path.icon}</span>
                </div>
                <p className={cn(
                  "font-medium text-sm mb-1",
                  isSelected ? "text-museum-paper" : "text-museum-paper/70"
                )}>
                  {path.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs font-bold",
                    isSelected ? tone.color : "text-museum-paper/40"
                  )}>
                    {path.probability}%
                  </span>
                  <div className="w-12 h-1.5 rounded-full bg-museum-wall overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", tone.barColor)}
                      style={{ width: `${path.probability}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-museum-wallLight/20 border border-museum-gold/10">
          <div className="flex-shrink-0">
            <div className="text-[10px] text-museum-paper/50 font-medium mb-1 text-center">
              当前关系
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-museum-wallLight"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="url(#healthGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(baselineHealth / 100) * 176} 176`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b4543d" />
                    <stop offset="50%" stopColor="#c9a962" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-museum-paper">{baselineHealth}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 text-sm text-museum-paper/60 font-body leading-relaxed">
            以上概率不是「预言」，而是基于你们<b className="text-museum-gold/80">当前互动模式</b>的推演。
            就像天气预报——如果今天看到乌云，预报明天有雨是合理的。
            但<b className="text-emerald-400/80">如果你带了伞、改变了出门时间</b>，结果就会不一样。
          </div>
        </div>
      </div>

      {selectedPath && (
        <div
          className={cn(
            "relative transition-all duration-500",
            isResimulating && "opacity-50 blur-[1px] pointer-events-none"
          )}
        >
          <PathViewer
            path={selectedPath}
            baselineHealth={baselineHealth}
            animatingIndex={animatingIndex}
            selectedStepId={selectedStepId}
            onStepClick={handleStepClick}
            isModified={isModified}
          />
        </div>
      )}

      {selectedPath && (
        <div className={cn(
          "p-6 rounded-2xl border transition-all duration-500",
          toneConfig[selectedPath.overallTone].bgColor,
          toneConfig[selectedPath.overallTone].borderColor
        )}>
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", toneConfig[selectedPath.overallTone].bgColor)}>
              <Zap className={cn("w-5 h-5", toneConfig[selectedPath.overallTone].color)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className={cn(
                  "text-sm font-medium",
                  toneConfig[selectedPath.overallTone].color
                )}>
                  {selectedPath.name} · 最终结果
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-museum-paper/50">健康分:</span>
                  <span className={cn(
                    "font-bold",
                    selectedPath.relationshipHealthScore >= 60 ? "text-emerald-400" :
                    selectedPath.relationshipHealthScore >= 40 ? "text-amber-400" : "text-museum-warningLight"
                  )}>
                    {selectedPath.relationshipHealthScore}/100
                  </span>
                </div>
              </div>
              <p className="text-sm text-museum-paper/80 font-body leading-relaxed">
                {selectedPath.finalOutcome}
              </p>
            </div>
          </div>
        </div>
      )}

      {!isModified && (
        <div className="text-center py-2">
          <p className="text-xs text-museum-paper/40 font-body max-w-2xl mx-auto leading-relaxed">
            💡 提示：路径中带有 <span className="inline-flex items-center gap-1 text-museum-gold/80">✨高亮边框</span> 的节点是「可改写的互动时刻」。
            试着在那个瞬间，换一种表达方式、换一种回应方式——看看蝴蝶扇动翅膀后，未来会飞向哪里。
          </p>
        </div>
      )}

      {showReplacements && selectedStepId && selectedPath && (
        <ReplacementModal
          step={selectedPath.steps.find((s) => s.id === selectedStepId)!}
          onSelect={handleReplace}
          onClose={() => {
            setShowReplacements(false);
            setSelectedStepId(null);
          }}
        />
      )}

      {isResimulating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-museum-wall/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-museum-wallLight/50 border border-museum-gold/30">
            <div className="relative w-16 h-16">
              <RefreshCw className="w-8 h-8 text-museum-gold animate-spin absolute inset-0 m-auto" />
              <div className="absolute inset-0 rounded-full border-2 border-museum-gold/30 animate-ping" />
            </div>
            <p className="text-sm text-museum-paper/80 font-body">正在改写那个瞬间...</p>
            <p className="text-xs text-museum-paper/50 font-body">看，蝴蝶扇动了翅膀</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface PathViewerProps {
  path: RelationshipFuturePath;
  baselineHealth: number;
  animatingIndex: number;
  selectedStepId: string | null;
  onStepClick: (step: RelationshipStep) => void;
  isModified: boolean;
}

function PathViewer({
  path,
  animatingIndex,
  selectedStepId,
  onStepClick,
  isModified,
}: PathViewerProps) {
  const tone = toneConfig[path.overallTone];

  return (
    <div className="relative">
      <div className="mb-4 p-4 rounded-xl bg-museum-wallLight/20 border border-museum-gold/10">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{path.icon}</span>
          <div>
            <h3 className={cn("font-display text-lg font-bold mb-1", tone.color)}>
              {path.name}
            </h3>
            <p className="text-sm text-museum-paper/60 font-body leading-relaxed">
              {path.description}
            </p>
          </div>
        </div>
      </div>

      <div className="relative py-2">
        {path.steps.map((step, index) => {
          const isFirstInRound = index === 0 || path.steps[index - 1].round !== step.round;

          return (
            <div key={step.id}>
              {isFirstInRound && (
                <div className="flex items-center gap-2 my-5 pl-2">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold border",
                    tone.bgColor,
                    tone.borderColor,
                    tone.color
                  )}>
                    第 {step.round} 阶段
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-museum-gold/20 to-transparent" />
                </div>
              )}

              <StepNode
                step={step}
                index={index}
                isAnimating={animatingIndex >= index}
                isSelected={selectedStepId === step.id}
                onClick={() => onStepClick(step)}
                isModified={isModified}
                overallTone={path.overallTone}
              />

              {index < path.steps.length - 1 && (
                <div className="relative h-8 pl-10 md:pl-14">
                  <div className="absolute left-6 md:left-10 top-0 bottom-0 w-0.5 overflow-hidden">
                    <div
                      className={cn(
                        "w-full h-full transition-all duration-700",
                        animatingIndex > index
                          ? step.id.startsWith("modified") || step.id.startsWith("transformed")
                            ? "bg-gradient-to-b from-emerald-400/60 to-emerald-400/20"
                            : tone.barColor.replace("from-", "bg-gradient-to-b from-").replace("to-", "to-").replace("r ", "/60 ")
                          : "bg-transparent"
                      )}
                      style={{
                        transform: animatingIndex > index ? "translateY(0)" : "translateY(-100%)",
                      }}
                    />
                  </div>
                  {animatingIndex > index && (
                    <div className="absolute left-5 md:left-9 top-2 z-10">
                      <ArrowDown
                        className={cn(
                          "w-3 h-3 bounce-in",
                          step.id.startsWith("modified") || step.id.startsWith("transformed")
                            ? "text-emerald-400"
                            : tone.color
                        )}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StepNodeProps {
  step: RelationshipStep;
  index: number;
  isAnimating: boolean;
  isSelected: boolean;
  onClick: () => void;
  isModified: boolean;
  overallTone: "negative" | "neutral" | "positive";
}

function StepNode({
  step,
  index,
  isAnimating,
  isSelected,
  onClick,
  isModified,
  overallTone,
}: StepNodeProps) {
  const isTransformed = step.id.startsWith("modified") || step.id.startsWith("transformed");
  const isClickable = step.isReplaceable && !isModified && !isTransformed;

  const speakerColors = {
    A: {
      bg: "bg-sky-500/15",
      border: "border-sky-400/40",
      text: "text-sky-300",
      avatar: "from-sky-500/30 to-sky-500/10",
    },
    B: {
      bg: "bg-rose-500/15",
      border: "border-rose-400/40",
      text: "text-rose-300",
      avatar: "from-rose-500/30 to-rose-500/10",
    },
  };

  const sc = speakerColors[step.speaker];

  const transformBg = "bg-gradient-to-br from-emerald-500/20 to-teal-500/10";
  const transformBorder = "border-emerald-400/50";

  return (
    <div
      className={cn(
        "pl-10 md:pl-14 transition-all duration-500",
        !isAnimating && "opacity-0 translate-y-4",
        isAnimating && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div
        onClick={isClickable ? onClick : undefined}
        className={cn(
          "relative rounded-2xl p-4 border-2 transition-all duration-300",
          isTransformed ? transformBg : sc.bg,
          isTransformed ? transformBorder : sc.border,
          isClickable && "cursor-pointer hover:scale-[1.01] hover:shadow-lg",
          isSelected && "ring-2 ring-museum-gold ring-offset-2 ring-offset-museum-wall scale-[1.01]",
          !isClickable && !isTransformed && overallTone === "positive" && "border-emerald-400/30"
        )}
      >
        {isClickable && (
          <>
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-museum-gold to-museum-goldLight border border-museum-gold/50 text-[10px] font-bold text-museum-ink sparkle">
              ✨ 可改写
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-museum-gold/0 hover:border-museum-gold/40 transition-all duration-300 pointer-events-none pulse-ring" />
          </>
        )}

        {isTransformed && (
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg sparkle z-10">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="flex items-start gap-3">
          <div
            className={cn(
              "relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              "bg-gradient-to-br border",
              isTransformed ? "from-emerald-500/30 to-emerald-500/10 border-emerald-400/40" : sc.avatar,
              isTransformed ? "border-emerald-400/40" : sc.border
            )}
          >
            <span className={cn("font-bold text-sm md:text-base", sc.text)}>
              {step.speakerName.slice(0, 1)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border",
                sc.bg,
                sc.border,
                sc.text
              )}>
                {step.speakerName} · 第 {index + 1} 步
              </span>
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                isTransformed
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-museum-gold/15 text-museum-gold/80 border border-museum-gold/25"
              )}>
                {step.mechanism}
              </span>
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                step.emotionIntensity >= 7
                  ? "bg-museum-warning/20 text-museum-warningLight border border-museum-warning/30"
                  : step.emotionIntensity >= 5
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
              )}>
                {step.emotion}
                <span className="opacity-60">·{step.emotionIntensity}</span>
              </span>
            </div>

            <p className={cn(
              "text-base md:text-lg font-medium mb-2 leading-relaxed",
              isTransformed ? "text-emerald-100" : "text-museum-paper"
            )}>
              "{step.action}"
            </p>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-museum-wall/40 border border-museum-gold/5">
              <span className="text-xs text-museum-gold/60 flex-shrink-0 mt-0.5">内心解读：</span>
              <p className={cn(
                "text-xs md:text-sm font-body leading-relaxed",
                isTransformed ? "text-emerald-200/80" : "text-museum-paper/60"
              )}>
                {step.interpretation}
              </p>
            </div>

            {isClickable && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-museum-gold/80 font-body">
                <Wand2 className="w-3.5 h-3.5" />
                点击改写这个互动瞬间
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReplacementModalProps {
  step: RelationshipStep;
  onSelect: (option: RelationshipReplacementOption) => void;
  onClose: () => void;
}

function ReplacementModal({ step, onSelect, onClose }: ReplacementModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in opacity-0">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bounce-in">
        <div className="rounded-3xl bg-gradient-to-br from-museum-wallLight to-museum-wall border border-museum-gold/30 p-6 md:p-8 shadow-2xl relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-museum-gold to-museum-goldLight flex items-center gap-2 shadow-lg">
            <Wand2 className="w-4 h-4 text-museum-ink" />
            <span className="text-sm font-bold text-museum-ink">改写这个瞬间</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center text-museum-paper/50 hover:text-museum-paper hover:bg-museum-paper/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mt-6 mb-6">
            <p className="text-[11px] text-museum-warningLight/70 font-medium mb-1.5 tracking-wide">
              ⚠️ 如果保持原样，会这样发展
            </p>
            <div className="p-4 rounded-xl bg-museum-warning/10 border border-museum-warning/30">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-museum-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HeartCrack className="w-4.5 h-4.5 text-museum-warningLight" />
                </div>
                <div>
                  <p className="text-sm text-museum-paper font-medium mb-1 line-through opacity-60">
                    "{step.action}"
                  </p>
                  <p className="text-xs text-museum-paper/50 font-body leading-relaxed">
                    → {step.interpretation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <p className="text-sm font-medium text-emerald-300">
              换一种回应方式，选择一个「替代剧本」：
            </p>
          </div>

          <div className="space-y-3">
            {step.replacementOptions?.map((option, idx) => (
              <button
                key={option.id}
                onClick={() => onSelect(option)}
                className={cn(
                  "w-full text-left p-5 rounded-2xl border-2 transition-all duration-300",
                  "bg-gradient-to-br from-emerald-500/15 to-teal-500/5",
                  "border-emerald-400/30 hover:border-emerald-400/60",
                  "hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/10",
                  "group"
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-xl">{["💬", "💭", "🫶"][idx % 3]}</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                      {idx + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-base md:text-lg text-museum-paper font-medium mb-2 group-hover:text-emerald-200 transition-colors leading-relaxed">
                      "{option.content}"
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-emerald-400/70">内心：</span>
                        <span className="text-museum-paper/70 font-body">{option.interpretation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={cn(
                          "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px]",
                          option.emotionIntensity >= 5
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        )}>
                          {option.emotion} · {option.emotionIntensity}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-museum-wall/40 border border-emerald-400/10">
                      <LightbulbIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-museum-paper/60 font-body leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-emerald-400/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-3" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-museum-gold/10 border border-museum-gold/20">
              <span className="text-lg">🦋</span>
              <p className="text-xs text-museum-gold/80 font-body">
                选择一个回应，看看蝴蝶扇动翅膀后，未来的路径会怎样分叉
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LightbulbIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}
