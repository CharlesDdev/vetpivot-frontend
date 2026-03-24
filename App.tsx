import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import VetPivotLogo from './components/VetPivotLogo';
import {
  findMockRoleMatches,
  generateMockTranslation,
} from './services/guidedFlowMocks';
import type { GuidedRoleMatch, GuidedTranslationResult } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [matchedRoles, setMatchedRoles] = useState<GuidedRoleMatch[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [translationResult, setTranslationResult] =
    useState<GuidedTranslationResult | null>(null);
  const [isFindingMatches, setIsFindingMatches] = useState(false);
  const [isGeneratingTranslation, setIsGeneratingTranslation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRole = matchedRoles.find((role) => role.id === selectedRoleId) ?? null;

  const resetFlow = () => {
    setInputText('');
    setMatchedRoles([]);
    setSelectedRoleId(null);
    setTranslationResult(null);
    setIsFindingMatches(false);
    setIsGeneratingTranslation(false);
    setError(null);
  };

  const handleFindMatches = async () => {
    if (!inputText.trim()) {
      setError('Paste your military experience first so the flow has something to work from.');
      setMatchedRoles([]);
      setSelectedRoleId(null);
      setTranslationResult(null);
      return;
    }

    setError(null);
    setIsFindingMatches(true);
    setMatchedRoles([]);
    setSelectedRoleId(null);
    setTranslationResult(null);

    try {
      // Later: replace this mock lookup with the real O*NET role-matching call.
      const roles = await findMockRoleMatches(inputText);
      setMatchedRoles(roles);
    } catch (err) {
      console.error(err);
      setError('The fake role-matching step failed. Try the prototype again.');
    } finally {
      setIsFindingMatches(false);
    }
  };

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setTranslationResult(null);
    setError(null);
  };

  const handleGenerateTranslation = async () => {
    if (!selectedRole) {
      setError('Select one of the suggested civilian roles before generating a translation.');
      return;
    }

    setError(null);
    setIsGeneratingTranslation(true);
    setTranslationResult(null);

    try {
      // Later: replace this mock translation with the real backend translation call.
      const result = await generateMockTranslation(selectedRole, inputText);
      setTranslationResult(result);
    } catch (err) {
      console.error(err);
      setError('The fake translation step failed. Try the prototype again.');
    } finally {
      setIsGeneratingTranslation(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans bg-slate-950">
      <div className="w-full max-w-5xl mx-auto bg-dark-charcoal/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
        <Header onHomeClick={resetFlow} />

        <main className="mt-6 sm:mt-8">
          <section className="flex flex-col items-center gap-4 text-center">
            <VetPivotLogo
              wrapperClassName="w-32 h-32 p-4 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 shadow-inner"
              iconClassName="w-16"
              textClassName="text-xl mt-1 font-serif tracking-wider"
            />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-light-tan tracking-tight font-serif">
                Guided flow prototype
              </h1>
              <p className="mt-3 text-base text-light-tan/80 max-w-2xl mx-auto leading-relaxed">
                This experiment tests a simple sequence: paste your experience, pick a civilian
                direction, then view a translation built for that role.
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-widest text-gold-400/80">Step 1</p>
              <p className="mt-2 text-lg font-semibold text-light-tan">Paste experience</p>
              <p className="mt-2 text-sm text-light-tan/70">Start with one block of military experience.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-widest text-gold-400/80">Step 2</p>
              <p className="mt-2 text-lg font-semibold text-light-tan">Choose a role</p>
              <p className="mt-2 text-sm text-light-tan/70">Use mock civilian matches to pick a direction.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-widest text-gold-400/80">Step 3</p>
              <p className="mt-2 text-lg font-semibold text-light-tan">Generate translation</p>
              <p className="mt-2 text-sm text-light-tan/70">See a fake translation for the selected role.</p>
            </div>
          </section>

          {error && (
            <section className="mt-8 rounded-2xl border border-red-700 bg-red-900/30 px-5 py-4" role="alert">
              <p className="text-sm font-medium text-red-100">{error}</p>
            </section>
          )}

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-xl">
            <p className="text-xs uppercase tracking-widest text-gold-400/80">Step 1</p>
            <h2 className="mt-2 text-2xl font-serif font-bold text-light-tan">Paste military experience</h2>
            <p className="mt-3 text-sm text-light-tan/70 max-w-2xl">
              Keep this simple for the prototype. Paste a short bullet or short paragraph describing
              what you did.
            </p>

            <label htmlFor="military-experience" className="mt-6 block text-sm font-medium text-light-tan/90">
              Military experience
            </label>
            <textarea
              id="military-experience"
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder="Example: Led a small team, tracked tasks, and kept equipment ready during daily operations."
              className="mt-3 w-full min-h-[220px] p-6 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none resize-none placeholder-light-tan/30 text-lg leading-relaxed shadow-inner"
              disabled={isFindingMatches || isGeneratingTranslation}
            />

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-light-tan/60">This step uses fake data in this experiment branch.</p>
              <button
                type="button"
                onClick={handleFindMatches}
                disabled={isFindingMatches || isGeneratingTranslation}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-3 text-base font-bold text-dark-charcoal transition-all hover:from-gold-500 hover:to-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFindingMatches ? 'Finding matches...' : 'Find civilian matches'}
              </button>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-xl">
            <p className="text-xs uppercase tracking-widest text-gold-400/80">Step 2</p>
            <h2 className="mt-2 text-2xl font-serif font-bold text-light-tan">Choose a civilian role</h2>

            {matchedRoles.length === 0 && !isFindingMatches && (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-5">
                <p className="text-lg font-semibold text-light-tan">No role matches yet</p>
                <p className="mt-2 text-sm text-light-tan/70">
                  Complete Step 1 first. The mock role suggestions will appear here.
                </p>
              </div>
            )}

            {isFindingMatches && (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-light-tan/80">Loading fake role matches...</p>
              </div>
            )}

            {matchedRoles.length > 0 && (
              <div className="mt-5 grid gap-4">
                {matchedRoles.map((role) => {
                  const isSelected = role.id === selectedRoleId;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleSelectRole(role.id)}
                      className={`rounded-xl border p-5 text-left transition-colors ${
                        isSelected
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-light-tan">{role.title}</p>
                          <p className="mt-2 text-sm text-light-tan/70">{role.summary}</p>
                        </div>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-widest text-gold-300">
                          {role.focusArea}
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-light-tan/60">
                        {isSelected ? 'Selected for Step 3' : 'Click to use this role for the translation step'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-xl">
            <p className="text-xs uppercase tracking-widest text-gold-400/80">Step 3</p>
            <h2 className="mt-2 text-2xl font-serif font-bold text-light-tan">Generate translation</h2>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm uppercase tracking-widest text-light-tan/50">Selected role</p>
              <p className="mt-2 text-lg font-semibold text-light-tan">
                {selectedRole ? selectedRole.title : 'Choose a role in Step 2'}
              </p>
              <p className="mt-2 text-sm text-light-tan/70">
                {selectedRole
                  ? selectedRole.summary
                  : 'The translation button stays simple on purpose. Pick one role and generate one mock result.'}
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGenerateTranslation}
                disabled={!selectedRole || isFindingMatches || isGeneratingTranslation}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-3 text-base font-bold text-dark-charcoal transition-all hover:from-gold-500 hover:to-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingTranslation ? 'Generating translation...' : 'Generate translation'}
              </button>
            </div>

            {!translationResult && !isGeneratingTranslation && (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
                <p className="text-lg font-semibold text-light-tan">No translation yet</p>
                <p className="mt-2 text-sm text-light-tan/70">
                  Once you choose a role and click the button, the fake translation result will appear here.
                </p>
              </div>
            )}

            {isGeneratingTranslation && (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-light-tan/80">Building fake translation...</p>
              </div>
            )}

            {translationResult && !isGeneratingTranslation && (
              <div className="mt-6 rounded-xl border border-gold-500/40 bg-gold-500/10 p-5">
                <p className="text-sm uppercase tracking-widest text-gold-300">
                  Mock translation for {translationResult.targetRoleTitle}
                </p>
                <p className="mt-4 text-lg font-semibold leading-relaxed text-light-tan">
                  {translationResult.translatedBullet}
                </p>
                <p className="mt-4 text-sm text-light-tan/70">{translationResult.explanation}</p>
              </div>
            )}
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default App;
