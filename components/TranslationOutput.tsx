import React from 'react';
import type { TranslationResult } from '../types';
import TranslationCard from './TranslationCard';
import Spinner from './Spinner';

interface TranslationOutputProps {
  translations: TranslationResult | null;
  isLoading: boolean;
  hasSubmitted: boolean;
  error: string | null;
}

const TranslationOutput: React.FC<TranslationOutputProps> = ({
  translations,
  isLoading,
  hasSubmitted,
  error,
}) => {
  const primaryTranslation = translations
    ? [translations.professional, translations.casual, translations.ats].find((value) => value.trim().length > 0) ?? ''
    : '';

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-xl">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-400/80">Step 2</p>
          <h2 className="text-2xl font-serif font-bold text-light-tan tracking-wide">Results</h2>
        </div>
      </div>

      <div className="mt-5">
        {!hasSubmitted && !translations && (
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-5">
            <p className="text-lg font-semibold text-light-tan">Your civilian-ready translation will appear here</p>
            <p className="mt-2 text-sm text-light-tan/70">
              Complete Step 1 to generate your translation.
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
              title="Civilian-Ready Translation"
              content={primaryTranslation}
              copyLabel="Copy translation"
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
