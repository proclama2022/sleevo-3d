import React from 'react';
import { SaveData } from '../services/storage';
import { X, TrendingUp, Award, Clock, Disc, Target, Zap } from 'lucide-react';

interface StatsScreenProps {
  saveData: SaveData;
  onClose: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ saveData, onClose }) => {
  // Calculate total play time (estimate based on games played, avg 2 minutes per game)
  const estimatedPlayTimeMinutes = saveData.stats.totalGames * 2;
  const playTimeHours = Math.floor(estimatedPlayTimeMinutes / 60);
  const playTimeMinutes = estimatedPlayTimeMinutes % 60;

  // Calculate win rate
  const winRate = saveData.stats.totalGames > 0
    ? Math.floor((saveData.stats.wins / saveData.stats.totalGames) * 100)
    : 0;

  // Get top 10 levels by score
  const topLevels = Object.entries(saveData.levelRecords)
    .map(([levelIndex, record]) => ({
      levelIndex: parseInt(levelIndex),
      ...record,
    }))
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 10);

  // Get last 10 completed levels for progress chart
  const completedLevels = Object.entries(saveData.levelRecords)
    .map(([levelIndex, record]) => ({
      levelIndex: parseInt(levelIndex),
      ...record,
    }))
    .filter(level => level.wins > 0)
    .sort((a, b) => a.levelIndex - b.levelIndex)
    .slice(-10);

  // Find max score for chart scaling
  const maxChartScore = Math.max(...completedLevels.map(l => l.bestScore), 100);

  const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
    <div className={`bg-black/40 rounded-lg p-4 border ${color} flex items-center gap-3`}>
      <div className={`w-12 h-12 rounded-full ${color.replace('border-', 'bg-').replace('500', '500/20')} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-display ${color.replace('border-', 'text-')}`}>{value}</div>
        <div className="text-gray-400 text-xs uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-[#1a1110] border-2 border-[#5c4033] rounded-2xl shadow-2xl max-w-2xl w-full relative">
          <div className="bg-[#2a1d18] border border-[#3e2723] rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp size={32} className="text-blue-400" />
                <h2 className="text-3xl font-display text-white">Statistiche</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* General Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <StatCard
                icon={<Clock className="text-purple-400" size={24} />}
                label="Tempo Gioco"
                value={playTimeHours > 0 ? `${playTimeHours}h ${playTimeMinutes}m` : `${playTimeMinutes}m`}
                color="border-purple-500/50"
              />
              <StatCard
                icon={<Disc className="text-cyan-400" size={24} />}
                label="Vinili Sortati"
                value={saveData.stats.totalVinylsSorted}
                color="border-cyan-500/50"
              />
              <StatCard
                icon={<Target className="text-green-400" size={24} />}
                label="Tasso Vittoria"
                value={`${winRate}%`}
                color="border-green-500/50"
              />
              <StatCard
                icon={<Zap className="text-yellow-400" size={24} />}
                label="Best Combo"
                value={`${saveData.stats.maxCombo}x`}
                color="border-yellow-500/50"
              />
            </div>

            {/* Record Globali */}
            <div className="bg-black/60 rounded-lg p-4 mb-6 border border-yellow-500/30">
              <h3 className="text-lg font-display text-yellow-400 mb-3 flex items-center gap-2">
                <Award size={20} />
                Record Globali
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Livelli Perfetti</div>
                  <div className="text-white font-display text-xl">{saveData.stats.perfectLevels}</div>
                </div>
                <div>
                  <div className="text-gray-400">Partite Totali</div>
                  <div className="text-white font-display text-xl">{saveData.stats.totalGames}</div>
                </div>
                <div>
                  <div className="text-gray-400">Vittorie</div>
                  <div className="text-white font-display text-xl">{saveData.stats.wins}</div>
                </div>
                <div>
                  <div className="text-gray-400">Miglior Punteggio</div>
                  <div className="text-white font-display text-xl">{saveData.highScore}</div>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            {completedLevels.length > 0 && (
              <div className="bg-black/40 rounded-lg p-4 mb-6 border border-blue-500/30">
                <h3 className="text-lg font-display text-blue-400 mb-4">Progressi Recenti</h3>
                <div className="flex items-end justify-between gap-2 h-40">
                  {completedLevels.map((level) => {
                    const height = (level.bestScore / maxChartScore) * 100;
                    return (
                      <div key={level.levelIndex} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-xs text-white font-mono">{level.bestScore}</div>
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-500 hover:to-blue-300 cursor-pointer"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                          title={`Level ${level.levelIndex + 1}: ${level.bestScore} pts`}
                        />
                        <div className="text-[10px] text-gray-500 font-mono">L{level.levelIndex + 1}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top 10 Leaderboard */}
            {topLevels.length > 0 && (
              <div className="bg-black/40 rounded-lg p-4 border border-green-500/30">
                <h3 className="text-lg font-display text-green-400 mb-4">Top 10 Livelli</h3>
                <div className="space-y-2">
                  {topLevels.map((level, index) => (
                    <div
                      key={level.levelIndex}
                      className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5 hover:border-green-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500' :
                          index === 1 ? 'bg-gray-400/20 text-gray-300 border-2 border-gray-400' :
                          index === 2 ? 'bg-orange-600/20 text-orange-400 border-2 border-orange-600' :
                          'bg-white/10 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-display">Livello {level.levelIndex + 1}</div>
                          <div className="text-xs text-gray-400">
                            Combo {level.bestCombo}x • {level.stars}★ • {level.wins}/{level.attempts} vittorie
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-display text-xl">{level.bestScore}</div>
                        <div className="text-[10px] text-gray-500 uppercase">punti</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Data Message */}
            {topLevels.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Disc size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg">Nessuna statistica disponibile</p>
                <p className="text-sm">Gioca alcuni livelli per vedere i tuoi progressi!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
