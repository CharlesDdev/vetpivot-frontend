import React, { useEffect, useMemo, useState } from 'react';
import MOSLookupCard from './MOSLookupCard';
import Spinner from './Spinner';
import TranslationCard from './TranslationCard';
import {
  getOccupationSkills,
  searchOccupations,
  type MilitaryCrosswalkOccupation,
  type OccupationSkill,
  type OccupationSearchOccupation,
} from '../services/onetService';
import { API_BASE_URL, getTranslationFromBackend } from '../services/backendService';
import type { TranslationResult, TranslationTargetRole } from '../types';

type Lane = 'mos' | 'keyword' | null;

interface CareerFlowProps {
  userBullets?: string;
  targetRole?: TranslationTargetRole | null;
  onTargetRoleChange?: (role: TranslationTargetRole | null) => void;
}

type FitBand = 'Strong' | 'Partial' | 'Weak';
type CareerFlowError = {
  message: string;
  raw?: string;
};

type SkillsExtractResponse = {
  inferred_skills?: string[];
  skills?: string[];
  profile_skills?: string[];
};

const IS_BACKGROUND_ANALYSIS_OFFLINE = true;

const normalizeSkill = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseInferredSkills = (payload: SkillsExtractResponse | Record<string, unknown>): string[] => {
  const candidates: string[] = [];

  const pushStringArray = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (typeof entry === 'string' && entry.trim()) {
          candidates.push(entry.trim());
        } else if (entry && typeof entry === 'object') {
          const obj = entry as Record<string, unknown>;
          const named = obj.name;
          if (typeof named === 'string' && named.trim()) {
            candidates.push(named.trim());
          }
        }
      });
    }
  };

  pushStringArray(payload.inferred_skills);
  pushStringArray(payload.skills);
  pushStringArray(payload.profile_skills);

  const seen = new Set<string>();
  return candidates.filter((skill) => {
    const normalized = normalizeSkill(skill);
    if (!normalized || seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
};

const getFitBand = (matchedCount: number, requiredCount: number): FitBand => {
  if (requiredCount === 0) {
    return 'Weak';
  }
  const ratio = matchedCount / requiredCount;
  if (ratio >= 0.6) {
    return 'Strong';
  }
  if (ratio >= 0.3) {
    return 'Partial';
  }
  return 'Weak';
};

const copyText = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

const toCareerFlowError = (error: unknown, fallback: string): CareerFlowError => {
  const rawMessage = error instanceof Error ? error.message : fallback;
  const looksUnavailable =
    rawMessage.includes('{"detail":"Not Found"}') ||
    /\b404\b/.test(rawMessage) ||
    /\bNot Found\b/i.test(rawMessage);

  if (looksUnavailable) {
    return {
      message: 'Role Fit service not available in this environment.',
      raw: rawMessage,
    };
  }

  return { message: rawMessage || fallback };
};

const CareerFlow: React.FC<CareerFlowProps> = ({ userBullets, targetRole, onTargetRoleChange }) => {
  const [lane, setLane] = useState<Lane>(null);
  const [selectedOccupation, setSelectedOccupation] = useState<Omit<TranslationTargetRole, 'topSkills'> | null>(null);

  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<OccupationSearchOccupation[]>([]);
  const [hasSearchedKeyword, setHasSearchedKeyword] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<CareerFlowError | null>(null);

  const [requiredSkills, setRequiredSkills] = useState<OccupationSkill[]>([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState<CareerFlowError | null>(null);

  const [localUserBullets, setLocalUserBullets] = useState('');
  const [inferredSkills, setInferredSkills] = useState<string[]>([]);
  const [isExtractLoading, setIsExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<CareerFlowError | null>(null);

  const [resumeTranslations, setResumeTranslations] = useState<TranslationResult | null>(null);
  const [isResumeLoading, setIsResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<CareerFlowError | null>(null);

  const [copiedSkills, setCopiedSkills] = useState(false);
  const activeUserBullets = userBullets ?? localUserBullets;
  const hasActiveUserBullets = activeUserBullets.trim().length > 0;
  const isUsingMainInputBullets = userBullets !== undefined;
  const hasMainInputBullets = userBullets?.trim().length ? true : false;

  useEffect(() => {
    const loadSkills = async () => {
      if (!selectedOccupation?.code) {
        return;
      }

      setIsSkillsLoading(true);
      setSkillsError(null);
      setRequiredSkills([]);

      try {
        const data = await getOccupationSkills(selectedOccupation.code, 'importance', 1, 15);
        setRequiredSkills(data.skills ?? []);
      } catch (error) {
        setSkillsError(toCareerFlowError(error, 'Failed to load required skills.'));
      } finally {
        setIsSkillsLoading(false);
      }
    };

    loadSkills();
  }, [selectedOccupation?.code]);

  useEffect(() => {
    setResumeTranslations(null);
    setResumeError(null);
    setInferredSkills([]);
    setExtractError(null);
    if (!isUsingMainInputBullets) {
      setLocalUserBullets('');
    }
  }, [selectedOccupation?.code, isUsingMainInputBullets]);

  useEffect(() => {
    if (!selectedOccupation) {
      onTargetRoleChange?.(null);
      return;
    }

    onTargetRoleChange?.({
      code: selectedOccupation.code,
      title: selectedOccupation.title,
      topSkills: [],
    });
  }, [onTargetRoleChange, selectedOccupation]);

  const requiredSkillNames = useMemo(() => requiredSkills.map((skill) => skill.name), [requiredSkills]);

  useEffect(() => {
    if (!selectedOccupation) {
      return;
    }

    onTargetRoleChange?.({
      code: selectedOccupation.code,
      title: selectedOccupation.title,
      topSkills: requiredSkillNames,
    });
  }, [onTargetRoleChange, requiredSkillNames, selectedOccupation]);

  useEffect(() => {
    if (targetRole !== null || !selectedOccupation) {
      return;
    }

    setSelectedOccupation(null);
    setRequiredSkills([]);
    setSkillsError(null);
  }, [selectedOccupation, targetRole]);

  const inferredSkillMap = useMemo(() => {
    const map = new Map<string, string>();
    inferredSkills.forEach((skill) => {
      map.set(normalizeSkill(skill), skill);
    });
    return map;
  }, [inferredSkills]);

  const likelyHave = useMemo(
    () =>
      requiredSkillNames.filter((required) => {
        const normalized = normalizeSkill(required);
        return inferredSkillMap.has(normalized);
      }),
    [inferredSkillMap, requiredSkillNames]
  );

  const missingOrUnclear = useMemo(
    () =>
      requiredSkillNames.filter((required) => {
        const normalized = normalizeSkill(required);
        return !inferredSkillMap.has(normalized);
      }),
    [inferredSkillMap, requiredSkillNames]
  );

  const fitBand = useMemo(() => getFitBand(likelyHave.length, requiredSkillNames.length), [likelyHave.length, requiredSkillNames.length]);

  const combinedSkills = useMemo(() => {
    const deduped = new Map<string, string>();

    requiredSkillNames.forEach((skill) => {
      deduped.set(normalizeSkill(skill), skill);
    });

    inferredSkills.forEach((skill) => {
      const normalized = normalizeSkill(skill);
      if (!deduped.has(normalized)) {
        deduped.set(normalized, skill);
      }
    });

    return Array.from(deduped.values());
  }, [requiredSkillNames, inferredSkills]);

  const skillsSectionText = useMemo(() => combinedSkills.map((skill) => `- ${skill}`).join('\n'), [combinedSkills]);

  const handleKeywordSearch = async () => {
    const safeKeyword = keyword.trim();
    if (!safeKeyword) {
      setSearchError({ message: 'Enter a keyword to search occupations.' });
      return;
    }

    setIsSearchLoading(true);
    setSearchError(null);
    setHasSearchedKeyword(true);
    setSearchResults([]);

    try {
      const data = await searchOccupations(safeKeyword, 1, 20);
      setSearchResults(data.occupations ?? []);
    } catch (error) {
      setSearchError(toCareerFlowError(error, 'Failed to search occupations.'));
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleSelectMOSOccupation = (occupation: MilitaryCrosswalkOccupation) => {
    setSelectedOccupation({ code: occupation.code, title: occupation.title });
  };

  const handleSelectKeywordOccupation = (occupation: OccupationSearchOccupation) => {
    setSelectedOccupation({ code: occupation.code, title: occupation.title });
  };

  const handleClearSelectedOccupation = () => {
    setSelectedOccupation(null);
    setRequiredSkills([]);
    setSkillsError(null);
    setSearchError(null);
  };

  const handleExtractSkills = async () => {
    if (!activeUserBullets.trim()) {
      setExtractError({ message: 'Add bullets or achievements first to infer your skills.' });
      return;
    }
    if (!selectedOccupation) {
      setExtractError({ message: 'Select an occupation first.' });
      return;
    }

    setIsExtractLoading(true);
    setExtractError(null);
    setInferredSkills([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/skills-extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: activeUserBullets,
          target_role_title: selectedOccupation.title,
          target_role_code: selectedOccupation.code,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `HTTP ${response.status}`);
      }

      const payload = (await response.json()) as SkillsExtractResponse;
      const parsed = parseInferredSkills(payload);
      setInferredSkills(parsed);
    } catch (error) {
      setExtractError(toCareerFlowError(error, 'Failed to infer skills from your text.'));
    } finally {
      setIsExtractLoading(false);
    }
  };

  const handleGenerateResumeDraft = async () => {
    if (!activeUserBullets.trim()) {
      setResumeError({ message: 'Add bullets or achievements to generate translated content.' });
      setResumeTranslations(null);
      return;
    }

    setIsResumeLoading(true);
    setResumeError(null);
    setResumeTranslations(null);

    try {
      const result = await getTranslationFromBackend(activeUserBullets, targetRole);
      setResumeTranslations(result);
    } catch (error) {
      setResumeError(toCareerFlowError(error, 'Failed to generate resume draft translations.'));
    } finally {
      setIsResumeLoading(false);
    }
  };

  const handleCopySkills = async () => {
    if (!skillsSectionText) {
      return;
    }

    await copyText(skillsSectionText);
    setCopiedSkills(true);
    setTimeout(() => setCopiedSkills(false), 1500);
  };

  return (
    <section className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl">
      <p className="text-xs uppercase tracking-widest text-gold-400/80 mb-3">MVP Career Flow</p>
      <h2 className="text-2xl font-serif font-bold text-light-tan tracking-wide">Career Flow</h2>
      <p className="mt-2 text-sm text-light-tan/70">
        Start here: choose a lane, pick one target role, review your skill gap, then generate a basic resume draft.
      </p>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-light-tan">Step 1: Choose your path</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setLane('mos');
              setSearchError(null);
            }}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              lane === 'mos'
                ? 'border-gold-400 bg-gold-500/20 text-gold-200'
                : 'border-white/20 bg-black/20 text-light-tan/80 hover:border-gold-500/50'
            }`}
          >
            Use your military background (MOS/Rate/AFSC)
          </button>
          <button
            type="button"
            onClick={() => {
              setLane('keyword');
              setSearchError(null);
            }}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              lane === 'keyword'
                ? 'border-gold-400 bg-gold-500/20 text-gold-200'
                : 'border-white/20 bg-black/20 text-light-tan/80 hover:border-gold-500/50'
            }`}
          >
            Search careers by keyword
          </button>
        </div>

        {lane === 'mos' && (
          <div className="mt-4">
            <MOSLookupCard
              initiallyExpanded
              onOccupationSelect={handleSelectMOSOccupation}
              selectedOccupationCode={selectedOccupation?.code ?? null}
            />
          </div>
        )}

        {lane === 'keyword' && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="flex-1 rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-light-tan focus:border-gold-400 focus:outline-none"
                placeholder="Job title keyword (e.g., project manager)"
              />
              <button
                type="button"
                onClick={handleKeywordSearch}
                disabled={isSearchLoading}
                className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-dark-charcoal transition hover:bg-gold-400 disabled:opacity-60"
              >
                {isSearchLoading ? 'Searching...' : 'Search careers'}
              </button>
            </div>

            {isSearchLoading && (
              <div className="flex items-center gap-2 text-sm text-light-tan/80" aria-live="polite">
                <Spinner />
                Loading occupation search results...
              </div>
            )}

            {searchError && (
              <div className="rounded-md border border-red-500 bg-red-900/40 p-3 text-red-100 text-sm" role="alert">
                <p>{searchError.message}</p>
                {searchError.raw && <p className="mt-1 text-xs text-red-200/80 break-words">{searchError.raw}</p>}
              </div>
            )}

            {hasSearchedKeyword && !isSearchLoading && !searchError && searchResults.length === 0 && (
              <p className="text-sm text-light-tan/70">No occupations found for this keyword.</p>
            )}

            {!isSearchLoading && !searchError && searchResults.length > 0 && (
              <ul className="space-y-2 max-h-72 overflow-auto pr-1">
                {searchResults.map((occupation) => (
                  <li key={`${occupation.code}-${occupation.title}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectKeywordOccupation(occupation)}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                        selectedOccupation?.code === occupation.code
                          ? 'border-gold-400 bg-gold-500/10'
                          : 'border-white/15 bg-black/20 hover:border-gold-500/40'
                      }`}
                    >
                      <p className="text-sm font-medium text-light-tan">{occupation.title}</p>
                      <p className="text-xs text-light-tan/60 mt-1">{occupation.code}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {selectedOccupation && (
          <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Selected occupation: <strong>{selectedOccupation.title}</strong> ({selectedOccupation.code})
              </p>
              <button
                type="button"
                onClick={handleClearSelectedOccupation}
                className="self-start rounded-md border border-emerald-200/30 px-3 py-1 text-xs font-medium text-emerald-50 transition hover:border-emerald-200/60 sm:self-auto"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-light-tan">Step 2: Skill Gap</p>

        {!selectedOccupation && <p className="mt-2 text-sm text-light-tan/70">Pick an occupation in Step 1 to continue.</p>}

        {selectedOccupation && (
          <>
            <div className="mt-3">
              <h3 className="text-sm font-semibold text-light-tan">Required Skills (Top 10-15)</h3>
              {isSkillsLoading && (
                <div className="mt-2 flex items-center gap-2 text-sm text-light-tan/80" aria-live="polite">
                  <Spinner />
                  Loading required skills...
                </div>
              )}
              {skillsError && (
                <div className="mt-2 rounded-md border border-red-500 bg-red-900/40 p-3 text-red-100 text-sm" role="alert">
                  <p>{skillsError.message}</p>
                  {skillsError.raw && <p className="mt-1 text-xs text-red-200/80 break-words">{skillsError.raw}</p>}
                </div>
              )}
              {!isSkillsLoading && !skillsError && requiredSkills.length === 0 && (
                <p className="mt-2 text-sm text-light-tan/70">No required skills returned for this occupation.</p>
              )}
              {!isSkillsLoading && !skillsError && requiredSkills.length > 0 && (
                <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {requiredSkills.map((skill) => (
                    <li key={skill.id} className="rounded-md border border-white/10 bg-black/20 px-3 py-2">
                      <p className="text-sm text-light-tan">{skill.name}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5">
              <div className="rounded-md border border-white/15 bg-black/20 p-3">
                <p className="text-sm font-semibold text-light-tan">Background analysis (Alpha)</p>
                <p className="mt-1 text-sm text-light-tan/70">
                  Temporarily offline while we improve reliability. Use the dashboard heuristics + Role Fit for now.
                </p>
              </div>

              {isUsingMainInputBullets ? (
                hasMainInputBullets ? (
                  <p className="text-sm text-light-tan/70">Using bullets from the main input above.</p>
                ) : (
                  <p className="text-sm text-light-tan/70">Add bullets in the main input above to use Role Fit.</p>
                )
              ) : (
                <>
                  <label htmlFor="career-flow-bullets" className="text-sm font-semibold text-light-tan">
                    Paste bullets / achievements (optional)
                  </label>
                  <textarea
                    id="career-flow-bullets"
                    value={localUserBullets}
                    onChange={(event) => setLocalUserBullets(event.target.value)}
                    className="mt-2 h-36 w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-light-tan focus:border-gold-400 focus:outline-none"
                    placeholder="Example: Led maintenance team of 12 to sustain mission equipment readiness above 95%."
                  />
                </>
              )}
              <button
                type="button"
                onClick={IS_BACKGROUND_ANALYSIS_OFFLINE ? undefined : handleExtractSkills}
                disabled={IS_BACKGROUND_ANALYSIS_OFFLINE || isExtractLoading || !hasActiveUserBullets}
                className="mt-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-dark-charcoal transition hover:bg-gold-400 disabled:opacity-60"
              >
                {isExtractLoading ? 'Analyzing skills...' : 'Analyze My Background'}
              </button>

              {!IS_BACKGROUND_ANALYSIS_OFFLINE && extractError && (
                <div className="mt-2 rounded-md border border-red-500 bg-red-900/40 p-3 text-red-100 text-sm" role="alert">
                  <p>{extractError.message}</p>
                  {extractError.raw && <p className="mt-1 text-xs text-red-200/80 break-words">{extractError.raw}</p>}
                </div>
              )}

              {!IS_BACKGROUND_ANALYSIS_OFFLINE && !isExtractLoading && !extractError && inferredSkills.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-light-tan">Inferred Skills</h4>
                  <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {inferredSkills.map((skill) => (
                      <li key={skill} className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-light-tan">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-wide text-light-tan/60">Fit Indicator</p>
                <p className="mt-1 text-lg font-semibold text-light-tan">{fitBand}</p>
                <p className="mt-1 text-xs text-light-tan/60">
                  Matched {likelyHave.length} of {requiredSkillNames.length} required skills.
                </p>
              </div>

              <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3">
                <p className="text-xs uppercase tracking-wide text-emerald-200/80">Likely Have</p>
                {likelyHave.length === 0 ? (
                  <p className="mt-1 text-sm text-emerald-100/80">No clear matches yet.</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {likelyHave.map((skill) => (
                      <li key={skill} className="text-sm text-emerald-100">{skill}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-900/20 p-3">
                <p className="text-xs uppercase tracking-wide text-amber-200/80">Missing / Unclear</p>
                {missingOrUnclear.length === 0 ? (
                  <p className="mt-1 text-sm text-amber-100/80">No gaps identified.</p>
                ) : (
                  <ul className="mt-1 space-y-1 max-h-40 overflow-auto pr-1">
                    {missingOrUnclear.map((skill) => (
                      <li key={skill} className="text-sm text-amber-100">{skill}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-light-tan">Step 3: Resume Draft</p>

        {!selectedOccupation && <p className="mt-2 text-sm text-light-tan/70">Select an occupation first.</p>}

        {selectedOccupation && (
          <>
            <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-light-tan/60">Target Title</p>
              <p className="text-base font-semibold text-light-tan mt-1">{selectedOccupation.title}</p>
            </div>

            <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-light-tan">Skills Section</p>
                <button
                  type="button"
                  onClick={handleCopySkills}
                  disabled={!skillsSectionText}
                  className="rounded-md border border-white/20 px-3 py-1 text-xs text-light-tan/90 hover:border-gold-400 disabled:opacity-60"
                >
                  {copiedSkills ? 'Copied!' : 'Copy Skills'}
                </button>
              </div>
              {combinedSkills.length === 0 ? (
                <p className="mt-2 text-sm text-light-tan/70">No skills available yet.</p>
              ) : (
                <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {combinedSkills.map((skill) => (
                    <li key={skill} className="text-sm text-light-tan">• {skill}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={handleGenerateResumeDraft}
                disabled={isResumeLoading || !hasActiveUserBullets}
                className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-dark-charcoal transition hover:bg-gold-400 disabled:opacity-60"
              >
                {isResumeLoading ? 'Generating draft...' : 'Generate Resume Draft'}
              </button>

              {isResumeLoading && (
                <div className="mt-2 flex items-center gap-2 text-sm text-light-tan/80" aria-live="polite">
                  <Spinner />
                  Translating your bullets...
                </div>
              )}

              {resumeError && (
                <div className="mt-2 rounded-md border border-red-500 bg-red-900/40 p-3 text-red-100 text-sm" role="alert">
                  <p>{resumeError.message}</p>
                  {resumeError.raw && <p className="mt-1 text-xs text-red-200/80 break-words">{resumeError.raw}</p>}
                </div>
              )}
            </div>

            {!hasActiveUserBullets && (
              <p className="mt-3 text-sm text-light-tan/70">Add bullets in Step 2 to generate Professional, ATS, and Casual draft content.</p>
            )}

            {resumeTranslations && !isResumeLoading && (
              <div className="mt-4 grid grid-cols-1 gap-4">
                <TranslationCard
                  title="Professional"
                  content={resumeTranslations.professional}
                  copyLabel="Copy professional"
                />
                <TranslationCard
                  title="ATS"
                  content={resumeTranslations.ats}
                  copyLabel="Copy ATS"
                />
                <TranslationCard
                  title="Casual"
                  content={resumeTranslations.casual}
                  copyLabel="Copy casual"
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CareerFlow;
