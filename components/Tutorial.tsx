import React, { useState, useEffect } from 'react';
import { Hand, Target, HelpCircle, Zap, Trash2, Star, Flame, Package } from 'lucide-react';
import { TutorialStep } from '../types';
import { playTutorialNarration, stopNarration } from '../services/voiceNarration';

interface TutorialProps {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
  onSkipStep: () => void;
  targetElement?: HTMLElement | null;
}

const TUTORIAL_CONTENT: Record<TutorialStep, {
  title: string;
  description: string;
  icon: React.ElementType;
  highlight?: 'vinyl' | 'crate' | 'moves' | 'trash';
}> = {
  drag: {
    title: "Trascina i Dischi",
    description: "Prendi un disco e trascinalo nel crate del genere giusto!",
    icon: Hand,
    highlight: 'vinyl',
  },
  genre: {
    title: "Controlla il Genere",
    description: "Ogni crate ha un'etichetta con il genere musicale. Fai match!",
    icon: Target,
    highlight: 'crate',
  },
  mystery: {
    title: "Dischi Misteriosi",
    description: "I dischi con ? devono essere scoperti prima. Toccali per rivelare il genere!",
    icon: HelpCircle,
    highlight: 'vinyl',
  },
  moves: {
    title: "Attenzione alle Mosse",
    description: "Hai un numero limitato di mosse. Completa il livello prima che finiscano!",
    icon: Zap,
    highlight: 'moves',
  },
  trash: {
    title: "Dischi Rovinati",
    description: "Alcuni dischi sono troppo danneggiati! Trascinali nel cestino invece che nei crate.",
    icon: Trash2,
    highlight: 'trash',
  },
  special: {
    title: "Dischi Speciali",
    description: "I dischi dorati e speciali danno bonus punteggio e effetti unici. Cercali!",
    icon: Star,
    highlight: 'vinyl',
  },
  combo: {
    title: "Combo e Moltiplicatori",
    description: "Ordina dischi dello stesso genere di seguito per creare combo e moltiplicare il punteggio!",
    icon: Flame,
    highlight: 'moves',
  },
  capacity: {
    title: "Capacità dei Crate",
    description: "Ogni crate ha una capacità massima. Pianifica bene lo spazio disponibile!",
    icon: Package,
    highlight: 'crate',
  },
  complete: {
    title: "Sei Pronto!",
    description: "Ordina tutti i dischi prima che finiscano le mosse. Buona fortuna!",
    icon: Target,
  },
};

export const Tutorial: React.FC<TutorialProps> = ({ step, onNext, onSkip, onSkipStep, targetElement }) => {
  const [visible, setVisible] = useState(false);
  const content = TUTORIAL_CONTENT[step];

  useEffect(() => {
    setVisible(true);

    // Play voice narration for this tutorial step
    playTutorialNarration(step);

    // Cleanup: stop narration when step changes or component unmounts
    return () => {
      stopNarration();
    };
  }, [step]);

  if (step === 'complete') {
    return null;
  }

  // Calculate position for tooltip arrow
  const getTooltipPosition = (): React.CSSProperties => {
    if (!targetElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = targetElement.getBoundingClientRect();
    const screenHeight = window.innerHeight;

    // Position below the element
    if (rect.bottom + 200 < screenHeight) {
      return {
        top: rect.bottom + 20,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
      };
    }

    // Position above the element
    return {
      top: rect.top - 20,
      left: rect.left + rect.width / 2,
      transform: 'translate(-50%, -100%)',
    };
  };

  return (
    <>
      {/* Dark Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 z-50 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onSkip}
      />

      {/* Spotlight Effect on Target */}
      {targetElement && (
        <div
          className="fixed z-[51] pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 10,
            left: targetElement.getBoundingClientRect().left - 10,
            width: targetElement.getBoundingClientRect().width + 20,
            height: targetElement.getBoundingClientRect().height + 20,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* Animated Pointer Hand */}
      {step === 'drag' && targetElement && (
        <div
          className="fixed z-[52] pointer-events-none animate-bounce"
          style={{
            top: targetElement.getBoundingClientRect().top + targetElement.getBoundingClientRect().height / 2 - 20,
            left: targetElement.getBoundingClientRect().left + targetElement.getBoundingClientRect().width + 10,
          }}
        >
          <Hand size={40} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>
      )}

      {/* Tutorial Card */}
      <div
        className={`fixed z-[60] bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-2xl border-2 border-cyan-500 p-6 max-w-sm transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        style={getTooltipPosition()}
      >
        {/* Icon */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <content.icon size={24} className="text-cyan-400" />
          </div>
          <h3 className="font-display text-xl text-white">{content.title}</h3>
        </div>

        {/* Description */}
        <p className="font-marker text-gray-300 text-sm mb-4 leading-relaxed">
          {content.description}
        </p>

        {/* Progress Dots */}
        <div className="flex gap-2 mb-4 justify-center">
          {['drag', 'genre', 'mystery', 'moves', 'trash', 'special', 'combo', 'capacity'].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                s === step ? 'bg-cyan-400 w-6' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onSkipStep}
            className="px-3 py-2 rounded-lg bg-gray-700/50 text-gray-300 font-marker text-xs hover:bg-gray-700 transition-colors"
          >
            Salta Step
          </button>
          <button
            onClick={onSkip}
            className="flex-1 py-2 px-4 rounded-lg bg-gray-700/50 text-gray-300 font-marker text-sm hover:bg-gray-700 transition-colors"
          >
            Salta Tutto
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-2 px-4 rounded-lg bg-cyan-500 text-white font-marker text-sm hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          >
            {step === 'capacity' ? 'Inizia!' : 'Avanti'}
          </button>
        </div>
      </div>
    </>
  );
};
