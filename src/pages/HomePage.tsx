import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Brain, Shield, User } from "lucide-react";
import { MuseumHeader } from "../components/MuseumHeader";
import { ThoughtInput } from "../components/ThoughtInput";
import { PersonalitySelector } from "../components/PersonalitySelector";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";

const features = [
  {
    icon: <Search className="w-5 h-5" />,
    title: "精准识别",
    desc: "基于认知心理学研究，帮助你发现隐藏的思维模式",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "深度解读",
    desc: "每一种认知偏差都配有详细解释和典型表现示例",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "应对策略",
    desc: "提供可操作的方法，帮助你从思维陷阱中走出来",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { userInput, setUserInput, analyzeThought, isLoading } = useAppStore();

  const handleSubmit = async () => {
    await analyzeThought();
    navigate("/result");
  };

  return (
    <div className="min-h-screen bg-museum-wall flex flex-col">
      <MuseumHeader />

      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-16">
          <div className="text-center mb-12 animate-fade-up opacity-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-museum-gold/10 border border-museum-gold/20 mb-6">
              <Brain className="w-4 h-4 text-museum-gold" />
              <span className="text-sm text-museum-gold/90 font-body tracking-wide">
                认知偏差诊断工具
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-bold text-museum-paper mb-4 leading-tight">
              把你的想法
              <span className="relative inline-block mx-2">
                <span className="relative z-10 text-museum-gold">交出来</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-museum-gold/20 -z-0" />
              </span>
              让我们看看
            </h2>

            <p className="font-body text-museum-paper/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              我们的大脑会产生各种各样的认知偏差，它们像 Bug 一样悄悄影响着我们的判断和情绪。
              输入你此刻的想法，让我们帮你找出潜藏的思维 Bug。
            </p>
          </div>

          <div className="w-full animate-fade-up opacity-0 stagger-delay-1">
            <PersonalitySelector />
            <ThoughtInput
              value={userInput}
              onChange={setUserInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className={cn(
                  "relative p-6 rounded-2xl bg-museum-wallLight/30 border border-museum-gold/10",
                  "animate-fade-up opacity-0 transition-all duration-300",
                  "hover:bg-museum-wallLight/50 hover:border-museum-gold/20",
                  `stagger-delay-${idx + 2}`
                )}
                style={{ animationDelay: `${(idx + 2) * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-museum-gold/15 flex items-center justify-center text-museum-gold mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-museum-paper mb-2">
                  {feature.title}
                </h3>
                <p className="font-body text-sm text-museum-paper/55 leading-relaxed">
                  {feature.desc}
                </p>

                <span className="corner-decoration corner-decoration-tl" />
                <span className="corner-decoration corner-decoration-br" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-6 text-center">
        <p className="text-xs text-museum-paper/30 font-body">
          本工具仅供自我觉察参考，不作为心理诊断依据
        </p>
      </footer>
    </div>
  );
}
