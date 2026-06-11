import { useState, useMemo } from "react";
import {
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  Eye,
} from "lucide-react";
import type { BugChain, ChainNode, SpiralSeverity } from "../types/bug";
import { rankColors, severityLabels } from "../types/bug";
import { cn } from "../lib/utils";

interface ChainViewerProps {
  chain: BugChain;
}

const severityGlowColors: Record<string, string> = {
  low: "rgba(105, 219, 124, 0.3)",
  medium: "rgba(255, 169, 77, 0.4)",
  high: "rgba(255, 107, 107, 0.5)",
};

const spiralSeverityConfig: Record<
  SpiralSeverity,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  mild: {
    label: "轻度螺旋",
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
    icon: "🌱",
  },
  moderate: {
    label: "中度螺旋",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
    icon: "🌀",
  },
  severe: {
    label: "重度螺旋",
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    icon: "🌪️",
  },
};

export function ChainViewer({ chain }: ChainViewerProps) {
  const [showExplanation, setShowExplanation] = useState(true);
  const [hoveredBug, setHoveredBug] = useState<string | null>(null);
  const { nodes, edges, triggerBugId, chainLength, potentialCount, spiralSeverity, dominantPath } = chain;

  const triggerBug = nodes.find((n) => n.bugId === triggerBugId)?.bug;
  const severityInfo = spiralSeverityConfig[spiralSeverity];

  const levels = useMemo(() => groupByLevel(nodes), [nodes]);

  const dominantPathIds = useMemo(() => {
    if (!dominantPath) return new Set<string>();
    return new Set(dominantPath.bugIds);
  }, [dominantPath]);

  const dominantEdgeKeys = useMemo(() => {
    if (!dominantPath) return new Set<string>();
    const keys = new Set<string>();
    for (let i = 0; i < dominantPath.bugIds.length - 1; i++) {
      keys.add(`${dominantPath.bugIds[i]}-${dominantPath.bugIds[i + 1]}`);
    }
    return keys;
  }, [dominantPath]);

  return (
    <div className="animate-fade-up opacity-0 stagger-delay-1">
      <div className="relative">
        <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-gradient-to-r from-museum-gold/5 via-museum-gold/10 to-museum-gold/5 rounded-3xl blur-xl" />

        <div className="relative p-6 md:p-8 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/20 backdrop-blur-sm">
          <span className="corner-decoration corner-decoration-tl" />
          <span className="corner-decoration corner-decoration-tr" />
          <span className="corner-decoration corner-decoration-bl" />
          <span className="corner-decoration corner-decoration-br" />

          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-museum-gold/15 border border-museum-gold/30 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-museum-gold" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-museum-gold flex items-center justify-center text-[10px] font-bold text-museum-ink">
                  {chainLength}
                </div>
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-museum-paper mb-1">
                  你的脑内故障链
                </h2>
                {triggerBug && (
                  <p className="text-sm text-museum-gold/80 font-body">
                    最初触发点：
                    <span className="font-medium text-museum-gold">
                      「{triggerBug.name}」
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border",
                severityInfo.bgColor
              )}>
                <span className="text-sm">{severityInfo.icon}</span>
                <span className={cn("text-xs font-medium", severityInfo.color)}>
                  {severityInfo.label}
                </span>
              </div>

              {potentialCount > 0 && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-museum-paper/5 border border-museum-paper/10">
                  <Eye className="w-4 h-4 text-museum-paper/50" />
                  <span className="text-xs font-medium text-museum-paper/60">
                    潜在 {potentialCount} 个
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative py-6 md:py-8">
            <ChainGraph
              levels={levels}
              edges={edges}
              hoveredBug={hoveredBug}
              onBugHover={setHoveredBug}
              dominantPathIds={dominantPathIds}
              dominantEdgeKeys={dominantEdgeKeys}
            />
          </div>

          {dominantPath && dominantPath.nodes.length >= 3 && (
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-museum-warning/10 to-transparent border border-museum-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-museum-warningLight" />
                <span className="text-sm font-medium text-museum-warningLight">
                  主导传播路径
                </span>
              </div>
              <p className="font-body text-sm text-museum-paper/80 leading-relaxed">
                {dominantPath.nodes.map((n, i) => (
                  <span key={n.bugId}>
                    {i > 0 && <span className="mx-1 text-museum-gold/50">→</span>}
                    <span className={cn(
                      n.isMatched ? "text-museum-paper" : "text-museum-paper/50"
                    )}>
                      「{n.bug.name}」
                    </span>
                  </span>
                ))}
              </p>
              <p className="text-xs text-museum-paper/50 mt-2">
                传播强度：{Math.round(dominantPath.totalStrength * 100)}% · 这是最可能的向下螺旋路径
              </p>
            </div>
          )}

          <div className="mt-4 border-t border-museum-gold/10 pt-4">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full flex items-center justify-between gap-2 p-3 rounded-xl bg-museum-wall/20 hover:bg-museum-wall/40 transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-museum-gold" />
                <span className="text-sm font-medium text-museum-paper">
                  为什么会越想越糟？
                </span>
              </div>
              {showExplanation ? (
                <ChevronUp className="w-4 h-4 text-museum-gold/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-museum-gold/60" />
              )}
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-500 ease-out",
                showExplanation
                  ? "max-h-[3000px] opacity-100 mt-4"
                  : "max-h-0 opacity-0"
              )}
            >
              <div className="p-4 md:p-6 rounded-xl bg-museum-gold/5 border border-museum-gold/10">
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-sm text-museum-paper/80 font-body leading-relaxed whitespace-pre-line">
                    {chain.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-museum-paper/40">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-museum-gold/60" />
              <span>已检测到</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-museum-paper/20 border border-dashed border-museum-paper/30" />
              <span>潜在风险</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-museum-warning rounded-full" />
              <span>主导路径</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function groupByLevel(nodes: ChainNode[]): Map<number, ChainNode[]> {
  const levels = new Map<number, ChainNode[]>();
  nodes.forEach((node) => {
    if (!levels.has(node.level)) {
      levels.set(node.level, []);
    }
    levels.get(node.level)!.push(node);
  });
  return levels;
}

function ChainGraph({
  levels,
  edges,
  hoveredBug,
  onBugHover,
  dominantPathIds,
  dominantEdgeKeys,
}: {
  levels: Map<number, ChainNode[]>;
  edges: { from: string; to: string; reason: string; strength: number; type: string }[];
  hoveredBug: string | null;
  onBugHover: (id: string | null) => void;
  dominantPathIds: Set<string>;
  dominantEdgeKeys: Set<string>;
}) {
  const levelKeys = Array.from(levels.keys()).sort((a, b) => a - b);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  const nodePositions = new Map<string, { x: number; y: number }>();

  const levelHeight = 150;
  const nodeWidth = 170;
  const nodeGap = 20;

  let maxWidth = 0;

  levelKeys.forEach((level) => {
    const levelNodes = levels.get(level)!;
    const totalWidth =
      levelNodes.length * nodeWidth + (levelNodes.length - 1) * nodeGap;
    maxWidth = Math.max(maxWidth, totalWidth);
  });

  const svgWidth = Math.max(maxWidth + 100, 400);
  const svgHeight = levelKeys.length * levelHeight + 80;

  levelKeys.forEach((level) => {
    const levelNodes = levels.get(level)!;
    const totalWidth =
      levelNodes.length * nodeWidth + (levelNodes.length - 1) * nodeGap;
    const startX = (svgWidth - totalWidth) / 2 + nodeWidth / 2;

    levelNodes.forEach((node, index) => {
      const x = startX + index * (nodeWidth + nodeGap);
      const y = 50 + level * levelHeight + 50;
      nodePositions.set(node.bugId, { x, y });
    });
  });

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="mx-auto"
        style={{ minWidth: "100%" }}
      >
        <defs>
          <linearGradient id="edgeGradientMatched" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(201, 169, 98, 0.7)" />
            <stop offset="100%" stopColor="rgba(201, 169, 98, 0.3)" />
          </linearGradient>
          <linearGradient id="edgeGradientPotential" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(245, 240, 230, 0.3)" />
            <stop offset="100%" stopColor="rgba(245, 240, 230, 0.1)" />
          </linearGradient>
          <linearGradient id="edgeDominant" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 107, 107, 0.9)" />
            <stop offset="100%" stopColor="rgba(255, 169, 77, 0.6)" />
          </linearGradient>
          <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 107, 107, 0.9)" />
            <stop offset="100%" stopColor="rgba(255, 169, 77, 0.5)" />
          </linearGradient>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker
            id="arrowhead-matched"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="rgba(201, 169, 98, 0.7)" />
          </marker>
          <marker
            id="arrowhead-potential"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="rgba(245, 240, 230, 0.3)" />
          </marker>
          <marker
            id="arrowhead-dominant"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255, 107, 107, 0.9)" />
          </marker>
          <marker
            id="arrowhead-glow"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255, 107, 107, 1)" />
          </marker>
        </defs>

        {edges.map((edge) => {
          const fromPos = nodePositions.get(edge.from);
          const toPos = nodePositions.get(edge.to);
          if (!fromPos || !toPos) return null;

          const edgeKey = `${edge.from}-${edge.to}`;
          const isHovered = hoveredEdge === edgeKey;
          const isDominant = dominantEdgeKeys.has(edgeKey);
          const isPotential = edge.type === "potential";
          const isFromHovered = hoveredBug === edge.from;
          const isToHovered = hoveredBug === edge.to;
          const shouldHighlight = isHovered || isDominant || isFromHovered || isToHovered;

          const startY = fromPos.y + 45;
          const endY = toPos.y - 50;
          const midY = (startY + endY) / 2;

          let strokeUrl = "url(#edgeGradientMatched)";
          let markerEnd = "url(#arrowhead-matched)";
          let strokeWidth = 2;

          if (isDominant) {
            strokeUrl = "url(#edgeDominant)";
            markerEnd = "url(#arrowhead-dominant)";
            strokeWidth = 2.5;
          } else if (isPotential) {
            strokeUrl = "url(#edgeGradientPotential)";
            markerEnd = "url(#arrowhead-potential)";
            strokeWidth = 1.5;
          }

          if (isHovered) {
            strokeUrl = "url(#edgeGlow)";
            markerEnd = "url(#arrowhead-glow)";
            strokeWidth = 3;
          }

          const opacity = shouldHighlight || !hoveredBug ? 1 : 0.3;

          return (
            <g key={edgeKey} style={{ opacity, transition: "opacity 0.3s" }}>
              <path
                d={`M ${fromPos.x} ${startY} C ${fromPos.x} ${midY}, ${toPos.x} ${midY}, ${toPos.x} ${endY}`}
                fill="none"
                stroke={strokeUrl}
                strokeWidth={strokeWidth}
                strokeDasharray={isPotential && !isDominant ? "5,5" : "none"}
                markerEnd={markerEnd}
                filter={isHovered || isDominant ? "url(#glow)" : "none"}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredEdge(edgeKey)}
                onMouseLeave={() => setHoveredEdge(null)}
              />

              {isHovered && (
                <g>
                  <rect
                    x={(fromPos.x + toPos.x) / 2 - 100}
                    y={midY - 28}
                    width="200"
                    height="56"
                    rx="10"
                    fill="rgba(26, 58, 58, 0.95)"
                    stroke="rgba(255, 107, 107, 0.5)"
                  />
                  <text
                    x={(fromPos.x + toPos.x) / 2}
                    y={midY - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-museum-warningLight font-medium"
                  >
                    传播机制
                  </text>
                  <text
                    x={(fromPos.x + toPos.x) / 2}
                    y={midY + 8}
                    textAnchor="middle"
                    className="text-[9px] fill-museum-paper/80"
                  >
                    {edge.reason.length > 24
                      ? edge.reason.slice(0, 24) + "..."
                      : edge.reason}
                  </text>
                  <text
                    x={(fromPos.x + toPos.x) / 2}
                    y={midY + 22}
                    textAnchor="middle"
                    className="text-[9px] fill-museum-gold/60"
                  >
                    强度 {Math.round(edge.strength * 100)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {levelKeys.map((level) => {
          const levelNodes = levels.get(level)!;
          return levelNodes.map((node) => {
            const pos = nodePositions.get(node.bugId);
            if (!pos) return null;

            const rankColor = rankColors[node.bug.rank];
            const glowColor = severityGlowColors[node.bug.severity];
            const isHovered = hoveredBug === node.bugId;
            const isDominant = dominantPathIds.has(node.bugId);
            const isPotential = !node.isMatched;

            const opacity = hoveredBug ? (isHovered || isDominant ? 1 : 0.4) : 1;

            return (
              <g
                key={node.bugId}
                style={{ opacity, transition: "opacity 0.3s" }}
                onMouseEnter={() => onBugHover(node.bugId)}
                onMouseLeave={() => onBugHover(null)}
                className="cursor-pointer"
              >
                {node.isTrigger && (
                  <>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="60"
                      fill="none"
                      stroke="rgba(201, 169, 98, 0.2)"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="50"
                      fill="none"
                      stroke="rgba(201, 169, 98, 0.3)"
                      strokeWidth="2"
                      className="animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    />
                  </>
                )}

                {isDominant && !node.isTrigger && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="48"
                    fill="none"
                    stroke="rgba(255, 107, 107, 0.3)"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className="animate-spin"
                    style={{ animationDuration: "20s" }}
                  />
                )}

                <rect
                  x={pos.x - nodeWidth / 2}
                  y={pos.y - 45}
                  width={nodeWidth}
                  height="90"
                  rx="14"
                  fill={
                    isPotential
                      ? "rgba(26, 58, 58, 0.4)"
                      : "rgba(26, 58, 58, 0.85)"
                  }
                  stroke={
                    node.isTrigger
                      ? "rgba(201, 169, 98, 0.7)"
                      : isDominant
                      ? "rgba(255, 107, 107, 0.5)"
                      : isPotential
                      ? "rgba(245, 240, 230, 0.2)"
                      : "rgba(201, 169, 98, 0.35)"
                  }
                  strokeDasharray={isPotential ? "6,4" : "none"}
                  style={{
                    filter: isPotential
                      ? "none"
                      : `drop-shadow(0 4px 20px ${glowColor})`,
                  }}
                  className="transition-all duration-300"
                />

                <div>
                  <div>
                    {node.isTrigger && (
                      <text
                        x={pos.x}
                        y={pos.y - 55}
                        textAnchor="middle"
                        className="text-[10px] fill-museum-gold font-bold tracking-wider"
                      >
                        ⚡ 触发点
                      </text>
                    )}
                  </div>
                </div>

                <circle
                  cx={pos.x - 55}
                  cy={pos.y - 5}
                  r="18"
                  fill={isPotential ? `${rankColor}10` : `${rankColor}20`}
                  stroke={rankColor}
                  strokeWidth={isPotential ? 1 : 2}
                  strokeDasharray={isPotential ? "3,2" : "none"}
                  opacity={isPotential ? 0.5 : 1}
                />
                <text
                  x={pos.x - 55}
                  y={pos.y + 4}
                  textAnchor="middle"
                  className="text-[11px] font-bold"
                  fill={isPotential ? `${rankColor}80` : rankColor}
                >
                  {node.bug.rank}
                </text>

                <text
                  x={pos.x - 30}
                  y={pos.y - 15}
                  className={cn(
                    "text-[12px] font-semibold",
                    isPotential ? "fill-museum-paper/50" : "fill-museum-paper"
                  )}
                >
                  {node.bug.name.length > 9
                    ? node.bug.name.slice(0, 9) + "..."
                    : node.bug.name}
                </text>

                <text
                  x={pos.x - 30}
                  y={pos.y + 10}
                  className={cn(
                    "text-[10px]",
                    isPotential ? "fill-museum-paper/30" : "fill-museum-gold/60"
                  )}
                >
                  {severityLabels[node.bug.severity]}
                </text>

                {node.isMatched && node.matchScore > 0 && (
                  <text
                    x={pos.x + 55}
                    y={pos.y - 5}
                    textAnchor="end"
                    className="text-[10px] fill-museum-gold/70 font-mono font-medium"
                  >
                    {Math.round(node.matchScore * 100)}%
                  </text>
                )}

                {isPotential && (
                  <text
                    x={pos.x + 55}
                    y={pos.y - 5}
                    textAnchor="end"
                    className="text-[9px] fill-museum-paper/30 font-medium"
                  >
                    潜在
                  </text>
                )}

                {node.propagationStrength > 0 && node.propagationStrength < 1 && (
                  <text
                    x={pos.x + 55}
                    y={pos.y + 12}
                    textAnchor="end"
                    className={cn(
                      "text-[9px] font-mono",
                      isPotential ? "fill-museum-paper/25" : "fill-museum-paper/30"
                    )}
                  >
                    → {Math.round(node.propagationStrength * 100)}%
                  </text>
                )}
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
}
