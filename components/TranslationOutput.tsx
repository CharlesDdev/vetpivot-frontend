import React from 'react';
import type { TranslationResult } from '../types';
import TranslationCard from './TranslationCard';

interface TranslationOutputProps {
  translations: TranslationResult;
  onRegenerate: () => void;
  isLoading: boolean;
}

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const TranslationOutput: React.FC<TranslationOutputProps> = ({ translations, onRegenerate, isLoading }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end">
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-light-tan/80 hover:text-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Regenerating...' : 'Regenerate Results'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TranslationCard title="Professional Resume Bullet" content={translations.professional} />
        <TranslationCard title="Casual Explanation" content={translations.casual} />
        <TranslationCard title="ATS-Optimized Version" content={translations.ats} />
      </div>
    </div>
  );
};

// Add fade-in animation to tailwind config if possible, or define here
// This is a simple way to add it without config access
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default TranslationOutput;
