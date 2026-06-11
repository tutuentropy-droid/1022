import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Heart,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useRelationshipMapStore } from "../store/useRelationshipMapStore";
import {
  relationshipCategoryLabels,
  relationshipCategoryColors,
  relationshipStatusColors,
  relationshipStatusLabels,
} from "../types/relationshipMap";

interface TrendChartProps {
  relationshipId?: string;
  height?: number;
}

export function TrendChart({ relationshipId, height = 200 }: TrendChartProps) {
  const {
    relationships,
    getRelationshipInteractions,
    getCategoryStats,
    getRelationshipTrend,
  } = useRelationshipMapStore();
  const [timeRange, setTimeRange] = useState<7 | 30 | 90 | "all">(30);

  const interactions = useMemo(() => {
    if (relationshipId) {
      return getRelationshipInteractions(relationshipId).sort(
        (a, b) => a.date - b.date
      );
    }
    return [];
  }, [relationshipId, getRelationshipInteractions]);

  const categoryStats = useMemo(() => getCategoryStats(), [getCategoryStats]);

  const filteredInteractions = useMemo(() => {
    if (timeRange === "all") return interactions;
    const cutoff = Date.now() - timeRange * 24 * 60 * 60 * 1000;
    return interactions.filter((i) => i.date >= cutoff);
  }, [interactions, timeRange]);

  const relationship = relationships.find((r) => r.id === relationshipId);
  const trend = relationshipId ? getRelationshipTrend(relationshipId) : 0;

  const chartData = useMemo(() => {
    if (filteredInteractions.length === 0) {
      return { points: [], minScore: 0, maxScore: 100 };
    }

    const scores = filteredInteractions.map((i) => i.healthScore);
    const minScore = Math.max(0, Math.min(...scores) - 10);
    const maxScore = Math.min(100, Math.max(...scores) + 10);

    const points = filteredInteractions.map((i, index) => ({
      x: index,
      y: i.healthScore,
      date: i.date,
      summary: i.summary,
      patterns: i.patterns,
    }));

    return { points, minScore, maxScore };
  }, [filteredInteractions]);

  const overallTrendStats = useMemo(() => {
    const improving = relationships.filter(
      (r) => r.status === "improving"
    ).length;
    const deteriorating = relationships.filter(
      (r) => r.status === "deteriorating"
    ).length;
    const stable = relationships.filter((r) => r.status === "stable").length;
    const unknown = relationships.filter((r) => r.status === "unknown").length;

    return { improving, deteriorating, stable, unknown };
  }, [relationships]);

  if (!relationshipId && relationships.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/10">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-museum-gold/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-museum-gold/40" />
          </div>
          <p className="text-museum-paper/50 font-body text-sm">
            还没有关系数据
          </p>
          <p className="text-museum-paper/30 text-xs mt-2">
            添加关系并记录互动后，这里会显示成长趋势
          </p>
        </div>
      </div>
    );
  }

  if (!relationshipId) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-museum-wallLight/50 to-museum-wall/30 border border-museum-gold/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-museum-paper">
                关系成长趋势
              </h3>
              <p className="text-xs text-museum-paper/50 font-body">
                你的关系整体健康状况概览
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="正在改善"
            value={overallTrendStats.improving}
            icon={<TrendingUp className="w-4 h-4" />}
            color="text-emerald-400"
            bgColor="bg-emerald-500/10"
            borderColor="border-emerald-400/30"
          />
          <StatCard
            label="保持稳定"
            value={overallTrendStats.stable}
            icon={<Heart className="w-4 h-4" />}
            color="text-museum-gold"
            bgColor="bg-museum-gold/10"
            borderColor="border-museum-gold/30"
          />
          <StatCard
            label="有所恶化"
            value={overallTrendStats.deteriorating}
            icon={<TrendingDown className="w-4 h-4" />}
            color="text-museum-warningLight"
            bgColor="bg-museum-warning/10"
            borderColor="border-museum-warning/30"
          />
          <StatCard
            label="数据不足"
            value={overallTrendStats.unknown}
            icon={<Calendar className="w-4 h-4" />}
            color="text-museum-paper/40"
            bgColor="bg-museum-paper/5"
            borderColor="border-museum-paper/10"
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs text-museum-paper/50 mb-2">各类关系平均健康度：</p>
          {categoryStats.map((stat) => {
            const colors = relationshipCategoryColors[stat.category];
            const avgHealth = Math.round(stat.averageHealthScore);

            return (
              <div key={stat.category} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-medium", colors.text)}>
                    {relationshipCategoryLabels[stat.category]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-museum-paper/40">
                      {stat.relationshipCount} 个关系
                    </span>
                    <span className="text-sm font-bold text-museum-paper">
                      {avgHealth}
                    </span>
                  </div>
                </div>
                <div className="relative w-full h-2 rounded-full bg-museum-wallLight overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      avgHealth >= 60
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : avgHealth >= 40
                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                        : "bg-gradient-to-r from-museum-warning to-museum-warningLight"
                    )}
                    style={{ width: `${avgHealth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const { points, minScore, maxScore } = chartData;
  const chartWidth = 100;
  const chartHeight = height - 40;

  const pathD = points.length > 1
    ? points
        .map((p, i) => {
          const x = (p.x / Math.max(points.length - 1, 1)) * chartWidth;
          const y = chartHeight - ((p.y - minScore) / (maxScore - minScore)) * chartHeight;
          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ")
    : "";

  const areaD = points.length > 1
    ? `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`
    : "";

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-museum-wallLight/50 to-museum-wall/30 border border-museum-gold/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-museum-paper">
              {relationship?.personName || "关系"} · 健康趋势
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  relationshipStatusColors[relationship?.status || "unknown"]
                )}
              >
                {relationshipStatusLabels[relationship?.status || "unknown"]}
              </span>
              {trend !== 0 && points.length >= 2 && (
                <span
                  className={cn(
                    "text-xs font-bold flex items-center gap-0.5",
                    trend > 0 ? "text-emerald-400" : "text-museum-warningLight"
                  )}
                >
                  {trend > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {trend > 0 ? "+" : ""}
                  {trend}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          {([7, 30, 90, "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-medium transition-all",
                timeRange === range
                  ? "bg-museum-gold/20 text-museum-gold border border-museum-gold/30"
                  : "text-museum-paper/40 hover:text-museum-paper/60"
              )}
            >
              {range === "all" ? "全部" : `${range}天`}
            </button>
          ))}
        </div>
      </div>

      {points.length === 0 ? (
        <div
          className="flex items-center justify-center border-2 border-dashed border-museum-gold/10 rounded-xl"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <Calendar className="w-8 h-8 text-museum-gold/30 mx-auto mb-2" />
            <p className="text-sm text-museum-paper/30">暂无互动记录</p>
          </div>
        </div>
      ) : (
        <div className="relative" style={{ height: `${height}px` }}>
          <svg
            viewBox={`-10 -10 ${chartWidth + 20} ${chartHeight + 20}`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {[0, 25, 50, 75, 100].map((pct) => {
              const adjustedY =
                chartHeight -
                ((pct - minScore) / (maxScore - minScore)) * chartHeight;
              return (
                <g key={pct}>
                  <line
                    x1="0"
                    y1={adjustedY}
                    x2={chartWidth}
                    y2={adjustedY}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    className="text-museum-gold"
                  />
                  <text
                    x="-5"
                    y={adjustedY + 3}
                    fill="currentColor"
                    fillOpacity="0.3"
                    fontSize="4"
                    textAnchor="end"
                    className="text-museum-paper"
                  >
                    {pct}
                  </text>
                </g>
              );
            })}

            {areaD && (
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c9a962" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
                </linearGradient>
              </defs>
            )}

            {areaD && <path d={areaD} fill="url(#areaGradient)" />}

            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-museum-gold path-draw"
              />
            )}

            {points.map((point, i) => {
              const x = (point.x / Math.max(points.length - 1, 1)) * chartWidth;
              const y = chartHeight - ((point.y - minScore) / (maxScore - minScore)) * chartHeight;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="2"
                    className="text-museum-gold"
                    fill="currentColor"
                  />
                  {i === points.length - 1 && (
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      className="text-museum-gold"
                      fill="currentColor"
                      fillOpacity="0.3"
                    >
                      <animate
                        attributeName="r"
                        values="3;6;3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="fill-opacity"
                        values="0.5;0.1;0.5"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {points.length > 0 && (
        <div className="mt-4 pt-4 border-t border-museum-gold/10">
          <div className="flex items-center justify-between text-xs text-museum-paper/40">
            <span>
              {formatDate(points[0]?.date)}
            </span>
            <span>
              {formatDate(points[points.length - 1]?.date)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
  borderColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-xl border transition-all",
        bgColor,
        borderColor
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className={cn("text-xs", color)}>{label}</span>
      </div>
      <p className="text-2xl font-bold text-museum-paper counter-animation">
        {value}
      </p>
    </div>
  );
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
