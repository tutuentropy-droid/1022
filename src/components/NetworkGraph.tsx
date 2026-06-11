import { useState, useEffect, useRef, useMemo } from "react";
import { Info, Users, Zap, Shield } from "lucide-react";
import type { NetworkGraphData, NetworkNode } from "../types/groupDynamics";
import { cn } from "../lib/utils";

interface NetworkGraphProps {
  data: NetworkGraphData;
  width?: number;
  height?: number;
}

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const linkTypeColors: Record<string, string> = {
  alliance: "#34d399",
  conflict: "#f87171",
  support: "#60a5fa",
  neutral: "#6b7280",
};

const linkTypeLabels: Record<string, string> = {
  alliance: "联盟",
  conflict: "冲突",
  support: "支持",
  neutral: "中性",
};

const roleIcons: Record<string, React.ReactNode> = {
  "冲突放大者": <Zap className="w-3 h-3" />,
  "矛盾缓冲者": <Shield className="w-3 h-3" />,
  "联盟成员": <Users className="w-3 h-3" />,
  "边缘角色": <Info className="w-3 h-3" />,
};

export function NetworkGraph({
  data,
  width = 600,
  height = 500,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [positions, setPositions] = useState<Map<string, NodePosition>>(
    new Map()
  );
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const animationRef = useRef<number>();

  const centerX = width / 2;
  const centerY = height / 2;

  useEffect(() => {
    const initialPositions = new Map<string, NodePosition>();
    const nodeCount = data.nodes.length;

    data.nodes.forEach((node, index) => {
      const angle = (index / nodeCount) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.3;
      initialPositions.set(node.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      });
    });

    setPositions(initialPositions);
  }, [data.nodes, centerX, centerY, width, height]);

  useEffect(() => {
    if (!isSimulating || positions.size === 0) return;

    const simulate = () => {
      setPositions((prevPos) => {
        const newPos = new Map(prevPos);

        for (const node of data.nodes) {
          const pos = newPos.get(node.id);
          if (!pos) continue;

          const dx = centerX - pos.x;
          const dy = centerY - pos.y;
          pos.vx += dx * 0.0005;
          pos.vy += dy * 0.0005;

          for (const other of data.nodes) {
            if (other.id === node.id) continue;
            const otherPos = newPos.get(other.id);
            if (!otherPos) continue;

            const ddx = pos.x - otherPos.x;
            const ddy = pos.y - otherPos.y;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
            const minDist = 60;

            if (dist < minDist * 3) {
              const force = (minDist * minDist) / (dist * dist) * 0.5;
              pos.vx += (ddx / dist) * force;
              pos.vy += (ddy / dist) * force;
            }
          }
        }

        for (const link of data.links) {
          const sourcePos = newPos.get(link.source);
          const targetPos = newPos.get(link.target);
          if (!sourcePos || !targetPos) continue;

          const dx = targetPos.x - sourcePos.x;
          const dy = targetPos.y - sourcePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = 120 + link.value * 10;

          const force = (dist - idealDist) * 0.003;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          sourcePos.vx += fx;
          sourcePos.vy += fy;
          targetPos.vx -= fx;
          targetPos.vy -= fy;
        }

        for (const node of data.nodes) {
          const pos = newPos.get(node.id);
          if (!pos) continue;

          pos.vx *= 0.9;
          pos.vy *= 0.9;

          pos.x += pos.vx;
          pos.y += pos.vy;

          const margin = 40;
          pos.x = Math.max(margin, Math.min(width - margin, pos.x));
          pos.y = Math.max(margin, Math.min(height - margin, pos.y));
        }

        return newPos;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulating, data.nodes, data.links, centerX, centerY, width, height]);

  const linkElements = useMemo(() => {
    return data.links.map((link, index) => {
      const sourcePos = positions.get(link.source);
      const targetPos = positions.get(link.target);
      if (!sourcePos || !targetPos) return null;

      const color = linkTypeColors[link.type] || linkTypeColors.neutral;
      const strokeWidth = Math.max(1, Math.min(4, link.value));

      return (
        <line
          key={`link-${index}`}
          x1={sourcePos.x}
          y1={sourcePos.y}
          x2={targetPos.x}
          y2={targetPos.y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={0.6}
          className="transition-all duration-300"
        />
      );
    });
  }, [data.links, positions]);

  const nodeElements = useMemo(() => {
    return data.nodes.map((node) => {
      const pos = positions.get(node.id);
      if (!pos) return null;

      const isSelected = selectedNode?.id === node.id;
      const role = node.role;

      return (
        <g
          key={node.id}
          transform={`translate(${pos.x}, ${pos.y})`}
          className="cursor-pointer"
          onClick={() => setSelectedNode(isSelected ? null : node)}
        >
          <circle
            r={node.size / 2 + (isSelected ? 4 : 0)}
            fill={node.color}
            fillOpacity={0.9}
            stroke="#f5f0e6"
            strokeWidth={isSelected ? 3 : 1.5}
            className="transition-all duration-300"
            style={{
              filter: isSelected
                ? "drop-shadow(0 0 8px rgba(245, 240, 230, 0.5))"
                : "none",
            }}
          />

          {role && (
            <g transform={`translate(${node.size / 2 - 4}, ${-node.size / 2 + 4})`}>
              <circle r={8} fill="#1a3a3a" stroke={node.color} strokeWidth={1.5} />
              <g transform="translate(-4, -4)" fill="#f5f0e6">
                {roleIcons[role] || null}
              </g>
            </g>
          )}

          <text
            y={node.size / 2 + 16}
            textAnchor="middle"
            className="text-xs fill-museum-paper font-medium"
            style={{ fontSize: "11px" }}
          >
            {node.name}
          </text>
        </g>
      );
    });
  }, [data.nodes, positions, selectedNode]);

  const legendItems = [
    { type: "alliance", label: "联盟关系" },
    { type: "support", label: "支持关系" },
    { type: "neutral", label: "中性互动" },
    { type: "conflict", label: "冲突关系" },
  ];

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      >
        <defs>
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c9a962" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#bg-glow)" />

        {linkElements}
        {nodeElements}
      </svg>

      <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 text-xs">
        {legendItems.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <div
              className="w-6 h-0.5 rounded-full"
              style={{ backgroundColor: linkTypeColors[item.type] }}
            />
            <span className="text-museum-paper/60">{item.label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsSimulating(!isSimulating)}
        className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-museum-gold/20 text-museum-gold text-xs border border-museum-gold/30 hover:bg-museum-gold/30 transition-all"
      >
        {isSimulating ? "暂停动画" : "播放动画"}
      </button>

      {selectedNode && (
        <div className="absolute top-4 right-4 w-48 p-4 rounded-xl bg-museum-wallLight/90 backdrop-blur-sm border border-museum-gold/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: selectedNode.color }}
            >
              {selectedNode.name.slice(0, 1)}
            </div>
            <div>
              <p className="text-sm font-medium text-museum-paper">
                {selectedNode.name}
              </p>
              {selectedNode.role && (
                <p className="text-xs text-museum-gold">{selectedNode.role}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-museum-paper/50">中心度</span>
              <span className="text-museum-paper/80">
                {Math.round(selectedNode.centrality)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-museum-paper/50">节点大小</span>
              <span className="text-museum-paper/80">
                {Math.round(selectedNode.size)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
