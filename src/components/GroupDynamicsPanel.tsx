import {
  Users,
  UserMinus,
  Activity,
  MessageCircle,
  Zap,
  Shield,
  Lightbulb,
  TrendingUp,
  Heart,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";
import type { GroupDynamicsAnalysis } from "../types/groupDynamics";

interface GroupDynamicsPanelProps {
  analysis: GroupDynamicsAnalysis;
}

export function GroupDynamicsPanel({ analysis }: GroupDynamicsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Heart className="w-5 h-5" />}
          label="整体健康度"
          value={analysis.overallHealth}
          suffix="/100"
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-400/30"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="群体凝聚力"
          value={analysis.cohesion}
          suffix="%"
          color="text-sky-400"
          bgColor="bg-sky-500/10"
          borderColor="border-sky-400/30"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="冲突水平"
          value={analysis.conflictLevel}
          suffix="%"
          color="text-rose-400"
          bgColor="bg-rose-500/10"
          borderColor="border-rose-400/30"
        />
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-museum-gold/10 via-transparent to-museum-gold/5 border border-museum-gold/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-museum-gold/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-museum-gold" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-museum-paper">
              关键洞察
            </h3>
            <p className="text-xs text-museum-paper/50">
              基于群体互动数据的分析结论
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {analysis.keyInsights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 rounded-xl bg-museum-wall/30 border border-museum-gold/10"
            >
              <span className="w-5 h-5 rounded-full bg-museum-gold/20 text-museum-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {index + 1}
              </span>
              <p className="text-sm text-museum-paper/80 leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          icon={<Users className="w-5 h-5" />}
          title="联盟关系"
          subtitle="识别出的紧密盟友"
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-400"
          count={analysis.alliances.length}
        >
          {analysis.alliances.length === 0 ? (
            <EmptyState text="暂未识别到明显的联盟关系" />
          ) : (
            <div className="space-y-3">
              {analysis.alliances.map((alliance) => (
                <div
                  key={alliance.id}
                  className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-400/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {alliance.memberNames.map((name, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-emerald-500/30 border-2 border-museum-wall flex items-center justify-center text-xs font-medium text-emerald-300"
                          >
                            {name.slice(0, 1)}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-museum-paper">
                        {alliance.memberNames.join(" & ")}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-400 font-medium">
                      {Math.round(alliance.strength)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-emerald-500/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                      style={{ width: `${alliance.strength}%` }}
                    />
                  </div>
                  {alliance.evidence.length > 0 && (
                    <p className="text-xs text-museum-paper/40 mt-2 line-clamp-2">
                      证据：{alliance.evidence[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<UserMinus className="w-5 h-5" />}
          title="边缘角色"
          subtitle="参与度较低的成员"
          iconBg="bg-sky-500/20"
          iconColor="text-sky-400"
          count={analysis.peripheralMembers.length}
        >
          {analysis.peripheralMembers.length === 0 ? (
            <EmptyState text="所有成员参与度良好" />
          ) : (
            <div className="space-y-3">
              {analysis.peripheralMembers.map((member, index) => (
                <div
                  key={member.memberId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/5 border border-sky-400/20"
                >
                  <span className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sm font-medium text-sky-300">
                    {member.memberName.slice(0, 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-museum-paper truncate">
                      {member.memberName}
                    </p>
                    <p className="text-xs text-sky-400/70">{member.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-sky-400">
                      {member.centralityScore}%
                    </p>
                    <p className="text-[10px] text-museum-paper/40">中心度</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<Zap className="w-5 h-5" />}
          title="冲突放大者"
          subtitle="倾向使矛盾升级的人"
          iconBg="bg-rose-500/20"
          iconColor="text-rose-400"
          count={analysis.conflictAmplifiers.length}
        >
          {analysis.conflictAmplifiers.length === 0 ? (
            <EmptyState text="未识别到明显的冲突放大行为" />
          ) : (
            <div className="space-y-3">
              {analysis.conflictAmplifiers.map((amplifier, index) => (
                <div
                  key={amplifier.memberId}
                  className="p-3 rounded-xl bg-rose-500/5 border border-rose-400/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      <span className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-base font-bold text-rose-300">
                        {amplifier.memberName.slice(0, 1)}
                      </span>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-museum-paper">
                        {amplifier.memberName}
                      </p>
                      <p className="text-xs text-rose-400">
                        放大指数 {amplifier.amplificationScore}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-rose-400">
                        #{index + 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {amplifier.behaviors.map((behavior, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-300 border border-rose-400/20"
                      >
                        {behavior}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<Shield className="w-5 h-5" />}
          title="矛盾缓冲者"
          subtitle="有助于化解冲突的人"
          iconBg="bg-amber-500/20"
          iconColor="text-amber-400"
          count={analysis.conflictBuffers.length}
        >
          {analysis.conflictBuffers.length === 0 ? (
            <EmptyState text="未识别到明显的缓冲行为" />
          ) : (
            <div className="space-y-3">
              {analysis.conflictBuffers.map((buffer, index) => (
                <div
                  key={buffer.memberId}
                  className="p-3 rounded-xl bg-amber-500/5 border border-amber-400/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-base font-bold text-amber-300">
                        {buffer.memberName.slice(0, 1)}
                      </span>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-museum-paper">
                        {buffer.memberName}
                      </p>
                      <p className="text-xs text-amber-400">
                        缓冲指数 {buffer.bufferScore}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-400">
                        #{index + 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {buffer.behaviors.map((behavior, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-300 border border-amber-400/20"
                      >
                        {behavior}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<Activity className="w-5 h-5" />}
          title="情绪传染"
          subtitle="情绪在群体中的传播"
          iconBg="bg-purple-500/20"
          iconColor="text-purple-400"
          count={analysis.emotionalContagions.length}
        >
          {analysis.emotionalContagions.length === 0 ? (
            <EmptyState text="未观察到明显的情绪传染现象" />
          ) : (
            <div className="space-y-3">
              {analysis.emotionalContagions.map((contagion, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-purple-500/5 border border-purple-400/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {getEmotionEmoji(contagion.emotion)}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-museum-paper">
                        {getEmotionLabel(contagion.emotion)}传染
                      </p>
                      <p className="text-xs text-purple-400/70">
                        源头：{contagion.sourceMemberName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-museum-paper/50">
                      影响了 {contagion.affectedMemberNames.length} 人：
                    </span>
                    <div className="flex -space-x-1.5">
                      {contagion.affectedMemberNames.slice(0, 3).map((name, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-purple-500/30 border border-museum-wall flex items-center justify-center text-[10px] font-medium text-purple-300"
                          title={name}
                        >
                          {name.slice(0, 1)}
                        </div>
                      ))}
                      {contagion.affectedMemberNames.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-museum-wall flex items-center justify-center text-[10px] text-purple-300">
                          +{contagion.affectedMemberNames.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-museum-paper/40">
                      传播速度：{contagion.spreadSpeed} 分钟
                    </span>
                    <span className="text-purple-400 font-medium">
                      强度 {contagion.intensity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={<MessageCircle className="w-5 h-5" />}
          title="误解扩散"
          subtitle="信息传递中的偏差"
          iconBg="bg-orange-500/20"
          iconColor="text-orange-400"
          count={analysis.misunderstandingSpreads.length}
        >
          {analysis.misunderstandingSpreads.length === 0 ? (
            <EmptyState text="未识别到明显的误解扩散" />
          ) : (
            <div className="space-y-3">
              {analysis.misunderstandingSpreads.map((spread) => (
                <div
                  key={spread.id}
                  className="p-3 rounded-xl bg-orange-500/5 border border-orange-400/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center text-sm font-medium text-orange-300">
                      {spread.originMemberName.slice(0, 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-orange-400/70">
                        源头：{spread.originMemberName}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-orange-400">
                      危害 {spread.harmLevel}%
                    </span>
                  </div>
                  <p className="text-xs text-museum-paper/60 mb-2 line-clamp-2">
                    「{spread.content}」
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-museum-paper/40">
                      传播路径：
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-orange-300">
                        {spread.originMemberName}
                      </span>
                      <ChevronRight className="w-3 h-3 text-museum-paper/30" />
                      <span className="text-[10px] text-museum-paper/60">
                        {spread.spreadMemberNames.slice(0, 2).join(" → ")}
                        {spread.spreadMemberNames.length > 2 &&
                          ` +${spread.spreadMemberNames.length - 2}人`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  color,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  bgColor: string;
  borderColor: string;
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
        <span className="text-2xl font-bold text-museum-paper counter-animation">
          {value}
        </span>
        {suffix && (
          <span className="text-sm text-museum-paper/30">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  iconBg,
  iconColor,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div>
            <h4 className="font-display text-base font-bold text-museum-paper">
              {title}
            </h4>
            <p className="text-xs text-museum-paper/40">{subtitle}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-museum-gold/10 text-museum-gold border border-museum-gold/20">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-museum-paper/30">{text}</p>
    </div>
  );
}

function getEmotionEmoji(emotion: string): string {
  const emojiMap: Record<string, string> = {
    anger: "😠",
    sadness: "😢",
    joy: "😊",
    fear: "😨",
    surprise: "😮",
    disgust: "😒",
  };
  return emojiMap[emotion] || "😐";
}

function getEmotionLabel(emotion: string): string {
  const labelMap: Record<string, string> = {
    anger: "愤怒",
    sadness: "悲伤",
    joy: "喜悦",
    fear: "恐惧",
    surprise: "惊讶",
    disgust: "厌恶",
  };
  return labelMap[emotion] || "中性";
}
