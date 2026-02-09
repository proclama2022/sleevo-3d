import React, { useState } from 'react';
import { CollectionItem, GENRE_COLORS, Genre } from '../types';
import { VinylCover } from './VinylCover';
import { ArrowLeft, Calendar, Disc3, Trophy, Sparkles, Search } from 'lucide-react';

interface CollectionScreenProps {
  collection: CollectionItem[];
  totalRareVinyls: number; // Total possible rare vinyls in game
  onClose: () => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  collection,
  totalRareVinyls,
  onClose,
}) => {
  const [filterGenre, setFilterGenre] = useState<Genre | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const discoveredCount = collection.length;
  const completionPercent = totalRareVinyls > 0
    ? Math.floor((discoveredCount / totalRareVinyls) * 100)
    : 0;

  // Sort and filter collection
  const sortedCollection = [...collection]
    .filter(item => filterGenre === 'all' || item.genre === filterGenre)
    .filter(item =>
      searchQuery === '' ||
      item.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime());

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-bricks opacity-40"></div>
      <div className="bg-noise"></div>
      <div className="vignette"></div>

      {/* Header */}
      <header className="relative z-10 w-full bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center justify-between shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white hover:text-neon-pink transition-colors"
        >
          <ArrowLeft size={24} />
          <span className="font-display text-lg">Indietro</span>
        </button>

        <div className="flex items-center gap-2">
          <Disc3 className="text-neon-pink" size={28} />
          <h1 className="text-2xl font-display text-white">Collezione</h1>
        </div>

        <div className="w-20"></div>
      </header>

      {/* Stats Bar */}
      <div className="relative z-10 w-full bg-black/40 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex justify-center gap-6 shrink-0">
        <div className="flex flex-col items-center">
          <div className="text-3xl font-display text-yellow-400">{discoveredCount}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Scoperti</div>
        </div>
        <div className="w-px bg-white/10"></div>
        <div className="flex flex-col items-center">
          <div className="text-3xl font-display text-blue-400">{totalRareVinyls}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Totali</div>
        </div>
        <div className="w-px bg-white/10"></div>
        <div className="flex flex-col items-center">
          <div className="text-3xl font-display text-green-400">{completionPercent}%</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Completo</div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 w-full px-4 py-4 shrink-0 space-y-3">
        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="search"
            placeholder="Search artist or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Genre filter buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 max-w-2xl mx-auto no-scrollbar">
          <button
            onClick={() => setFilterGenre('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-marker transition-all ${
              filterGenre === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
            }`}
          >
            All
          </button>
          {Object.values(Genre).map((genre) => (
            <button
              key={genre}
              onClick={() => setFilterGenre(genre)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-marker transition-all ${
                filterGenre === genre
                  ? 'bg-purple-600 text-white'
                  : 'bg-black/50 text-gray-300 hover:bg-black/70'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Per-genre statistics */}
        <div className="text-sm text-gray-400 text-center max-w-2xl mx-auto">
          {Object.values(Genre).map((genre) => {
            const count = collection.filter((v) => v.genre === genre).length;
            return (
              <span key={genre} className="mr-3">
                {genre}: {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Collection Grid */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {sortedCollection.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <Disc3 size={64} className="text-gray-600 mb-4 opacity-50" />
              <h2 className="text-2xl font-marker text-white/60 mb-2">Collezione Vuota</h2>
              <p className="text-gray-500 max-w-md">
                Trova vinili rari e speciali durante il gioco per riempire la tua collezione!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
              {sortedCollection.map((item, index) => {
                // Create a mock vinyl object for VinylCover
                const mockVinyl = {
                  id: `collection-${index}`,
                  type: 'vinyl' as const,
                  genre: item.genre,
                  title: item.title,
                  artist: item.artist,
                  coverColor: item.coverColor,
                  isGold: item.isGold,
                  specialType: item.specialType,
                  dustLevel: 0,
                  isRevealed: true,
                };

                return (
                  <div
                    key={`${item.artist}-${item.title}`}
                    className="group relative bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:border-white/30 transition-all hover:scale-105 cursor-pointer"
                  >
                    {/* Vinyl Cover */}
                    <div className="flex justify-center mb-3">
                      <VinylCover vinyl={mockVinyl} size={140} />
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <h3 className="font-display text-white text-sm truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">{item.artist}</p>

                      {/* Genre Badge */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${GENRE_COLORS[item.genre]} bg-opacity-20 border border-current`}>
                          {item.genre}
                        </span>
                        {item.isGold && (
                          <Trophy size={12} className="text-yellow-400" />
                        )}
                        {item.specialType === 'diamond' && (
                          <Sparkles size={12} className="text-cyan-400" />
                        )}
                      </div>

                      {/* Discovery Date */}
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-2">
                        <Calendar size={10} />
                        <span>{formatDate(item.discoveredAt)}</span>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-white/5 to-transparent"></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
