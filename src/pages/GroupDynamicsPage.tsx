import { useState } from "react";
import {
  Network,
  Plus,
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  Sparkles,
  Grid3X3,
  List,
  Filter,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useGroupDynamicsStore } from "../store/useGroupDynamicsStore";
import type { GroupCategory, Group } from "../types/groupDynamics";
import {
  groupCategoryLabels,
  groupCategoryColors,
} from "../types/groupDynamics";
import { GroupCard } from "../components/GroupCard";
import { AddGroupModal } from "../components/AddGroupModal";
import { GroupInputModal } from "../components/GroupInputModal";
import { useNavigate } from "react-router-dom";

const categories: (GroupCategory | "all")[] = [
  "all",
  "work",
  "family",
  "friend",
  "community",
  "other",
];

export default function GroupDynamicsPage() {
  const navigate = useNavigate();
  const {
    groups,
    isAddGroupModalOpen,
    isInputModalOpen,
    editingGroup,
    selectedGroupId,
    setIsAddGroupModalOpen,
    setIsInputModalOpen,
    setEditingGroup,
    setSelectedGroupId,
    getOverallStats,
    runAnalysis,
  } = useGroupDynamicsStore();

  const [activeCategory, setActiveCategory] =
    useState<(GroupCategory | "all")>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const stats = getOverallStats();

  const filteredGroups =
    activeCategory === "all"
      ? groups
      : groups.filter((g) => g.category === activeCategory);

  const sortedGroups = [...filteredGroups].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  const handleAddGroup = () => {
    setEditingGroup(null);
    setIsAddGroupModalOpen(true);
  };

  const handleGroupClick = (group: Group) => {
    navigate(`/group-dynamics/${group.id}`);
  };

  const handleInputClick = (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGroupId(group.id);
    setIsInputModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-museum-wall">
      <header className="relative py-8 px-4 border-b border-museum-gold/10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/10 border border-purple-400/40 flex items-center justify-center">
                  <Network className="w-6 h-6 text-purple-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-museum-paper">
                  群体动力系统
                </h1>
                <p className="text-purple-300/70 text-sm">
                  从「个人问题」升级到「群体动力」视角
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddGroup}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-gradient text-museum-ink text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                添加群组
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="群组总数"
            value={stats.totalGroups}
            color="text-sky-400"
            bgColor="bg-sky-500/10"
            borderColor="border-sky-400/30"
          />
          <StatCard
            icon={<MessageSquare className="w-5 h-5" />}
            label="消息总数"
            value={stats.totalMessages}
            color="text-emerald-400"
            bgColor="bg-emerald-500/10"
            borderColor="border-emerald-400/30"
          />
          <StatCard
            icon={<Heart className="w-5 h-5" />}
            label="成员总数"
            value={stats.totalMembers}
            color="text-museum-gold"
            bgColor="bg-museum-gold/10"
            borderColor="border-museum-gold/30"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="平均健康度"
            value={stats.avgGroupHealth}
            suffix="/100"
            color="text-rose-400"
            bgColor="bg-rose-500/10"
            borderColor="border-rose-400/30"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-museum-gold/5 to-pink-500/10 border border-purple-400/20">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-museum-paper mb-1">
                  群体动力分析
                </h3>
                <p className="text-sm text-museum-paper/60 leading-relaxed">
                  系统可以分析群体中的联盟关系、边缘角色、情绪传染、误解扩散等模式。
                  支持输入群聊记录、会议记录、团队冲突等多种数据来源。
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FeatureItem
                icon="🤝"
                title="联盟检测"
                desc="识别紧密互动的盟友关系"
              />
              <FeatureItem
                icon="👤"
                title="边缘角色"
                desc="发现参与度较低的成员"
              />
              <FeatureItem
                icon="😠"
                title="情绪传染"
                desc="追踪情绪在群体中的传播"
              />
              <FeatureItem
                icon="💬"
                title="误解扩散"
                desc="分析信息传递中的偏差"
              />
              <FeatureItem
                icon="⚡"
                title="冲突放大者"
                desc="识别使矛盾升级的角色"
              />
              <FeatureItem
                icon="🛡️"
                title="矛盾缓冲者"
                desc="发现化解冲突的关键人物"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/10">
            <h3 className="font-display text-lg font-bold text-museum-paper mb-4">
              快速开始
            </h3>
            <div className="space-y-3">
              <StepItem
                step={1}
                title="创建群组"
                desc="添加你要分析的群体"
              />
              <StepItem
                step={2}
                title="输入记录"
                desc="粘贴群聊或会议记录"
              />
              <StepItem
                step={3}
                title="查看分析"
                desc="了解群体动力模式"
              />
            </div>
            <button
              onClick={handleAddGroup}
              className="w-full mt-5 py-2.5 rounded-xl bg-gold-gradient text-museum-ink text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              立即开始
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Filter className="w-4 h-4 text-museum-paper/40 flex-shrink-0" />
            {categories.map((cat) => {
              const count =
                cat === "all"
                  ? groups.length
                  : groups.filter((g) => g.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    activeCategory === cat
                      ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                      : "text-museum-paper/50 hover:text-museum-paper/70 hover:bg-museum-paper/5"
                  )}
                >
                  {cat === "all" ? "全部" : groupCategoryLabels[cat]}
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px]",
                      activeCategory === cat
                        ? "bg-purple-500/30 text-museum-ink"
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
                  ? "bg-purple-500/20 text-purple-300"
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
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-museum-paper/40 hover:text-museum-paper/60"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {sortedGroups.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-400/20">
              <Users className="w-10 h-10 text-purple-300/40" />
            </div>
            <h3 className="font-display text-xl text-museum-paper mb-2">
              还没有添加任何群组
            </h3>
            <p className="text-museum-paper/40 font-body text-sm mb-6 max-w-md mx-auto">
              添加你想要分析的群体，输入群聊或会议记录，
              系统会帮你发现群体中的互动模式和动力结构。
            </p>
            <button
              onClick={handleAddGroup}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-museum-ink font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              添加第一个群组
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedGroups.map((group, index) => (
              <div
                key={group.id}
                className="animate-fade-up opacity-0"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: "forwards",
                }}
              >
                <GroupCard
                  group={group}
                  onClick={() => handleGroupClick(group)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedGroups.map((group, index) => (
              <div
                key={group.id}
                className="animate-fade-up opacity-0"
                style={{
                  animationDelay: `${index * 0.03}s`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="p-4 rounded-xl bg-museum-wallLight/30 border border-museum-gold/10 hover:border-museum-gold/20 transition-all cursor-pointer flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
                      groupCategoryColors[group.category].gradient
                    )}
                  >
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-museum-paper">
                        {group.name}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded",
                          groupCategoryColors[group.category].bg,
                          groupCategoryColors[group.category].text
                        )}
                      >
                        {groupCategoryLabels[group.category]}
                      </span>
                    </div>
                    <p className="text-xs text-museum-paper/40">
                      {group.members.length} 位成员 · {group.messageCount} 条消息
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleInputClick(group, e)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-museum-gold/10 text-museum-gold border border-museum-gold/20 hover:bg-museum-gold/20 transition-all"
                    >
                      输入记录
                    </button>
                    <ChevronRight className="w-4 h-4 text-museum-paper/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => {
          setIsAddGroupModalOpen(false);
          setEditingGroup(null);
        }}
        editingGroup={editingGroup}
      />

      <GroupInputModal
        isOpen={isInputModalOpen}
        onClose={() => {
          setIsInputModalOpen(false);
        }}
        group={selectedGroup}
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
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
  suffix?: string;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg",
        bgColor,
        borderColor
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className={cn("text-xs font-medium", color)}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-museum-paper counter-animation">
          {value}
        </span>
        {suffix && <span className="text-sm text-museum-paper/30">{suffix}</span>}
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-museum-wall/30 border border-museum-gold/10">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-sm font-medium text-museum-paper">{title}</p>
        <p className="text-xs text-museum-paper/40">{desc}</p>
      </div>
    </div>
  );
}

function StepItem({
  step,
  title,
  desc,
}: {
  step: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-museum-gold/20 text-museum-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {step}
      </span>
      <div>
        <p className="text-sm font-medium text-museum-paper">{title}</p>
        <p className="text-xs text-museum-paper/40">{desc}</p>
      </div>
    </div>
  );
}
