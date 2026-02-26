import React, { useMemo, useState } from 'react';
import type { TranslationResult } from '../types';

interface DashboardProps {
  result: TranslationResult;
  onRunAnotherTranslation: () => void;
}

interface BulletItem {
  id: string;
  label: string;
  exportHeading: string;
  text: string;
}

const getTranslatedBullets = (result: TranslationResult): BulletItem[] => {
  const candidates: BulletItem[] = [
    { id: 'professional', label: 'Professional Version', exportHeading: 'Professional', text: result.professional },
    { id: 'plain', label: 'Plain-English Version', exportHeading: 'Plain English', text: result.casual },
    { id: 'ats', label: 'ATS Version', exportHeading: 'ATS', text: result.ats },
  ];

  return candidates.filter((candidate) => candidate.text.trim().length > 0);
};

const textToBulletLines = (text: string): string[] => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•\s]+/, '').trim())
    .filter(Boolean);

  if (lines.length > 0) {
    return lines;
  }

  const singleLine = text.replace(/\s+/g, ' ').trim();
  return singleLine ? [singleLine] : [];
};

const buildExportText = (translatedBullets: BulletItem[]): string => {
  const header = [
    'VetPivot — Translated Bullets',
    `Date: ${new Date().toISOString()}`,
    '',
  ];

  const sections = translatedBullets.flatMap((bullet) => {
    const bulletLines = textToBulletLines(bullet.text);
    const renderedLines = bulletLines.map((line) => `- ${line}`);
    return [bullet.exportHeading, ...renderedLines, ''];
  });

  return [...header, ...sections].join('\n').trimEnd();
};

const Dashboard: React.FC<DashboardProps> = ({ result, onRunAnotherTranslation }) => {
  const translatedBullets = getTranslatedBullets(result);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyError, setCopyError] = useState<string | null>(null);
  const exportText = useMemo(() => buildExportText(translatedBullets), [translatedBullets]);

  const handleCopyBullets = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyState('copied');
      setCopyError(null);
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      setCopyError('Unable to copy to clipboard. Please try again.');
      window.setTimeout(() => setCopyState('idle'), 2500);
    }
  };

  const handleDownloadBullets = () => {
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `vetpivot-translated-bullets-${timestamp}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="animate-in fade-in duration-300 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-gold-400/80">Dashboard Alpha</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-light-tan tracking-tight font-serif">Translation Results Dashboard</h1>
        <p className="text-sm sm:text-base text-light-tan/70">Review translated bullets and next-step guidance in one place.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-wide text-gold-400/80">Translation Strength</p>
          <p className="mt-3 text-4xl font-bold text-light-tan">74%</p>
          <p className="mt-2 text-sm text-light-tan/60">Placeholder heuristic score for alpha.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-wide text-gold-400/80">Top 3 Role Matches</p>
          <ul className="mt-3 space-y-2 text-sm text-light-tan/85">
            <li>Operations Manager — 82%</li>
            <li>Project Manager — 76%</li>
            <li>Logistics Coordinator — 71%</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-wide text-gold-400/80">Strengths</p>
          <ul className="mt-3 list-disc list-inside space-y-2 text-sm text-light-tan/85">
            <li>Leadership and team coordination are clearly represented.</li>
            <li>Operational ownership and accountability are easy to understand.</li>
            <li>Impact-oriented language maps well to civilian resume standards.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-wide text-gold-400/80">Civilian Alignment Opportunities</p>
          <p className="mt-3 text-sm text-light-tan/80">
            Consider adding business outcomes, tool names, and scope metrics to improve role-specific alignment.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-5">
        <p className="text-xs uppercase tracking-wide text-gold-400/80">Translated Bullet Bank</p>
        <div className="mt-3 max-h-72 overflow-y-auto space-y-3 pr-1">
          {translatedBullets.map((bullet) => (
            <article key={bullet.id} className="rounded-lg border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-wide text-light-tan/50">{bullet.label}</p>
              <p className="mt-2 text-sm text-light-tan/90 whitespace-pre-wrap">{bullet.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-5">
        <p className="text-xs uppercase tracking-wide text-gold-400/80">Export Actions</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopyBullets}
            className="px-4 py-2 rounded-lg bg-dark-olive text-light-tan/90 border border-white/10 hover:bg-dark-olive/80 transition-colors"
          >
            {copyState === 'copied' ? 'Copied!' : 'Copy Bullets'}
          </button>
          <button
            type="button"
            onClick={handleDownloadBullets}
            className="px-4 py-2 rounded-lg bg-dark-olive text-light-tan/90 border border-white/10 hover:bg-dark-olive/80 transition-colors"
          >
            Download Bullets
          </button>
        </div>
        {copyError && <p className="mt-3 text-sm text-red-300">{copyError}</p>}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onRunAnotherTranslation}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 text-dark-charcoal font-semibold hover:from-gold-500 hover:to-gold-400 transition-all"
        >
          Run Another Translation
        </button>
      </div>
    </section>
  );
};

export default Dashboard;
