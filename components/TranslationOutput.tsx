import React from 'react';
import type { CareerAgentResult } from '../types';
import TranslationCard from './TranslationCard';
import Spinner from './Spinner';

interface TranslationOutputProps {
  translations: CareerAgentResult | null;
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
  const professionalBullet = translations?.professional_resume_bullet.trim() ?? '';
  const atsBullet = translations?.ats_optimized_bullet.trim() ?? '';
  const listText = (items: string[]) => (items.length ? items.join('\n') : 'None identified.');
  const getFitDisplay = (assessment: string) => {
    if (/strong match/i.test(assessment)) {
      return { label: 'Strong Match', percent: 85, color: '#84cc16' };
    }

    if (/partial match/i.test(assessment)) {
      return { label: 'Partial Match', percent: 60, color: '#facc15' };
    }

    if (/weak match/i.test(assessment)) {
      return { label: 'Weak Match', percent: 35, color: '#fb7185' };
    }

    return { label: 'Needs Review', percent: 50, color: '#c4b998' };
  };

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
            <p className="text-lg font-semibold text-light-tan">Your civilian translation will appear here</p>
            <p className="mt-2 text-sm text-light-tan/70">
              Paste one military bullet or short paragraph, then select Translate.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-5 flex items-center gap-3" aria-live="polite">
            <Spinner />
            <p className="text-sm text-light-tan/80">Generating your translation...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-5" role="alert">
            <p className="text-base font-semibold text-red-200">We couldn’t generate your translation</p>
            <p className="mt-2 text-sm text-red-100">{error}</p>
          </div>
        )}

        {!isLoading && !error && translations && (
          <div className="grid grid-cols-1 gap-4">
            <TranslationCard
              title="Professional Resume Bullet"
              content={professionalBullet}
              copyLabel="Copy resume bullet"
            />
            <TranslationCard
              title="ATS Version"
              content={atsBullet}
              copyLabel="Copy ATS version"
            />
            <JobFitAssessmentCard
              assessment={translations.job_fit_assessment}
              fit={getFitDisplay(translations.job_fit_assessment)}
            />
            <TranslationCard
              title="Missing Keywords"
              content={listText(translations.missing_keywords)}
              copyLabel="Copy keywords"
            />
            <TranslationCard
              title="Interview Talking Points"
              content={listText(translations.interview_talking_points)}
              copyLabel="Copy talking points"
            />
            <TranslationCard
              title="Safety & Evaluation Notes"
              content={[
                translations.evaluation_notes,
                '',
                'Safety flags:',
                listText(translations.safety_flags),
                '',
                `Mode: ${translations.mode}`,
              ].join('\n')}
              copyLabel="Copy safety notes"
            />
          </div>
        )}

        {hasSubmitted && !isLoading && !error && !translations && (
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-5">
            <p className="text-lg font-semibold text-light-tan">No translation returned</p>
            <p className="mt-2 text-sm text-light-tan/70">Try again, or paste a different bullet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

interface JobFitAssessmentCardProps {
  assessment: string;
  fit: {
    label: string;
    percent: number;
    color: string;
  };
}

const JobFitAssessmentCard: React.FC<JobFitAssessmentCardProps> = ({ assessment, fit }) => {
  const [copied, setCopied] = React.useState(false);
  const background = `conic-gradient(${fit.color} ${fit.percent * 3.6}deg, rgba(255,255,255,0.12) 0deg)`;

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(assessment).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [assessment]);

  return (
    <div className="bg-dark-charcoal/50 border border-white/10 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 flex justify-between items-center gap-3 bg-dark-charcoal/60 border-b border-white/10">
        <h3 className="text-lg font-bold text-light-tan">Job Fit Assessment</h3>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors duration-200 whitespace-nowrap ${copied ? 'bg-green-600 text-white' : 'bg-dark-olive hover:bg-opacity-80 text-light-tan/90'}`}
          aria-label="Copy assessment"
          title="Copy assessment"
        >
          <span>{copied ? 'Copied' : 'Copy assessment'}</span>
        </button>
      </div>
      <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div
          className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full"
          style={{ background }}
          role="img"
          aria-label={`${fit.label}, approximately ${fit.percent}% fit`}
        >
          <div className="absolute inset-2 rounded-full bg-dark-charcoal" />
          <div className="relative text-center">
            <p className="text-2xl font-bold text-light-tan">{fit.percent}%</p>
            <p className="text-[10px] uppercase tracking-wide text-light-tan/60">Fit</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: fit.color }}>
            {fit.label}
          </p>
          <p className="mt-2 text-sm sm:text-base text-light-tan/90 whitespace-pre-wrap">{assessment}</p>
        </div>
      </div>
    </div>
  );
};

export default TranslationOutput;
