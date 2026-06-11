import { useState } from "react";
import { X, MessageSquare, Users, Zap, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import type { InputSourceType, Group } from "../types/groupDynamics";
import { inputSourceTypeLabels } from "../types/groupDynamics";
import { useGroupDynamicsStore } from "../store/useGroupDynamicsStore";
import { parseChatContent } from "../services/groupDynamicsService";

interface GroupInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
}

const sourceTypeOptions: {
  type: InputSourceType;
  icon: React.ReactNode;
  description: string;
  placeholder: string;
  example: string;
}[] = [
  {
    type: "chat",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "粘贴群聊记录，分析群体互动模式",
    placeholder: "粘贴群聊记录，每行一条消息...",
    example: `张三：大家好，今天的会议几点开始？
李四：下午三点吧
王五：我同意，三点没问题
赵六：我觉得太早了，四点行不行？
张三：那四点吧，大家都方便`,
  },
  {
    type: "meeting",
    icon: <Users className="w-5 h-5" />,
    description: "输入会议记录，识别讨论中的角色分工",
    placeholder: "输入会议记录内容...",
    example: `主持人：今天我们讨论一下项目进度
张三：我这边开发已经完成80%了
李四：测试这边还需要两天
王五：我觉得这个方案有问题
主持人：王五说说你的看法
王五：我们应该考虑用户反馈`,
  },
  {
    type: "conflict",
    icon: <Zap className="w-5 h-5" />,
    description: "描述团队冲突，分析冲突升级机制",
    placeholder: "描述团队冲突的经过...",
    example: `张三：这个方案根本行不通，太草率了
李四：你凭什么这么说？我们讨论了很久
张三：讨论有什么用，实际做出来才知道
王五：大家冷静一下，各有各的道理
李四：不行，今天必须说清楚
赵六：我支持张三的看法`,
  },
];

export function GroupInputModal({
  isOpen,
  onClose,
  group,
}: GroupInputModalProps) {
  const [sourceType, setSourceType] = useState<InputSourceType>("chat");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewCount, setPreviewCount] = useState<{
    messages: number;
    members: number;
  } | null>(null);

  const { addInputData, runAnalysis } = useGroupDynamicsStore();

  const currentOption = sourceTypeOptions.find((o) => o.type === sourceType)!;

  const handleContentChange = (value: string) => {
    setContent(value);

    if (value.trim().length > 20 && group) {
      const { messages, members } = parseChatContent(group.id, value);
      setPreviewCount({
        messages: messages.length,
        members: members.length,
      });
    } else {
      setPreviewCount(null);
    }
  };

  const handleSubmit = async () => {
    if (!group || !content.trim()) return;

    setIsAnalyzing(true);

    try {
      addInputData({
        groupId: group.id,
        sourceType,
        title: title || undefined,
        rawContent: content,
      });

      runAnalysis(group.id);

      setTimeout(() => {
        setIsAnalyzing(false);
        onClose();
        setContent("");
        setTitle("");
        setPreviewCount(null);
      }, 1000);
    } catch (error) {
      setIsAnalyzing(false);
    }
  };

  const handleLoadExample = () => {
    setContent(currentOption.example);
    handleContentChange(currentOption.example);
  };

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-museum-wall rounded-2xl border border-museum-gold/20 shadow-2xl overflow-hidden animate-scale-in">
        <div className="sticky top-0 z-10 bg-museum-wall/90 backdrop-blur-md border-b border-museum-gold/10">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-museum-gold/20 to-museum-gold/5 border border-museum-gold/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-museum-gold" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-museum-paper">
                  输入群体互动记录
                </h3>
                <p className="text-xs text-museum-paper/50">
                  {group.name} · 系统将自动分析群体动力
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

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {sourceTypeOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setSourceType(option.type)}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left",
                  sourceType === option.type
                    ? "bg-museum-gold/10 border-museum-gold/40 text-museum-gold"
                    : "bg-museum-wallLight/30 border-museum-gold/10 text-museum-paper/60 hover:border-museum-gold/20"
                )}
              >
                <div className="mb-2">{option.icon}</div>
                <p className="text-sm font-medium mb-1">
                  {inputSourceTypeLabels[option.type]}
                </p>
                <p className="text-[10px] opacity-70 line-clamp-2">
                  {option.description}
                </p>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-museum-paper/70 mb-2">
              记录标题（可选）
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`例如：2024年${new Date().getMonth() + 1}月项目会议`}
              className="w-full px-4 py-2.5 rounded-xl bg-museum-wallLight/30 border border-museum-gold/20 text-museum-paper text-sm placeholder:text-museum-paper/30 focus:outline-none focus:border-museum-gold/40 focus:ring-1 focus:ring-museum-gold/20 transition-all"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-museum-paper/70">
                {inputSourceTypeLabels[sourceType]}内容
              </label>
              <button
                onClick={handleLoadExample}
                className="text-xs text-museum-gold hover:underline"
              >
                加载示例
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={currentOption.placeholder}
              rows={12}
              className="w-full px-4 py-3 rounded-xl bg-museum-wallLight/30 border border-museum-gold/20 text-museum-paper text-sm placeholder:text-museum-paper/30 focus:outline-none focus:border-museum-gold/40 focus:ring-1 focus:ring-museum-gold/20 transition-all resize-none font-mono text-xs leading-relaxed"
            />
          </div>

          {previewCount && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300">
                    {previewCount.messages} 条消息
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300">
                    {previewCount.members} 位成员
                  </span>
                </div>
              </div>
              <p className="text-xs text-emerald-300/60 mt-2">
                系统已识别出以上内容，点击提交即可进行群体动力分析
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-museum-gold/30 text-museum-gold text-sm font-medium hover:bg-museum-gold/10 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isAnalyzing}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-museum-ink text-sm font-medium shadow-md transition-all flex items-center justify-center gap-2",
                content.trim() && !isAnalyzing
                  ? "bg-gold-gradient hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-museum-gold/30 cursor-not-allowed"
              )}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-museum-ink/30 border-t-museum-ink rounded-full animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  提交分析
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
