import {
  AlertTriangle,
  Activity,
  Trophy,
  Zap,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import type { BugMatchResult } from "../types/bug";
import { rankColors } from "../types/bug";
import { cn } from "../lib/utils";

interface MuseumStatsProps {
  results: BugMatchResult[];
}

export function MuseumStats({ results }: MuseumStatsProps) {
  const totalCount = results.length;
  const highSeverityCount = results.filter(
    (r) => r.bug.severity === "high"
  ).length;
  const mediumSeverityCount = results.filter(
    (r) => r.bug.severity === "medium"
  ).length;
  const lowSeverityCount = results.filter(
    (r) => r.bug.severity === "low"
  ).length;

  const avgMatchScore =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.matchScore, 0) / results.length
      : 0;
  const avgRecurrenceRate =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.bug.recurrenceRate, 0) / results.length
      : 0;
  const avgDangerLevel =
    results.length > 0
      ? results.reduce((sum, r) => {
          const level = r.bug.severity === "high" ? 90 : r.bug.severity === "medium" ? 60 : 30;
          return sum + level;
        }, 0) / results.length
      : 0;

  const rankDistribution = results.reduce((acc, r) => {
    acc[r.bug.rank] = (acc[r.bug.rank] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const overallRiskScore = Math.min(
    (avgMatchScore * 0.4 + (avgDangerLevel / 100) * 0.4 + (avgRecurrenceRate / 100) * 0.2) * 100,
    100
  );

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { text: "高危", color: "#ff6b6b" };
    if (score >= 60) return { text: "中危", color: "#ffa94d" };
    if (score >= 40) return { text: "低危", color: "#ffd43b" };
    return { text: "健康", color: "#69db7c" };
  };

  const riskLevel = getRiskLevel(overallRiskScore);

  return (
    <div className="mb-8 animate-fade-up opacity-0 stagger-delay-1">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-museum-gold/20 via-museum-gold/10 to-museum-gold/20 rounded-2xl blur-sm opacity-50" />
        <div className="relative rounded-2xl bg-museum-wallLight/30 border border-museum-gold/20 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-museum-gold/40 to-transparent" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-museum-gold/20 border border-museum-gold/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-museum-gold" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-museum-paper">
                    展厅分析报告
                  </h3>
                  <p className="text-xs text-museum-gold/60 font-mono">
                    EXHIBITION ANALYSIS · v2.0
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-museum-paper/50 mb-1">综合风险指数</p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-3xl font-bold font-display tabular-nums"
                    style={{ color: riskLevel.color }}
                  >
                    {Math.round(overallRiskScore)}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${riskLevel.color}20`,
                      color: riskLevel.color,
                      border: `1px solid ${riskLevel.color}40`,
                    }}
                  >
                    {riskLevel.text}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<Trophy className="w-4 h-4" />}
                label="检出标本"
                value={totalCount}
                unit="件"
                color="#c9a962"
              />
              <StatCard
                icon={<AlertTriangle className="w-4 h-4" />}
                label="高危险度"
                value={highSeverityCount}
                unit="件"
                color="#ff6b6b"
              />
              <StatCard
                icon={<Activity className="w-4 h-4" />}
                label="平均匹配度"
                value={Math.round(avgMatchScore * 100)}
                unit="%"
                color="#69db7c"
              />
              <StatCard
                icon={<TrendingUp className="w-4 h-4" />}
                label="平均复发率"
                value={Math.round(avgRecurrenceRate)}
                unit="%"
                color="#74c0fc"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-museum-paper/60 font-medium flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-museum-gold" />
                    危险等级分布
                  </span>
                </div>
                <div className="space-y-2">
                  <SeverityBar
                    label="高危险"
                    count={highSeverityCount}
                    total={totalCount}
                    color="#ff6b6b"
                  />
                  <SeverityBar
                    label="中危险"
                    count={mediumSeverityCount}
                    total={totalCount}
                    color="#ffa94d"
                  />
                  <SeverityBar
                    label="低危险"
                    count={lowSeverityCount}
                    total={totalCount}
                    color="#69db7c"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-museum-paper/60 font-medium flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-museum-gold" />
                    珍贵等级分布
                  </span>
                </div>
                <div className="flex items-end justify-around h-20 gap-2">
                  {["S", "A", "B", "C", "D"].map((rank) => {
                    const count = rankDistribution[rank] || 0;
                    const height = totalCount > 0 ? (count / totalCount) * 100 : 0;
                    const color = rankColors[rank as keyof typeof rankColors];

                    return (
                      <div key={rank} className="flex flex-col items-center gap-1.5 flex-1">
                        <div
                          className="w-full rounded-t-sm transition-all duration-700 ease-out"
                          style={{
                            height: `${Math.max(height, 4)}%`,
                            backgroundColor: color,
                            boxShadow: `0 0 12px ${color}40`,
                            minHeight: count > 0 ? "8px" : "4px",
                            opacity: count > 0 ? 1 : 0.3,
                          }}
                        />
                        <span
                          className="text-[10px] font-bold tabular-nums"
                          style={{ color }}
                        >
                          {rank}
                        </span>
                        <span className="text-[9px] text-museum-paper/40 tabular-nums">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
}

function StatCard({ icon, label, value, unit, color }: StatCardProps) {
  return (
    <div className="relative">
      <div
        className="absolute -inset-px rounded-xl opacity-20 blur-sm"
        style={{ backgroundColor: color }}
      />
      <div className="relative rounded-xl bg-museum-wall/40 border border-museum-gold/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className="text-2xl font-bold font-display tabular-nums"
            style={{ color }}
          >
            {value}
          </span>
          <span className="text-xs text-museum-paper/40">{unit}</span>
        </div>
        <p className="text-[11px] text-museum-paper/50 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

interface SeverityBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function SeverityBar({ label, count, total, color }: SeverityBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-museum-paper/60">{label}</span>
        <span className="text-[11px] font-medium tabular-nums" style={{ color }}>
          {count}件 · {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-museum-paper/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}
