import { useState, type FormEvent } from "react";
import { Plus, Trash2, Sparkles, Loader2, MessageCircle, RefreshCw, AlertCircle } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import type { ParticipantRole } from "../types/bug";

const exampleScenarios = [
  {
    title: "情侣争吵",
    scenario: "约会迟到问题",
    dialogue: [
      { speaker: "A" as ParticipantRole, content: "你怎么又迟到了？每次都要我等你，你有没有一点时间观念？" },
      { speaker: "B" as ParticipantRole, content: "我不是说了路上堵车吗？你能不能不要总是这么斤斤计较？" },
      { speaker: "A" as ParticipantRole, content: "斤斤计较？上次等你半小时，这次又40分钟，你永远都是这样！" },
      { speaker: "B" as ParticipantRole, content: "那你走啊！谁让你等了？你不就是想找借口吵架吗？" },
    ],
  },
  {
    title: "同事矛盾",
    scenario: "项目责任推诿",
    dialogue: [
      { speaker: "A" as ParticipantRole, content: "这个Bug明明是你负责的模块出的问题，为什么要我来背锅？" },
      { speaker: "B" as ParticipantRole, content: "我写的代码没问题啊，肯定是你调用的时候传错参数了。" },
      { speaker: "A" as ParticipantRole, content: "你总是这样，出了问题就推给别人，从来不会承认自己的错！" },
      { speaker: "B" as ParticipantRole, content: "你说谁呢？上次那个项目还不是因为你需求没说清楚才延期的！" },
    ],
  },
  {
    title: "朋友误解",
    scenario: "借钱未还",
    dialogue: [
      { speaker: "A" as ParticipantRole, content: "上次借你的那笔钱，你看什么时候方便还我？我最近手头有点紧。" },
      { speaker: "B" as ParticipantRole, content: "至于吗？不就是几千块钱，你至于这么急着催吗？" },
      { speaker: "A" as ParticipantRole, content: "我都等了三个月了！你当时说一个月就还的，现在反而觉得我小气？" },
      { speaker: "B" as ParticipantRole, content: "行了行了，我知道了，不就是钱吗，我明天转你，真是看透你了。" },
    ],
  },
];

export function RelationshipInput() {
  const navigate = useNavigate();
  const {
    relationshipInput,
    setRelationshipParticipant,
    setRelationshipScenario,
    addDialogueTurn,
    updateDialogueTurn,
    removeDialogueTurn,
    clearDialogue,
    analyzeRelationship,
    isRelationshipLoading,
  } = useAppStore();

  const [newSpeaker, setNewSpeaker] = useState<ParticipantRole>("A");
  const [newContent, setNewContent] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const speakersInDialogue = new Set(relationshipInput.dialogue.map((t) => t.speaker));
  const hasBothSpeakers = speakersInDialogue.has("A") && speakersInDialogue.has("B");
  const canSubmit = relationshipInput.dialogue.length >= 2 && hasBothSpeakers;

  const handleAddTurn = () => {
    if (newContent.trim()) {
      addDialogueTurn(newSpeaker, newContent.trim());
      setNewContent("");
      setNewSpeaker(newSpeaker === "A" ? "B" : "A");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (relationshipInput.dialogue.length < 2) {
      setValidationError("至少需要2轮对话才能进行分析");
      return;
    }

    if (!hasBothSpeakers) {
      const missingSpeaker = !speakersInDialogue.has("A")
        ? relationshipInput.participantA.name || "A"
        : relationshipInput.participantB.name || "B";
      setValidationError(`需要双方都有发言才能分析，${missingSpeaker} 还没有说过话`);
      return;
    }

    await analyzeRelationship();
    navigate("/result");
  };

  const handleLoadExample = (example: typeof exampleScenarios[0]) => {
    clearDialogue();
    setRelationshipScenario(example.scenario);
    example.dialogue.forEach((turn) => {
      addDialogueTurn(turn.speaker, turn.content);
    });
  };

  const getSpeakerColor = (speaker: ParticipantRole) => {
    return speaker === "A"
      ? "from-blue-500/20 to-blue-600/10 border-blue-400/30"
      : "from-rose-500/20 to-rose-600/10 border-rose-400/30";
  };

  const getSpeakerBadgeColor = (speaker: ParticipantRole) => {
    return speaker === "A"
      ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
      : "bg-rose-500/20 text-rose-300 border-rose-400/30";
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-museum-paper/70 font-medium">参与者 A</span>
            <input
              type="text"
              value={relationshipInput.participantA.name}
              onChange={(e) => setRelationshipParticipant("A", "name", e.target.value)}
              placeholder="例如：小明"
              className="mt-1 w-full px-4 py-2.5 rounded-lg bg-museum-wallLight/30 border border-museum-gold/20 text-museum-paper placeholder:text-museum-paper/30 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/30 transition-all"
            />
          </label>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-museum-paper/70 font-medium">参与者 B</span>
            <input
              type="text"
              value={relationshipInput.participantB.name}
              onChange={(e) => setRelationshipParticipant("B", "name", e.target.value)}
              placeholder="例如：小红"
              className="mt-1 w-full px-4 py-2.5 rounded-lg bg-museum-wallLight/30 border border-museum-gold/20 text-museum-paper placeholder:text-museum-paper/30 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400/30 transition-all"
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block">
          <span className="text-sm text-museum-paper/70 font-medium">冲突场景</span>
          <textarea
            value={relationshipInput.scenario}
            onChange={(e) => setRelationshipScenario(e.target.value)}
            placeholder="简单描述一下发生了什么，例如：情侣因为约会迟到吵架..."
            rows={2}
            className="mt-1 w-full px-4 py-3 rounded-lg bg-museum-wallLight/30 border border-museum-gold/20 text-museum-paper placeholder:text-museum-paper/30 focus:outline-none focus:ring-2 focus:ring-museum-gold/30 focus:border-museum-gold/30 transition-all resize-none"
          />
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-museum-paper/70 font-medium">对话记录</span>
          {relationshipInput.dialogue.length > 0 && (
            <button
              type="button"
              onClick={clearDialogue}
              className="text-xs text-museum-paper/40 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              清空对话
            </button>
          )}
        </div>

        <div className="space-y-3 mb-4 min-h-[120px] p-4 rounded-xl bg-museum-wallLight/20 border border-museum-gold/10">
          {relationshipInput.dialogue.length === 0 ? (
            <div className="text-center py-8 text-museum-paper/30">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">还没有对话记录，添加下面的对话开始分析</p>
            </div>
          ) : (
            relationshipInput.dialogue.map((turn, index) => (
              <div
                key={index}
                className={cn(
                  "group relative p-4 rounded-xl border transition-all",
                  "bg-gradient-to-r",
                  getSpeakerColor(turn.speaker)
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                          getSpeakerBadgeColor(turn.speaker)
                        )}
                      >
                        {turn.speaker === "A"
                          ? relationshipInput.participantA.name || "A"
                          : relationshipInput.participantB.name || "B"}
                      </span>
                      <span className="text-[10px] text-museum-paper/30">第 {index + 1} 轮</span>
                    </div>
                    <textarea
                      value={turn.content}
                      onChange={(e) => updateDialogueTurn(index, e.target.value)}
                      className="w-full bg-transparent text-museum-paper/90 text-sm leading-relaxed resize-none outline-none"
                      rows={2}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDialogueTurn(index)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400/60 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex gap-2">
            {(["A", "B"] as ParticipantRole[]).map((speaker) => (
              <button
                key={speaker}
                type="button"
                onClick={() => setNewSpeaker(speaker)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                  newSpeaker === speaker
                    ? speaker === "A"
                      ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-400/40"
                    : "bg-museum-wallLight/20 text-museum-paper/50 border-museum-gold/10 hover:border-museum-gold/20"
                )}
              >
                {speaker === "A"
                  ? relationshipInput.participantA.name || "A"
                  : relationshipInput.participantB.name || "B"}
              </button>
            ))}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTurn();
                }
              }}
              placeholder="输入对话内容，按回车添加..."
              className="flex-1 px-4 py-2 rounded-lg bg-museum-wallLight/30 border border-museum-gold/20 text-museum-paper placeholder:text-museum-paper/30 focus:outline-none focus:ring-2 focus:ring-museum-gold/30 focus:border-museum-gold/30 transition-all"
            />
            <button
              type="button"
              onClick={handleAddTurn}
              disabled={!newContent.trim()}
              className="px-4 py-2 rounded-lg bg-museum-gold/20 text-museum-gold border border-museum-gold/30 hover:bg-museum-gold/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>
        </div>
      </div>

      <div>
        <p className="text-center text-museum-paper/50 text-sm mb-3">
          不知道写什么？试试这些示例：
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {exampleScenarios.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleLoadExample(example)}
              disabled={isRelationshipLoading}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-body transition-all duration-300",
                "border border-museum-gold/20 text-museum-paper/60",
                "hover:bg-museum-gold/10 hover:text-museum-paper hover:border-museum-gold/40",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>

      {validationError && (
        <div className="animate-fade-in">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-400/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-rose-300 font-medium">{validationError}</p>
              <p className="text-xs text-rose-300/60 mt-1">
                请确保对话中包含双方的发言，这样才能进行有效的关系分析
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isRelationshipLoading || !canSubmit}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-base transition-all duration-300",
            isRelationshipLoading || !canSubmit
              ? "bg-museum-gold/30 text-museum-inkLight/50 cursor-not-allowed"
              : "bg-gold-gradient text-museum-ink shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          )}
        >
          {isRelationshipLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              正在分析关系系统...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
              开始关系 Debug
              {!canSubmit && (
                <span className="text-xs opacity-60 ml-2">
                  {relationshipInput.dialogue.length < 2
                    ? "(至少需要2轮对话)"
                    : "(需要双方都有发言)"}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
