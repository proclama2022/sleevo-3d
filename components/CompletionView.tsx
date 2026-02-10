import React from 'react';
import { X, Package } from 'lucide-react';
import { Crate } from '../types';
import { CrateBox } from './CrateBox';

interface CompletionViewProps {
  crates: Crate[];
  onClose: () => void;
}

/**
 * CompletionView - Shows all organized crates side-by-side
 * Provides visual satisfaction of seeing the completed organization
 */
export const CompletionView: React.FC<CompletionViewProps> = ({ crates, onClose }) => {
  const registerRef = () => {}; // Dummy - not interactive in this view
  const registerStackRef = () => {}; // Dummy

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 overflow-y-auto">
      <div className="max-w-6xl mx-auto mt-10 mb-10 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Package size={32} className="text-cyan-400" />
            <h2 className="font-display text-3xl text-white">Organized Crates</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Close"
          >
            <X size={32} />
          </button>
        </div>

        {/* Description */}
        <p className="text-center text-gray-400 mb-8 font-marker text-lg">
          Your perfectly organized vinyl collection
        </p>

        {/* Crates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crates.map((crate) => (
            <div key={crate.id} className="flex flex-col items-center">
              {/* Crate Label */}
              <div className="mb-3 text-center">
                <div className="font-display text-xl text-white mb-1">
                  {crate.label}
                </div>
                <div className="text-sm text-gray-400">
                  {crate.filled}/{crate.capacity} vinyls
                </div>
              </div>

              {/* Crate Box */}
              <div className="transform hover:scale-105 transition-transform duration-300">
                <CrateBox
                  crate={crate}
                  highlightState="none"
                  hideLabel={true}
                  onRegisterRef={registerRef}
                  onRegisterStackRef={registerStackRef}
                />
              </div>

              {/* Completion Badge */}
              {crate.filled === crate.capacity && (
                <div className="mt-3 px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full text-white text-sm font-bold">
                  ✓ Complete
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Close Button */}
        <div className="mt-10 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-lg transition-all shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
