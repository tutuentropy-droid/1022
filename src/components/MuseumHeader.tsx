import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export function MuseumHeader() {
  return (
    <header className="relative py-8 px-4">
      <div className="container mx-auto text-center">
        <Link to="/" className="inline-flex flex-col items-center group">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-museum-gold/60 flex items-center justify-center bg-museum-wallLight/30 group-hover:bg-museum-gold/20 transition-all duration-300">
                <BookOpen className="w-6 h-6 text-museum-gold" />
              </div>
              <div className="absolute -inset-1 rounded-full border border-museum-gold/20 animate-pulse" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-museum-paper tracking-wider text-shadow-gold">
                认知 Bug 博物馆
              </h1>
              <p className="text-museum-gold/70 text-sm tracking-widest mt-1">
                MUSEUM OF COGNITIVE BUGS
              </p>
            </div>
          </div>
        </Link>

        <div className="museum-divider max-w-md mx-auto">
          <span className="text-museum-gold/60 text-xs">❖</span>
        </div>
      </div>
    </header>
  );
}
