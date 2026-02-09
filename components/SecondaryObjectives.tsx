import React, { useState } from 'react';
import { SecondaryObjective } from '../types';
import { Target, CheckCircle2, ChevronDown, ChevronUp, Clock, Zap } from 'lucide-react';

interface SecondaryObjectivesProps {
  objectives: SecondaryObjective[];
}

export const SecondaryObjectives: React.FC<SecondaryObjectivesProps> = ({ objectives }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!objectives || objectives.length === 0) return null;

  const completedCount = objectives.filter(obj => obj.completed).length;

  return (
    <div className="fixed top-16 right-4 z-30 w-64 animate-fade-in">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-br from-purple-900 to-purple-700 backdrop-blur rounded-t-lg px-3 py-2 flex items-center justify-between border border-purple-500/30 hover:border-purple-400/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target size={16} className="text-purple-300" />
          <span className="text-white font-marker text-sm">
            Obiettivi {completedCount}/{objectives.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-purple-300" />
        ) : (
          <ChevronDown size={16} className="text-purple-300" />
        )}
      </button>

      {/* Objectives List */}
      {isExpanded && (
        <div className="bg-black/90 backdrop-blur rounded-b-lg border-x border-b border-purple-500/30 p-3 space-y-2">
          {objectives.map((obj) => (
            <ObjectiveCard key={obj.id} objective={obj} />
          ))}
        </div>
      )}
    </div>
  );
};

const ObjectiveCard: React.FC<{ objective: SecondaryObjective }> = ({ objective }) => {
  const getIcon = () => {
    switch (objective.type) {
      case 'combo_streak':
        return <Zap size={14} className="text-orange-400" />;
      case 'time_limit':
        return <Clock size={14} className="text-blue-400" />;
      default:
        return <Target size={14} className="text-purple-400" />;
    }
  };

  const hasProgress = objective.targetValue !== undefined && objective.currentValue !== undefined;

  return (
    <div
      className={`
        relative rounded-lg p-2.5 border transition-all
        ${objective.completed
          ? 'bg-green-900/30 border-green-500/50'
          : 'bg-gray-900/50 border-gray-700/50'
        }
      `}
    >
      {/* Title and Icon */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 flex-1">
          {getIcon()}
          <span
            className={`font-marker text-xs ${
              objective.completed ? 'text-green-300 line-through' : 'text-white'
            }`}
          >
            {objective.title}
          </span>
        </div>
        {objective.completed && (
          <CheckCircle2
            size={16}
            className="text-green-400 flex-shrink-0"
            fill="rgba(74,222,128,0.2)"
          />
        )}
      </div>

      {/* Description */}
      <p className={`text-[10px] ${objective.completed ? 'text-green-400/70' : 'text-gray-400'}`}>
        {objective.description}
      </p>

      {/* Progress Bar (for objectives with targetValue) */}
      {hasProgress && !objective.completed && (
        <div className="mt-2">
          <div className="flex justify-between text-[9px] text-gray-500 mb-0.5">
            <span>{objective.currentValue}</span>
            <span>{objective.targetValue}</span>
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{
                width: `${Math.min(
                  ((objective.currentValue || 0) / (objective.targetValue || 1)) * 100,
                  100
                )}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Bonus XP Badge */}
      <div className="absolute -top-1.5 -right-1.5">
        <div
          className={`
            text-[9px] font-bold px-1.5 py-0.5 rounded-full border
            ${objective.completed
              ? 'bg-green-500 text-white border-green-400'
              : 'bg-purple-900 text-purple-300 border-purple-700'
            }
          `}
        >
          +{objective.bonusXP} XP
        </div>
      </div>
    </div>
  );
};
