import { FormEvent, useState } from 'react';
import {
  getOccupationSkills,
  type MilitaryCrosswalkOccupation,
  type OccupationSkill,
  searchMilitaryCrosswalk,
} from '../services/onetService';

export default function MOSLookupCard() {
  const [keyword, setKeyword] = useState('');
  const [occupations, setOccupations] = useState<MilitaryCrosswalkOccupation[]>([]);
  const [skills, setSkills] = useState<OccupationSkill[]>([]);
  const [selectedOccupationCode, setSelectedOccupationCode] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const loadCrosswalk = async (byKeyword?: string) => {
    const target = (byKeyword ?? keyword).trim() || 'infantry';
    setIsSearching(true);
    setSearchError(null);

    try {
      const data = await searchMilitaryCrosswalk(target);
      setOccupations(data.occupations ?? []);
      setSelectedOccupationCode(null);
      setSkills([]);
      setSkillsError(null);
    } catch (err) {
      setOccupations([]);
      setSelectedOccupationCode(null);
      setSkills([]);
      setSearchError(err instanceof Error ? err.message : 'Failed to load O*NET occupations.');
    } finally {
      setIsSearching(false);
    }
  };

  const loadSkills = async (code: string) => {
    setSelectedOccupationCode(code);
    setIsSkillsLoading(true);
    setSkillsError(null);

    try {
      const data = await getOccupationSkills(code);
      setSkills(data.skills ?? []);
    } catch (err) {
      setSkills([]);
      setSkillsError(err instanceof Error ? err.message : 'Failed to load occupation skills.');
    } finally {
      setIsSkillsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSearched(true);
    loadCrosswalk(keyword);
  };

  return (
    <div className="bg-slate-900/40 rounded-2xl border border-slate-700 p-6 shadow-xl">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 text-left"
        onClick={() => setIsExpanded((open) => !open)}
        aria-expanded={isExpanded}
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-300/80 mb-2">Step 1 (Optional): Explore roles & keywords</p>
          <h2 className="text-2xl font-semibold text-white">Live O*NET MOS Crosswalk</h2>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {isExpanded && (
        <>
          <p className="text-sm text-slate-300 mt-4 mb-4">
            Enter a MOS keyword to find civilian occupations, then select one to view top skills.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none"
              placeholder="MOS keyword (e.g., infantry)"
            />
            <button
              type="submit"
              className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-gold-400 disabled:opacity-60"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          <div className="mt-4 min-h-[120px] text-sm text-slate-200 space-y-4">
            {!hasSearched && !isSearching && !searchError && (
              <p className="text-slate-300">Search results will appear here.</p>
            )}
            {isSearching && <p aria-live="polite">Loading civilian occupation matches...</p>}
            {searchError && (
              <div className="rounded-md border border-red-500 bg-red-900/40 p-3 text-red-100" role="alert">
                {searchError}
              </div>
            )}
            {!isSearching && !searchError && occupations.length > 0 && (
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                <h3 className="text-sm font-semibold text-slate-100 mb-2">Civilian Occupations</h3>
                <ul className="space-y-2 max-h-72 overflow-auto pr-1">
                  {occupations.map((occupation) => (
                    <li key={occupation.code}>
                      <button
                        type="button"
                        onClick={() => loadSkills(occupation.code)}
                        className={`w-full text-left rounded-md border px-3 py-2 transition ${
                          selectedOccupationCode === occupation.code
                            ? 'border-gold-400 bg-slate-800/90'
                            : 'border-slate-700 bg-slate-900/70 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-100">{occupation.title}</p>
                          {occupation.bright_outlook && (
                            <span className="rounded-full bg-emerald-800/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
                              Bright Outlook
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{occupation.code}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasSearched && !isSearching && !searchError && occupations.length === 0 && (
              <p className="text-slate-300">No occupations found for this keyword.</p>
            )}

            {selectedOccupationCode && (
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                <h3 className="text-sm font-semibold text-slate-100 mb-2">Top Skills ({selectedOccupationCode})</h3>
                {isSkillsLoading && <p aria-live="polite">Loading skills...</p>}
                {skillsError && (
                  <div className="rounded-md border border-red-500 bg-red-900/40 p-3 text-red-100" role="alert">
                    {skillsError}
                  </div>
                )}
                {!isSkillsLoading && !skillsError && skills.length === 0 && (
                  <p className="text-slate-300">No skills returned for this occupation.</p>
                )}
                {!isSkillsLoading && !skillsError && skills.length > 0 && (
                  <ul className="space-y-2 max-h-72 overflow-auto pr-1">
                    {skills.map((skill) => (
                      <li key={skill.id} className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-100">{skill.name}</p>
                          <span className="text-xs text-gold-300">
                            Importance: {skill.importance ?? 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{skill.description}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Data provided by{' '}
        <a
          href="https://www.onetonline.org/"
          target="_blank"
          rel="noreferrer"
          className="text-gold-300 hover:text-gold-200 underline"
        >
          O*NET Online
        </a>
        .
      </p>
    </div>
  );
}
