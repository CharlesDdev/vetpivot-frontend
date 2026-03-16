import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { TranslationResult, TranslationTargetRole } from '../types';

interface DashboardProps {
  result: TranslationResult;
  selectedOccupation?: TranslationTargetRole | null;
  onBackToInputs: () => void;
  onRunAnotherTranslation: () => void;
}

interface BulletItem {
  id: string;
  label: string;
  exportHeading: string;
  text: string;
}

interface RoleScore {
  role: string;
  score: number;
}

const getTranslatedBullets = (result: TranslationResult): BulletItem[] => {
  const candidates: BulletItem[] = [
    { id: 'professional', label: 'Professional Version', exportHeading: 'Professional', text: result.professional },
    { id: 'plain', label: 'Plain-English Version', exportHeading: 'Plain English', text: result.casual },
    { id: 'ats', label: 'ATS Version', exportHeading: 'ATS', text: result.ats },
  ];

  return candidates.filter((candidate) => candidate.text.trim().length > 0);
};

const clampScore = (value: number): number => Math.max(55, Math.min(90, value));

const containsKeyword = (text: string, keyword: string): boolean => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(text);
};

const getTranslationStrengthScore = (translatedBullets: BulletItem[]): number => {
  const allText = translatedBullets.map((item) => item.text).join('\n');
  const lowerText = allText.toLowerCase();
  let score = 60;

  const impactWords = ['increased', 'reduced', 'saved', 'improved'];
  const matchedImpactWords = impactWords.filter((word) => containsKeyword(lowerText, word)).length;
  const hasPercent = /\d+(\.\d+)?%/.test(allText);
  const hasCurrency = /\$\s?\d/.test(allText);
  const hasNumber = /\b\d+([.,]\d+)?\b/.test(allText);
  const impactSignals = matchedImpactWords + (hasPercent ? 1 : 0) + (hasCurrency ? 1 : 0) + (hasNumber ? 1 : 0);
  score += Math.min(18, impactSignals * 3);

  const actionVerbs = ['led', 'managed', 'coordinated', 'executed', 'delivered', 'implemented', 'improved', 'reduced', 'trained'];
  const matchedActionVerbs = actionVerbs.filter((verb) => containsKeyword(lowerText, verb)).length;
  score += Math.min(10, matchedActionVerbs * 2);

  const totalLines = allText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length;
  if (totalLines >= 3) {
    score += 6;
  } else if (totalLines >= 2) {
    score += 3;
  }

  return clampScore(score);
};

const ROLE_KEYWORDS: Array<{ role: string; keywords: string[] }> = [
  { role: 'Operations Manager', keywords: ['operations', 'sop', 'process', 'workflow', 'efficiency', 'coordination', 'execution', 'readiness', 'compliance'] },
  { role: 'Project Manager', keywords: ['project', 'timeline', 'milestones', 'deliverables', 'stakeholders', 'scope', 'risk', 'plan', 'schedule'] },
  { role: 'Logistics Coordinator', keywords: ['logistics', 'supply', 'inventory', 'shipping', 'distribution', 'procurement', 'transport', 'warehouse'] },
];

const getRoleMatchScores = (translatedBullets: BulletItem[]): RoleScore[] => {
  const combinedText = translatedBullets.map((item) => item.text).join(' ').toLowerCase();

  return ROLE_KEYWORDS.map((roleSet) => {
    const overlap = roleSet.keywords.filter((keyword) => containsKeyword(combinedText, keyword)).length;
    const score = clampScore(60 + overlap * 4);
    return { role: roleSet.role, score };
  }).sort((a, b) => b.score - a.score).slice(0, 3);
};

const applySelectedRoleLabel = (topRoleMatches: RoleScore[], selectedRoleTitle?: string): RoleScore[] => {
  const safeTitle = selectedRoleTitle?.trim();
  if (!safeTitle || topRoleMatches.length === 0) {
    return topRoleMatches;
  }

  const remainingRoles = topRoleMatches.filter((role) => role.role.toLowerCase() !== safeTitle.toLowerCase());
  return [{ role: safeTitle, score: topRoleMatches[0].score }, ...remainingRoles].slice(0, 3);
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

const Dashboard: React.FC<DashboardProps> = ({
  result,
  selectedOccupation,
  onBackToInputs,
  onRunAnotherTranslation,
}) => {
  const topAnchorRef = useRef<HTMLDivElement | null>(null);
  const translatedBullets = getTranslatedBullets(result);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyError, setCopyError] = useState<string | null>(null);
  const translationStrengthScore = useMemo(() => getTranslationStrengthScore(translatedBullets), [translatedBullets]);
  const topRoleMatches = useMemo(
    () => applySelectedRoleLabel(getRoleMatchScores(translatedBullets), selectedOccupation?.title),
    [translatedBullets, selectedOccupation?.title]
  );
  const exportText = useMemo(() => buildExportText(translatedBullets), [translatedBullets]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      topAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

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
      <div ref={topAnchorRef} className="scroll-mt-24" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-widest text-gold-400/80">Dashboard Alpha</p>
        <div>
          <button
            type="button"
            onClick={onBackToInputs}
            className="text-sm text-light-tan/80 underline underline-offset-4 hover:text-gold-300 transition-colors"
          >
            Back to Inputs / Role Fit
          </button>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-light-tan tracking-tight font-serif">Translation Results Dashboard</h1>
        <p className="text-sm sm:text-base text-light-tan/70">Review translated bullets and next-step guidance in one place.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-wide text-gold-400/80">Translation Strength</p>
            <span className="text-[10px] uppercase tracking-wide text-light-tan/50">Alpha estimate</span>
          </div>
          <p className="mt-3 text-4xl font-bold text-light-tan">{translationStrengthScore}%</p>
          <p className="mt-2 text-sm text-light-tan/60">Estimated from impact signals, action verbs, and bullet structure.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-wide text-gold-400/80">Top 3 Role Matches</p>
            <span className="text-[10px] uppercase tracking-wide text-light-tan/50">Alpha estimate</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-light-tan/85">
            {topRoleMatches.map((role) => (
              <li key={role.role}>{role.role} — {role.score}%</li>
            ))}
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
