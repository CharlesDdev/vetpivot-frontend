import React from 'react';
import type { TranslationResult } from '../types';
import TranslationCard from './TranslationCard';
import Spinner from './Spinner';

interface TranslationOutputProps {
  translations: TranslationResult | null;
  onRegenerate: () => void;
  isLoading: boolean;
  hasSubmitted: boolean;
  error: string | null;
}

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const TranslationOutput: React.FC<TranslationOutputProps> = ({
  translations,
  onRegenerate,
  isLoading,
  hasSubmitted,
  error,
}) => {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-400/80">Step 2</p>
          <h2 className="text-2xl font-serif font-bold text-light-tan tracking-wide">Results</h2>
        </div>
        <button
          onClick={onRegenerate}
          disabled={isLoading || !hasSubmitted}
          className="flex items-center gap-2 px-1 py-1 text-sm font-medium text-light-tan/70 hover:text-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Regenerating...' : 'Regenerate Results'}
        </button>
      </div>

      <div className="mt-5">
        {!hasSubmitted && !translations && (
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-5">
            <p className="text-lg font-semibold text-light-tan">Your translated bullets will appear here</p>
            <p className="mt-2 text-sm text-light-tan/70">
              Complete Step 1 to generate Professional, Plain-English, and ATS versions.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-5 flex items-center gap-3" aria-live="polite">
            <Spinner />
            <p className="text-sm text-light-tan/80">Generating your results...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-5" role="alert">
            <p className="text-base font-semibold text-red-200">We couldn’t generate results</p>
            <p className="mt-2 text-sm text-red-100">{error}</p>
          </div>
        )}

        {!isLoading && !error && translations && (
          <div className="grid grid-cols-1 gap-4">
            <TranslationCard
              title="Professional Version"
              content={translations.professional}
              copyLabel="Copy professional"
            />
            <TranslationCard
              title="Plain-English Version"
              content={translations.casual}
              copyLabel="Copy plain-English"
            />
            <TranslationCard
              title="ATS Version"
              content={translations.ats}
              copyLabel="Copy ATS"
            />
          </div>
        )}

        {hasSubmitted && !isLoading && !error && !translations && (
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-5">
            <p className="text-lg font-semibold text-light-tan">No results yet</p>
            <p className="mt-2 text-sm text-light-tan/70">Try again, or paste a different bullet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TranslationOutput;
