import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HintButtonProps {
  onClick: () => void;
  disabled: boolean;
  visible: boolean;
}

export const HintButton: React.FC<HintButtonProps> = ({ onClick, disabled, visible }) => {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-cyan-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform z-40"
      title="Hint (costa 1 mossa)"
    >
      <HelpCircle size={28} className="mx-auto" />
    </button>
  );
};
