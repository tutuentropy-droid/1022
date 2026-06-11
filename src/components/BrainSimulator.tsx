import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Wand2,
  X,
  RotateCcw,
  Lightbulb,
} from "lucide-react";
import type { CognitiveBug, SimulationNode, SimulationResult, ReplacementOption } from "../types/bug";
import { nodeTypeLabels, nodeTypeColors } from "../types/bug";
import { cn } from "../lib/utils";
import { createSimulation, resimulate } from "../services/simulationBuilder";

interface BrainSimulatorProps {
  bug: CognitiveBug;
  onClose: () => void;
}

export function BrainSimulator({ bug, onClose }: BrainSimulatorProps) {
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [originalNodes, setOriginalNodes] = useState<SimulationNode[]>([]);
  const [animatingIndex, setAnimatingIndex] = useState(-1);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [showReplacements, setShowReplacements] = useState(false);
  const [isReSimulating, setIsReSimulating] = useState(false);

  useEffect(() => {
    const result = createSimulation(bug);
    setOriginalNodes(result.nodes);
    setSimulationResult(result);
    startAnimation(result.nodes.length);
  }, [bug]);

  const startAnimation = useCallback((nodeCount: number) => {
    setAnimatingIndex(-1);
    let current = -1;
    const interval = setInterval(() => {
      current++;
      if (current >= nodeCount) {
        clearInterval(interval);
        return;
      }
      setAnimatingIndex(current);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleNodeClick = (index: number) => {
    if (!simulationResult) return;
    const node = simulationResult.nodes[index];
    if (node.isReplaceable && !simulationResult.isModified) {
      setSelectedNodeIndex(index);
      setShowReplacements(true);
    }
  };

  const handleReplace = (replacement: ReplacementOption) => {
    if (selectedNodeIndex === null || !simulationResult) return;

    setShowReplacements(false);
    setIsReSimulating(true);

    setTimeout(() => {
      const newResult = resimulate(
        simulationResult,
        selectedNodeIndex,
        replacement,
        originalNodes
      );
      setSimulationResult(newResult);
      setIsReSimulating(false);
      setSelectedNodeIndex(null);
      startAnimation(newResult.nodes.length);
    }, 600);
  };

  const handleReset = () => {
    setIsReSimulating(true);
    setTimeout(() => {
      const result = createSimulation(bug);
      setOriginalNodes(result.nodes);
      setSimulationResult(result);
      setIsReSimulating(false);
      setSelectedNodeIndex(null);
      startAnimation(result.nodes.length);
    }, 400);
  };

  if (!simulationResult) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-2 border-museum-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  const moodConfig = {
    negative: {
      label: "向下螺旋",
      icon: "🌪️",
      color: "text-museum-warningLight",
      bgColor: "bg-museum-warning/10",
      borderColor: "border-museum-warning/30",
    },
    neutral: {
      label: "转变中",
      icon: "🌱",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
    },
    positive: {
      label: "向上螺旋",
      icon: "✨",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    },
  };

  const mood = moodConfig[simulationResult.mood];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in opacity-0">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-museum-wall border border-museum-gold/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-museum-gold/5 via-transparent to-museum-warning/5 pointer-events-none" />

        <div className="relative p-6 md:p-8 overflow-y-auto max-h-[90vh]">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-museum-gold/20 to-museum-gold/10 border border-museum-gold/40 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-museum-gold" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-museum-gold flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-museum-ink" />
                </div>
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-museum-paper mb-1">
                  脑内模拟剧场
                </h2>
                <p className="text-sm text-museum-paper/60 font-body">
                  基于「{bug.name}」的未来行为推演
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {simulationResult.isModified && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-museum-paper/5 border border-museum-paper/20 text-museum-paper/70 hover:bg-museum-paper/10 hover:text-museum-paper transition-all duration-200 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-museum-paper/5 border border-museum-paper/20 text-museum-paper/50 hover:bg-museum-paper/10 hover:text-museum-paper transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border",
                mood.bgColor,
                mood.borderColor
              )}
            >
              <span className="text-lg">{mood.icon}</span>
              <span className={cn("text-sm font-medium", mood.color)}>{mood.label}</span>
            </div>
            {!simulationResult.isModified && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-museum-gold/10 border border-museum-gold/20">
                <Wand2 className="w-4 h-4 text-museum-gold" />
                <span className="text-xs text-museum-gold/80 font-medium">
                  点击高亮节点可以替换认知
                </span>
              </div>
            )}
          </div>

          <div
            className={cn(
              "relative py-4 px-2 md:px-4 transition-all duration-500",
              isReSimulating && "opacity-50 blur-sm"
            )}
          >
            <SimulationPath
              nodes={simulationResult.nodes}
              animatingIndex={animatingIndex}
              selectedIndex={selectedNodeIndex}
              onNodeClick={handleNodeClick}
              isModified={simulationResult.isModified}
            />
          </div>

          <div
            className={cn(
              "mt-6 p-5 rounded-2xl border transition-all duration-500",
              mood.bgColor,
              mood.borderColor
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", mood.bgColor)}>
                <Lightbulb className={cn("w-5 h-5", mood.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-museum-paper mb-1">模拟结果</p>
                <p className="text-sm text-museum-paper/80 font-body leading-relaxed">
                  {simulationResult.outcome}
                </p>
              </div>
            </div>
          </div>

          {!simulationResult.isModified && (
            <div className="mt-4 text-center">
              <p className="text-xs text-museum-paper/40 font-body">
                💡 提示：路径中带有高亮边框的节点是可以被替换的认知环节，
                试着改变一个想法，看看未来会有什么不同
              </p>
            </div>
          )}
        </div>

        {showReplacements && selectedNodeIndex !== null && simulationResult.nodes[selectedNodeIndex]?.replacementOptions && (
          <ReplacementModal
            options={simulationResult.nodes[selectedNodeIndex].replacementOptions!}
            originalContent={simulationResult.nodes[selectedNodeIndex].content}
            onSelect={handleReplace}
            onClose={() => {
              setShowReplacements(false);
              setSelectedNodeIndex(null);
            }}
          />
        )}

        {isReSimulating && (
          <div className="absolute inset-0 flex items-center justify-center bg-museum-wall/50 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-16 h-16">
                <RefreshCw className="w-8 h-8 text-museum-gold animate-spin absolute inset-0 m-auto" />
                <div className="absolute inset-0 rounded-full border-2 border-museum-gold/30 animate-ping" />
              </div>
              <p className="text-sm text-museum-paper/70 font-body">正在重新模拟未来...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SimulationPathProps {
  nodes: SimulationNode[];
  animatingIndex: number;
  selectedIndex: number | null;
  onNodeClick: (index: number) => void;
  isModified: boolean;
}

function SimulationPath({
  nodes,
  animatingIndex,
  selectedIndex,
  onNodeClick,
  isModified,
}: SimulationPathProps) {
  return (
    <div className="relative">
      <div className="space-y-2">
        {nodes.map((node, index) => (
          <div key={node.id} className="relative">
            {index > 0 && (
              <div className="absolute left-6 md:left-8 -top-2 bottom-1/2 w-0.5 overflow-hidden">
                <div
                  className={cn(
                    "w-full h-full transition-all duration-700",
                    animatingIndex >= index
                      ? node.isPositive
                        ? "bg-gradient-to-b from-emerald-400/60 to-emerald-400/20"
                        : "bg-gradient-to-b from-museum-warningLight/60 to-museum-warningLight/20"
                      : "bg-transparent"
                  )}
                  style={{
                    transform: animatingIndex >= index ? "translateY(0)" : "translateY(-100%)",
                  }}
                />
              </div>
            )}

            {index > 0 && animatingIndex >= index && (
              <div className="absolute left-5 md:left-7 -top-3 z-10">
                <ArrowRight
                  className={cn(
                    "w-3 h-3 rotate-90 bounce-in",
                    node.isPositive ? "text-emerald-400" : "text-museum-warningLight"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              </div>
            )}

            <div
              className={cn(
                "pl-14 md:pl-20 transition-all duration-500",
                animatingIndex < index && "opacity-0 translate-y-4",
                animatingIndex >= index && "opacity-100 translate-y-0"
              )}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <SimulationNodeCard
                node={node}
                index={index}
                isSelected={selectedIndex === index}
                onClick={() => onNodeClick(index)}
                isModified={isModified}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SimulationNodeCardProps {
  node: SimulationNode;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  isModified: boolean;
}

function SimulationNodeCard({
  node,
  index,
  isSelected,
  onClick,
  isModified,
}: SimulationNodeCardProps) {
  const colors = nodeTypeColors[node.type];
  const isPositive = node.isPositive;
  const isReplaceable = node.isReplaceable && !isModified;

  const positiveBg = "bg-gradient-to-br from-emerald-500/20 to-emerald-500/10";
  const positiveBorder = "border-emerald-400/50";
  const negativeBg = "bg-gradient-to-br from-museum-warning/20 to-museum-warning/10";
  const negativeBorder = "border-museum-warningLight/40";

  return (
    <div
      onClick={isReplaceable ? onClick : undefined}
      className={cn(
        "relative group rounded-2xl p-4 border-2 transition-all duration-300",
        isPositive ? positiveBg : negativeBg,
        isPositive ? positiveBorder : negativeBorder,
        isReplaceable && "cursor-pointer hover:scale-[1.02]",
        isReplaceable && "shadow-lg hover:shadow-xl",
        isSelected && "ring-2 ring-museum-gold ring-offset-2 ring-offset-museum-wall scale-[1.02]",
        isPositive && !node.id.startsWith("node-") && "float-slow"
      )}
    >
      {isReplaceable && (
        <>
          <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-museum-gold border border-museum-gold/50 text-[10px] font-bold text-museum-ink sparkle">
            ✨ 可替换
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-museum-gold/0 group-hover:border-museum-gold/40 transition-all duration-300 pointer-events-none pulse-ring" />
        </>
      )}

      {!node.id.startsWith("node-") && (
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg sparkle">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            colors.bg,
            "border",
            colors.border
          )}
        >
          <span className="text-xl md:text-2xl">{colors.icon}</span>
          {node.type === "emotion" && isPositive && (
            <span className="absolute -top-1 -right-1 text-xs heart-beat">💖</span>
          )}
          {node.type === "emotion" && !isPositive && (
            <span className="absolute -top-1 -right-1 text-xs">💔</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                isPositive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-museum-warning/20 text-museum-warningLight border border-museum-warning/30"
              )}
            >
              第 {index + 1} 步 · {nodeTypeLabels[node.type]}
            </span>
          </div>
          <p
            className={cn(
              "text-sm md:text-base font-body leading-relaxed",
              isPositive ? "text-museum-paper" : "text-museum-paper/90"
            )}
          >
            {node.content}
          </p>
          {isReplaceable && (
            <p className="text-[11px] text-museum-gold/70 font-body mt-2 flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              点击替换这个认知节点
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReplacementModalProps {
  options: ReplacementOption[];
  originalContent: string;
  onSelect: (option: ReplacementOption) => void;
  onClose: () => void;
}

function ReplacementModal({ options, originalContent, onSelect, onClose }: ReplacementModalProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-museum-wall/90 backdrop-blur-sm animate-fade-in opacity-0">
      <div className="w-full max-w-lg bounce-in">
        <div className="rounded-3xl bg-gradient-to-br from-museum-wallLight to-museum-wall border border-museum-gold/30 p-6 shadow-2xl relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-museum-gold to-museum-goldLight flex items-center gap-2 shadow-lg">
            <Wand2 className="w-4 h-4 text-museum-ink" />
            <span className="text-sm font-bold text-museum-ink">选择一个新的认知</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-museum-paper/50 hover:text-museum-paper hover:bg-museum-paper/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mt-4 mb-5 p-4 rounded-xl bg-museum-warning/10 border border-museum-warning/30">
            <p className="text-[11px] text-museum-warningLight/70 font-medium mb-1">当前认知</p>
            <p className="text-sm text-museum-paper/80 font-body line-through opacity-70">
              {originalContent}
            </p>
          </div>

          <div className="space-y-3">
            {options.map((option, index) => {
              const colors = nodeTypeColors[option.type];
              return (
                <button
                  key={option.id}
                  onClick={() => onSelect(option)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all duration-300",
                    "bg-gradient-to-br from-emerald-500/15 to-emerald-500/5",
                    "border-emerald-400/30 hover:border-emerald-400/60",
                    "hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/10",
                    "group"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        colors.bg,
                        "border",
                        colors.border,
                        "group-hover:scale-110 transition-transform"
                      )}
                    >
                      <span className="text-xl">{colors.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          {nodeTypeLabels[option.type]}
                        </span>
                      </div>
                      <p className="text-sm text-museum-paper font-medium mb-1 group-hover:text-emerald-300 transition-colors">
                        {option.content}
                      </p>
                      <p className="text-xs text-museum-paper/50 font-body">
                        {option.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-400/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-museum-paper/40 font-body mt-5">
            💫 选择一个认知，看看你的未来会走向哪里
          </p>
        </div>
      </div>
    </div>
  );
}
