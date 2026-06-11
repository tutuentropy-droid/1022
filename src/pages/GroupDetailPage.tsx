import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Users,
  MessageSquare,
  Settings,
  Trash2,
  Edit,
  Network,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { useGroupDynamicsStore } from "../store/useGroupDynamicsStore";
import {
  groupCategoryLabels,
  groupCategoryColors,
} from "../types/groupDynamics";
import { NetworkGraph } from "../components/NetworkGraph";
import { GroupDynamicsPanel } from "../components/GroupDynamicsPanel";
import { GroupInputModal } from "../components/GroupInputModal";
import { AddGroupModal } from "../components/AddGroupModal";

type TabType = "network" | "analysis";

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("network");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    groups,
    isInputModalOpen,
    isAddGroupModalOpen,
    editingGroup,
    selectedGroupId,
    setIsInputModalOpen,
    setIsAddGroupModalOpen,
    setEditingGroup,
    setSelectedGroupId,
    getGroupAnalysis,
    getNetworkGraph,
    runAnalysis,
    deleteGroup,
    getGroupMessages,
  } = useGroupDynamicsStore();

  const group = groups.find((g) => g.id === groupId) || null;
  const analysis = groupId ? getGroupAnalysis(groupId) : null;
  const networkData = groupId ? getNetworkGraph(groupId) : null;
  const messages = groupId ? getGroupMessages(groupId) : [];

  useEffect(() => {
    if (group && !analysis && group.messageCount > 0) {
      handleRunAnalysis();
    }
  }, [group, groupId]);

  const handleRunAnalysis = () => {
    if (!groupId) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      runAnalysis(groupId);
      setIsAnalyzing(false);
    }, 500);
  };

  const handleAddInput = () => {
    if (groupId) {
      setSelectedGroupId(groupId);
      setIsInputModalOpen(true);
    }
  };

  const handleEditGroup = () => {
    if (group) {
      setEditingGroup(group);
      setIsAddGroupModalOpen(true);
    }
  };

  const handleDeleteGroup = () => {
    if (!group) return;
    if (confirm(`确定要删除群组「${group.name}」吗？所有数据将被清除。`)) {
      deleteGroup(group.id);
      navigate("/group-dynamics");
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-museum-wall flex items-center justify-center">
        <div className="text-center">
          <p className="text-museum-paper/50 mb-4">群组不存在</p>
          <button
            onClick={() => navigate("/group-dynamics")}
            className="text-museum-gold hover:underline"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const colors = groupCategoryColors[group.category];

  return (
    <div className="min-h-screen bg-museum-wall">
      <header className="sticky top-0 z-30 bg-museum-wall/90 backdrop-blur-md border-b border-museum-gold/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/group-dynamics")}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-museum-paper/50 hover:text-museum-paper hover:bg-museum-paper/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                    colors.gradient
                  )}
                >
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-museum-paper">
                    {group.name}
                  </h1>
                  <p className={cn("text-xs", colors.text)}>
                    {groupCategoryLabels[group.category]}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunAnalysis}
                disabled={group.messageCount === 0 || isAnalyzing}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  group.messageCount > 0 && !isAnalyzing
                    ? "bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30"
                    : "bg-museum-paper/5 text-museum-paper/30 cursor-not-allowed"
                )}
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isAnalyzing && "animate-spin")} />
                {isAnalyzing ? "分析中..." : "重新分析"}
              </button>
              <button
                onClick={handleAddInput}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-gradient text-museum-ink text-xs font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                输入记录
              </button>
              <div className="relative group">
                <button className="w-9 h-9 rounded-lg flex items-center justify-center text-museum-paper/50 hover:text-museum-paper hover:bg-museum-paper/10 transition-all">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-32 py-1 rounded-lg bg-museum-wall border border-museum-gold/20 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={handleEditGroup}
                    className="w-full px-3 py-2 text-left text-xs text-museum-paper/70 hover:bg-museum-paper/5 hover:text-museum-paper flex items-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    编辑群组
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除群组
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-4 border-b border-museum-gold/10">
            <TabButton
              active={activeTab === "network"}
              onClick={() => setActiveTab("network")}
              icon={<Network className="w-4 h-4" />}
              label="关系网络"
            />
            <TabButton
              active={activeTab === "analysis"}
              onClick={() => setActiveTab("analysis")}
              icon={<BarChart3 className="w-4 h-4" />}
              label="动力分析"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {group.messageCount === 0 ? (
          <EmptyState groupName={group.name} onAddInput={handleAddInput} />
        ) : activeTab === "network" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="p-6 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-purple-300" />
                    <h2 className="font-display text-lg font-bold text-museum-paper">
                      关系网络图
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-museum-paper/50">
                    <Users className="w-3.5 h-3.5" />
                    {group.members.length} 位成员
                  </div>
                </div>
                {networkData && networkData.nodes.length > 0 ? (
                  <NetworkGraph data={networkData} width={800} height={500} />
                ) : (
                  <div className="h-[500px] flex items-center justify-center">
                    <p className="text-museum-paper/30">暂无网络数据</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/10">
                <h3 className="font-display text-sm font-bold text-museum-paper mb-3">
                  快速统计
                </h3>
                <div className="space-y-3">
                  <StatRow
                    icon={<Users className="w-4 h-4" />}
                    label="成员数"
                    value={group.members.length}
                    color="text-sky-400"
                  />
                  <StatRow
                    icon={<MessageSquare className="w-4 h-4" />}
                    label="消息数"
                    value={group.messageCount}
                    color="text-emerald-400"
                  />
                  {analysis && (
                    <>
                      <StatRow
                        icon={<Network className="w-4 h-4" />}
                        label="联盟数"
                        value={analysis.alliances.length}
                        color="text-purple-400"
                      />
                      <StatRow
                        icon={<MessageSquare className="w-4 h-4" />}
                        label="冲突水平"
                        value={`${analysis.conflictLevel}%`}
                        color="text-rose-400"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/10">
                <h3 className="font-display text-sm font-bold text-museum-paper mb-3">
                  成员列表
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-museum-paper/5 transition-all"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
                        style={{ backgroundColor: member.color || "#6b7280" }}
                      >
                        {member.name.slice(0, 1)}
                      </div>
                      <span className="text-sm text-museum-paper/80 truncate">
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          analysis ? (
            <GroupDynamicsPanel analysis={analysis} />
          ) : (
            <div className="py-16 text-center">
              <p className="text-museum-paper/50 mb-4">暂无分析数据</p>
              <button
                onClick={handleRunAnalysis}
                className="text-museum-gold hover:underline"
              >
                运行分析
              </button>
            </div>
          )
        )}

        {messages.length > 0 && activeTab === "analysis" && (
          <div className="mt-8">
            <h3 className="font-display text-lg font-bold text-museum-paper mb-4">
              互动记录
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {messages.slice(-20).reverse().map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-museum-wallLight/30 border border-museum-gold/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: (
                          group.members.find((m) => m.id === msg.senderId)
                            ?.color || "#6b7280"
                        ) + "30",
                        color:
                          group.members.find((m) => m.id === msg.senderId)
                            ?.color || "#6b7280",
                      }}
                    >
                      {msg.senderName}
                    </span>
                    <span className="text-xs text-museum-paper/30">
                      {new Date(msg.timestamp).toLocaleString("zh-CN")}
                    </span>
                    {msg.conflictLevel && msg.conflictLevel > 30 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                        冲突 {msg.conflictLevel}%
                      </span>
                    )}
                    {msg.isPositive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        积极
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-museum-paper/70 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <GroupInputModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        group={group}
      />

      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => {
          setIsAddGroupModalOpen(false);
          setEditingGroup(null);
        }}
        editingGroup={editingGroup}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all",
        active
          ? "text-purple-300 border-purple-400"
          : "text-museum-paper/50 border-transparent hover:text-museum-paper/70"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={color}>{icon}</span>
        <span className="text-xs text-museum-paper/60">{label}</span>
      </div>
      <span className="text-sm font-bold text-museum-paper">{value}</span>
    </div>
  );
}

function EmptyState({
  groupName,
  onAddInput,
}: {
  groupName: string;
  onAddInput: () => void;
}) {
  return (
    <div className="py-20 text-center">
      <div className="w-24 h-24 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-400/20">
        <MessageSquare className="w-12 h-12 text-purple-300/40" />
      </div>
      <h3 className="font-display text-xl text-museum-paper mb-2">
        还没有互动记录
      </h3>
      <p className="text-museum-paper/40 font-body text-sm mb-6 max-w-md mx-auto">
        输入群聊记录、会议记录或团队冲突描述，
        <br />
        系统将分析「{groupName}」的群体动力模式。
      </p>
      <button
        onClick={onAddInput}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-museum-ink font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      >
        <Plus className="w-5 h-5" />
        输入第一条记录
      </button>
    </div>
  );
}
