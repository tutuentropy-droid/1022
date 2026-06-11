import { useState } from "react";
import {
  Map,
  Plus,
  MessageSquarePlus,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  Heart,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useRelationshipMapStore } from "../store/useRelationshipMapStore";
import type { RelationshipCategory, Relationship } from "../types/relationshipMap";
import {
  relationshipCategoryLabels,
  relationshipCategoryColors,
} from "../types/relationshipMap";
import { RelationshipCard } from "./RelationshipCard";
import { PatternViewer } from "./PatternViewer";
import { TrendChart } from "./TrendChart";
import { AddRelationshipModal } from "./AddRelationshipModal";
import { LogInteractionModal } from "./LogInteractionModal";

const categories: (RelationshipCategory | "all")[] = [
  "all",
  "intimate",
  "work",
  "family",
  "friend",
  "acquaintance",
];

export function RelationshipPersonalityMap() {
  const {
    relationships,
    isAddModalOpen,
    isLogModalOpen,
    editingRelationship,
    selectedRelationshipId,
    setIsAddModalOpen,
    setIsLogModalOpen,
    setEditingRelationship,
    setSelectedRelationshipId,
    getOverallStats,
    getTopPatterns,
  } = useRelationshipMapStore();

  const [activeCategory, setActiveCategory] =
    useState<RelationshipCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDetail, setShowDetail] = useState(false);

  const stats = getOverallStats();
  const topPatterns = getTopPatterns(3);

  const filteredRelationships =
    activeCategory === "all"
      ? relationships
      : relationships.filter((r) => r.category === activeCategory);

  const sortedRelationships = [...filteredRelationships].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  const selectedRelationship = relationships.find(
    (r) => r.id === selectedRelationshipId
  );

  const handleCardClick = (rel: Relationship) => {
    setSelectedRelationshipId(rel.id);
    setShowDetail(true);
  };

  const handleAddRelationship = () => {
    setEditingRelationship(null);
    setIsAddModalOpen(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedRelationshipId(null);
  };

  return (
    <div className="min-h-screen bg-museum-wall">
      <header className="relative py-8 px-4 border-b border-museum-gold/10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-museum-gold/20 to-museum-gold/5 border border-museum-gold/40 flex items-center justify-center">
                  <Map className="w-6 h-6 text-museum-gold" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-museum-paper">
                  关系人格地图
                </h1>
                <p className="text-museum-gold/70 text-sm">
                  看见你在不同关系中的重复模式
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddRelationship}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-gradient text-museum-ink text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                添加关系
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="关系总数"
            value={stats.totalRelationships}
            color="text-sky-400"
            bgColor="bg-sky-500/10"
            borderColor="border-sky-400/30"
          />
          <StatCard
            icon={<MessageSquarePlus className="w-5 h-5" />}
            label="互动记录"
            value={stats.totalInteractions}
            color="text-emerald-400"
            bgColor="bg-emerald-500/10"
            borderColor="border-emerald-400/30"
          />
          <StatCard
            icon={<Heart className="w-5 h-5" />}
            label="平均健康度"
            value={stats.averageHealth}
            color="text-museum-gold"
            bgColor="bg-museum-gold/10"
            borderColor="border-museum-gold/30"
            suffix="/100"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="改善中"
            value={stats.improvingCount}
            color="text-rose-400"
            bgColor="bg-rose-500/10"
            borderColor="border-rose-400/30"
            subValue={`${stats.stableCount} 稳定 / ${stats.deterioratingCount} 恶化`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TrendChart />
          </div>
          <div>
            <PatternViewer limit={5} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Filter className="w-4 h-4 text-museum-paper/40 flex-shrink-0" />
            {categories.map((cat) => {
              const count =
                cat === "all"
                  ? relationships.length
                  : relationships.filter((r) => r.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    activeCategory === cat
                      ? "bg-museum-gold/20 text-museum-gold border border-museum-gold/30"
                      : "text-museum-paper/50 hover:text-museum-paper/70 hover:bg-museum-paper/5"
                  )}
                >
                  {cat === "all" ? "全部" : relationshipCategoryLabels[cat]}
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px]",
                      activeCategory === cat
                        ? "bg-museum-gold/30 text-museum-ink"
                        : "bg-museum-paper/10 text-museum-paper/40"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "grid"
                  ? "bg-museum-gold/20 text-museum-gold"
                  : "text-museum-paper/40 hover:text-museum-paper/60"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "list"
                  ? "bg-museum-gold/20 text-museum-gold"
                  : "text-museum-paper/40 hover:text-museum-paper/60"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {sortedRelationships.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-museum-gold/10 flex items-center justify-center mx-auto mb-6 border border-museum-gold/20">
              <Users className="w-10 h-10 text-museum-gold/40" />
            </div>
            <h3 className="font-display text-xl text-museum-paper mb-2">
              还没有添加任何关系
            </h3>
            <p className="text-museum-paper/40 font-body text-sm mb-6 max-w-md mx-auto">
              添加你生活中的重要关系，记录每次互动，
              系统会帮你发现重复的互动模式和成长趋势。
            </p>
            <button
              onClick={handleAddRelationship}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-museum-ink font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              添加第一个关系
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedRelationships.map((rel, index) => (
              <div
                key={rel.id}
                className="animate-fade-up opacity-0"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: "forwards",
                }}
              >
                <RelationshipCard
                  relationship={rel}
                  onClick={() => handleCardClick(rel)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedRelationships.map((rel, index) => (
              <div
                key={rel.id}
                className="animate-fade-up opacity-0"
                style={{
                  animationDelay: `${index * 0.03}s`,
                  animationFillMode: "forwards",
                }}
              >
                <RelationshipCard
                  relationship={rel}
                  compact
                  onClick={() => handleCardClick(rel)}
                />
              </div>
            ))}
          </div>
        )}

        {topPatterns.length >= 2 && (
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-rose-500/10 via-museum-gold/10 to-sky-500/10 border border-museum-gold/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-museum-gold/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-museum-gold" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-museum-paper mb-1">
                  你的关系人格侧写
                </h3>
                <p className="text-sm text-museum-paper/60 font-body">
                  基于你目前记录的 {stats.totalInteractions} 次互动，系统识别出以下模式
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {topPatterns.map((pattern, index) => (
                <div
                  key={pattern.patternName}
                  className="flex items-center gap-3 p-3 rounded-xl bg-museum-wall/30 border border-museum-gold/10"
                >
                  <span className="w-6 h-6 rounded-full bg-museum-gold/20 text-museum-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-museum-paper">
                      {pattern.patternName}
                    </p>
                    <p className="text-xs text-museum-paper/40">
                      出现在 {pattern.relationshipCategories.length} 种关系类型中
                      · 共 {pattern.count} 次触发
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-museum-paper/30" />
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-museum-paper/40 font-body leading-relaxed">
              💡 这些模式是你大脑的「默认设置」，它们曾经帮助过你适应某些环境。
              当你看见它们时，你就有了选择——可以继续使用它们，也可以尝试新的回应方式。
            </p>
          </div>
        )}
      </main>

      {showDetail && selectedRelationship && (
        <RelationshipDetailDrawer
          relationship={selectedRelationship}
          onClose={handleCloseDetail}
        />
      )}

      <AddRelationshipModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRelationship(null);
        }}
        editingRelationship={editingRelationship || null}
      />

      <LogInteractionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        relationship={selectedRelationship || null}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
  borderColor,
  suffix,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
  suffix?: string;
  subValue?: string;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-2xl border transition-all duration-300",
        "hover:shadow-lg",
        bgColor,
        borderColor
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={color}>{icon}</span>
        <span className={cn("text-xs font-medium", color)}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-museum-paper counter-animation">
          {value}
        </span>
        {suffix && (
          <span className="text-sm text-museum-paper/30">{suffix}</span>
        )}
      </div>
      {subValue && (
        <p className="text-[10px] text-museum-paper/30 mt-1">{subValue}</p>
      )}
    </div>
  );
}

interface RelationshipDetailDrawerProps {
  relationship: Relationship;
  onClose: () => void;
}

function RelationshipDetailDrawer({
  relationship,
  onClose,
}: RelationshipDetailDrawerProps) {
  const { getRelationshipInteractions, setIsLogModalOpen, setEditingRelationship, setIsAddModalOpen, deleteRelationship } =
    useRelationshipMapStore();

  const interactions = getRelationshipInteractions(relationship.id).sort(
    (a, b) => b.date - a.date
  );
  const colors = relationshipCategoryColors[relationship.category];

  const handleEdit = () => {
    setEditingRelationship(relationship);
    setIsAddModalOpen(true);
  };

  const handleDelete = () => {
    if (confirm(`确定要删除与 ${relationship.personName} 的关系记录吗？`)) {
      deleteRelationship(relationship.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md h-full bg-museum-wall border-l border-museum-gold/20 overflow-y-auto slide-in-right">
        <div className="sticky top-0 z-10 bg-museum-wall/80 backdrop-blur-md border-b border-museum-gold/10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br border",
                  colors.iconBg,
                  colors.border
                )}
              >
                <span className="text-xl font-bold text-museum-paper">
                  {relationship.personName.slice(0, 1)}
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-museum-paper">
                  {relationship.personName}
                </h3>
                <p className={cn("text-xs", colors.text)}>
                  {relationshipCategoryLabels[relationship.category]}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-museum-paper/50 hover:text-museum-paper hover:bg-museum-paper/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div
            className={cn(
              "p-4 rounded-xl border",
              colors.bg,
              colors.border
            )}
          >
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs text-museum-paper/50 mb-1">当前健康度</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-museum-paper">
                    {relationship.currentHealthScore}
                  </span>
                  <span className="text-sm text-museum-paper/40">/100</span>
                </div>
              </div>
            </div>
            <div className="relative w-full h-3 rounded-full bg-museum-wallLight overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  relationship.currentHealthScore >= 60
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : relationship.currentHealthScore >= 40
                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                    : "bg-gradient-to-r from-museum-warning to-museum-warningLight"
                )}
                style={{ width: `${relationship.currentHealthScore}%` }}
              />
            </div>
          </div>

          {relationship.description && (
            <div>
              <p className="text-xs text-museum-paper/50 mb-2">关系描述</p>
              <p className="text-sm text-museum-paper/70 font-body leading-relaxed">
                {relationship.description}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="flex-1 py-2.5 rounded-xl bg-gold-gradient text-museum-ink text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              记录互动
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2.5 rounded-xl border border-museum-gold/30 text-museum-gold text-sm font-medium hover:bg-museum-gold/10 transition-all"
            >
              编辑
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl border border-museum-warning/30 text-museum-warningLight text-sm font-medium hover:bg-museum-warning/10 transition-all"
            >
              删除
            </button>
          </div>

          {interactions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-museum-paper/70">
                  互动记录 ({interactions.length})
                </p>
              </div>

              <div className="space-y-3">
                {interactions.slice(0, 10).map((interaction) => (
                  <div
                    key={interaction.id}
                    className="p-3 rounded-xl bg-museum-wallLight/30 border border-museum-gold/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-museum-paper/80 line-clamp-2">
                        {interaction.summary}
                      </p>
                      <span
                        className={cn(
                          "text-xs font-bold flex-shrink-0 ml-2",
                          interaction.healthScoreChange > 0
                            ? "text-emerald-400"
                            : interaction.healthScoreChange < 0
                            ? "text-museum-warningLight"
                            : "text-museum-paper/40"
                        )}
                      >
                        {interaction.healthScoreChange > 0 ? "+" : ""}
                        {interaction.healthScoreChange}
                      </span>
                    </div>

                    {interaction.patterns.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {interaction.patterns.map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-museum-gold/10 text-museum-gold/70 border border-museum-gold/20"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-museum-paper/30">
                      {new Date(interaction.date).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {interactions.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-museum-paper/30">
                还没有互动记录
              </p>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="mt-3 text-sm text-museum-gold hover:underline"
              >
                记录第一次互动
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
