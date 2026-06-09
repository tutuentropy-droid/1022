import { useState, type KeyboardEvent, type FormEvent } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface ThoughtInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

const exampleThoughts = [
  "我是不是太晚了，感觉一切都来不及了",
  "这次面试肯定又会失败，我太紧张了",
  "他没回我消息，一定是讨厌我了",
  "大家都做得比我好，我真是没用",
  "今天犯了一个错误，我就是个彻头彻尾的失败者",
];

export function ThoughtInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "此刻你在想什么？把它写下来……",
}: ThoughtInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isLoading && value.trim()) {
      onSubmit();
    }
  };

  const handleExampleClick = (example: string) => {
    if (!isLoading) {
      onChange(example);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "relative rounded-2xl bg-paper-texture shadow-inner-paper transition-all duration-300",
          isFocused && "ring-2 ring-museum-gold/50 shadow-lg"
        )}
      >
        <span className="corner-decoration corner-decoration-tl" />
        <span className="corner-decoration corner-decoration-tr" />
        <span className="corner-decoration corner-decoration-bl" />
        <span className="corner-decoration corner-decoration-br" />

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={5}
          className="w-full bg-transparent px-8 pt-8 pb-20 text-museum-ink placeholder:text-museum-inkLight/40 font-body text-lg leading-relaxed resize-none outline-none disabled:opacity-60 disabled:cursor-not-allowed scrollbar-hide"
        />

        <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
          <span className="text-xs text-museum-inkLight/50 font-body">
            按 <kbd className="px-1.5 py-0.5 bg-museum-paperDark rounded text-museum-inkLight/70">⌘</kbd>{" "}
            +{" "}
            <kbd className="px-1.5 py-0.5 bg-museum-paperDark rounded text-museum-inkLight/70">↵</kbd>{" "}
            快速提交
          </span>

          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className={cn(
              "group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300",
              isLoading || !value.trim()
                ? "bg-museum-gold/30 text-museum-inkLight/50 cursor-not-allowed"
                : "bg-gold-gradient text-museum-ink shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                扫描中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
                扫描认知 Bug
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-center text-museum-paper/50 text-sm mb-3 font-body">
          不知道写什么？试试这些：
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {exampleThoughts.map((thought, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(thought)}
              disabled={isLoading}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-body transition-all duration-300",
                "border border-museum-gold/20 text-museum-paper/60",
                "hover:bg-museum-gold/10 hover:text-museum-paper hover:border-museum-gold/40",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {thought.length > 18 ? thought.slice(0, 18) + "..." : thought}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
