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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <LabeledTranslationCard
                title="Professional Resume Bullet"
                label="Human-readable"
                content={professionalBullet}
                copyLabel="Copy resume bullet"
              />
            </div>
            <div className="min-w-0">
              <LabeledTranslationCard
                title="ATS Version"
                label="Keyword-focused"
                content={atsBullet}
                copyLabel="Copy ATS version"
              />
            </div>
            <div className="min-w-0">
              <JobFitAssessmentCard
                assessment={translations.job_fit_assessment}
                fit={getFitDisplay(translations.job_fit_assessment)}
              />
            </div>
            <div className="min-w-0">
              <KeywordChipsCard keywords={translations.missing_keywords} />
            </div>
            <div className="min-w-0 md:col-span-2">
              <InterviewTalkingPointsCard points={translations.interview_talking_points} />
            </div>
            <div className="min-w-0 md:col-span-2">
              <SafetyEvaluationCard
                evaluationNotes={translations.evaluation_notes}
                safetyFlags={translations.safety_flags}
                mode={translations.mode}
              />
            </div>
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

interface LabeledTranslationCardProps {
  title: string;
  label: string;
  content: string;
  copyLabel: string;
}

const LabeledTranslationCard: React.FC<LabeledTranslationCardProps> = ({
  title,
  label,
  content,
  copyLabel,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  return (
    <div className="bg-dark-charcoal/50 border border-white/10 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 flex flex-col gap-3 bg-dark-charcoal/60 border-b border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 inline-flex rounded-full border border-gold-400/25 bg-gold-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold-300">
            {label}
          </div>
          <h3 className="text-lg font-bold text-light-tan">{title}</h3>
        </div>
        <button
          onClick={handleCopy}
          className={`self-start px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors duration-200 whitespace-nowrap sm:self-center ${copied ? 'bg-green-600 text-white' : 'bg-dark-olive hover:bg-opacity-80 text-light-tan/90'}`}
          aria-label={copyLabel}
          title={copyLabel}
        >
          <span>{copied ? 'Copied' : copyLabel}</span>
        </button>
      </div>
      <div className="px-4 py-4">
        <p className="text-sm sm:text-base text-light-tan/90 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

interface KeywordChipsCardProps {
  keywords: string[];
}

const KeywordChipsCard: React.FC<KeywordChipsCardProps> = ({ keywords }) => {
  const [copied, setCopied] = React.useState(false);
  const content = keywords.length ? keywords.join('\n') : 'None identified.';

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  return (
    <div className="bg-dark-charcoal/50 border border-white/10 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 flex justify-between items-center gap-3 bg-dark-charcoal/60 border-b border-white/10">
        <h3 className="text-lg font-bold text-light-tan">Missing Keywords</h3>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors duration-200 whitespace-nowrap ${copied ? 'bg-green-600 text-white' : 'bg-dark-olive hover:bg-opacity-80 text-light-tan/90'}`}
          aria-label="Copy keywords"
          title="Copy keywords"
        >
          <span>{copied ? 'Copied' : 'Copy keywords'}</span>
        </button>
      </div>
      <div className="px-4 py-4">
        {keywords.length ? (
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-sm font-medium text-light-tan/90"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-light-tan/90">None identified.</p>
        )}
      </div>
    </div>
  );
};

interface InterviewTalkingPointsCardProps {
  points: string[];
}

const InterviewTalkingPointsCard: React.FC<InterviewTalkingPointsCardProps> = ({ points }) => {
  const [copied, setCopied] = React.useState(false);
  const content = points.length ? points.join('\n') : 'None identified.';

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  const parsePoint = (point: string) => {
    const mockMatch = point.match(/^([STAR]) - ([^:]+):\s*(.*)$/);
    if (mockMatch) {
      return {
        letter: mockMatch[1],
        label: mockMatch[2],
        body: mockMatch[3],
      };
    }

    const liveMatch = point.match(/^(Situation|Task|Action|Result):\s*(.*)$/i);
    if (!liveMatch) {
      return null;
    }

    const label = liveMatch[1][0].toUpperCase() + liveMatch[1].slice(1).toLowerCase();
    return {
      letter: label[0],
      label,
      body: liveMatch[2],
    };
  };

  return (
    <div className="bg-dark-charcoal/50 border border-white/10 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 flex justify-between items-center gap-3 bg-dark-charcoal/60 border-b border-white/10">
        <h3 className="text-lg font-bold text-light-tan">Interview Talking Points</h3>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors duration-200 whitespace-nowrap ${copied ? 'bg-green-600 text-white' : 'bg-dark-olive hover:bg-opacity-80 text-light-tan/90'}`}
          aria-label="Copy talking points"
          title="Copy talking points"
        >
          <span>{copied ? 'Copied' : 'Copy talking points'}</span>
        </button>
      </div>
      <div className="px-4 py-4">
        {points.length ? (
          <div className="space-y-3">
            {points.map((point) => {
              const parsed = parsePoint(point);

              if (!parsed) {
                return (
                  <p key={point} className="text-sm sm:text-base text-light-tan/90">
                    {point}
                  </p>
                );
              }

              return (
                <div key={point} className="flex gap-3 rounded-lg border border-white/10 bg-black/15 px-3 py-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-gold-400/15 text-lg font-bold text-gold-200">
                    {parsed.letter}
                  </span>
                  <p className="min-w-0 text-sm sm:text-base text-light-tan/90">
                    <span className="font-bold text-light-tan">{parsed.label}:</span> {parsed.body}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-light-tan/90">None identified.</p>
        )}
      </div>
    </div>
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
          <p className="mt-2 text-xs text-light-tan/60">Approximate visual guide, not a hiring score.</p>
        </div>
      </div>
    </div>
  );
};

interface SafetyEvaluationCardProps {
  evaluationNotes: string;
  safetyFlags: string[];
  mode: string;
}

const SafetyEvaluationCard: React.FC<SafetyEvaluationCardProps> = ({
  evaluationNotes,
  safetyFlags,
  mode,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const flagsText = safetyFlags.length ? safetyFlags.join('\n') : 'None identified.';
  const content = [
    evaluationNotes,
    '',
    'Safety flags:',
    flagsText,
    '',
    `Mode: ${mode}`,
  ].join('\n');

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  return (
    <div className="bg-dark-charcoal/50 border border-white/10 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 flex flex-col gap-3 bg-dark-charcoal/60 border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex min-w-0 items-center gap-3 text-left"
          aria-expanded={isOpen}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-400/30 bg-gold-400/10 text-sm font-bold text-gold-200">
            {isOpen ? '-' : '+'}
          </span>
          <span>
            <span className="block text-lg font-bold text-light-tan">Safety & Evaluation Notes</span>
            <span className="block text-xs text-light-tan/60">Optional review details</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          {isOpen && (
            <button
              onClick={handleCopy}
              className={`self-start px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors duration-200 whitespace-nowrap sm:self-center ${copied ? 'bg-green-600 text-white' : 'bg-dark-olive hover:bg-opacity-80 text-light-tan/90'}`}
              aria-label="Copy safety notes"
              title="Copy safety notes"
            >
              <span>{copied ? 'Copied' : 'Copy safety notes'}</span>
            </button>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="border-t border-white/10 px-4 py-4">
          <p className="text-sm sm:text-base text-light-tan/90 whitespace-pre-wrap">{evaluationNotes}</p>
          <div className="mt-4">
            <p className="text-sm font-semibold text-light-tan">Safety flags:</p>
            <p className="mt-1 text-sm sm:text-base text-light-tan/90 whitespace-pre-wrap">{flagsText}</p>
          </div>
          <p className="mt-4 text-sm text-light-tan/80">Mode: {mode}</p>
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="mt-4 text-sm font-semibold text-gold-300 underline decoration-gold-300/40 underline-offset-4 hover:text-gold-200"
            aria-expanded={isExpanded}
          >
            Why this matters
          </button>
          {isExpanded && (
            <p className="mt-2 rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm text-light-tan/80">
              Safety notes help prevent unsupported claims, factual drift, and overstatement before a resume
              bullet is used in an application or interview.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslationOutput;
