import { useState, useEffect } from 'react';
import { Flame, Zap } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  const [showHero, setShowHero] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowHero(true), 500);
    const timer2 = setTimeout(() => setShowButton(true), 1500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div className={`text-center transition-all duration-1000 transform ${showHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-yellow-400 rounded-full opacity-20"></div>
              <Flame className="w-32 h-32 text-yellow-300 drop-shadow-2xl relative z-10 animate-pulse" />
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl tracking-tight">
            MYSELF<span className="text-yellow-300">HERO</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed">
            Deviens le héros de ta propre vie. Transforme tes habitudes,
            entraîne-toi comme un héros, et atteins ton véritable potentiel.
          </p>
        </div>

        <div className={`transition-all duration-1000 transform ${showButton ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <button
            onClick={onGetStarted}
            className="group relative px-12 py-6 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-xl rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-yellow-400/50 active:scale-95"
          >
            <span className="flex items-center gap-3">
              <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              COMMENCE TON AVENTURE
              <Zap className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
            </span>
            <div className="absolute inset-0 rounded-full bg-yellow-300 blur-xl opacity-0 group-hover:opacity-50 transition-opacity -z-10"></div>
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
