import React, { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import TranslationOutput from './components/TranslationOutput';
import CareerFlow from './components/CareerFlow';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import VetPivotLogo from './components/VetPivotLogo';
import type { TranslationResult } from './types';
import { getTranslationFromBackend } from './services/backendService';

type SelectedOccupation = {
  code: string;
  title: string;
};

const App: React.FC = () => {
  const [mode, setMode] = useState<'input' | 'dashboard'>('input');
  const [inputText, setInputText] = useState<string>('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [selectedOccupation, setSelectedOccupation] = useState<SelectedOccupation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const outputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode === 'input' && (hasSubmitted || isLoading || apiError)) {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [mode, hasSubmitted, isLoading, apiError]);

  const handleTranslate = async () => {
    setHasSubmitted(true);
    if (!inputText.trim()) {
      setInputError('Please paste at least one bullet or achievement.');
      setResult(null);
      return;
    }
    setInputError(null);
    setIsLoading(true);
    setApiError(null);
    setResult(null);
    setMode('input');

    try {
      const translationResult = await getTranslationFromBackend(inputText);
      setResult(translationResult);
      setMode('dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get translations. Please try again.';
      setApiError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnotherTranslation = () => {
    setMode('input');
    setInputText('');
    setResult(null);
    setInputError(null);
    setApiError(null);
    setHasSubmitted(false);
    setIsLoading(false);
  };

  const handleBackToInputs = () => {
    setMode('input');
  };

  const handleHomeClick = () => {
    setMode('input');
    setResult(null);
    setSelectedOccupation(null);
    setInputError(null);
    setApiError(null);
    setHasSubmitted(false);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans bg-slate-950">
      <div className="w-full max-w-4xl mx-auto bg-dark-charcoal/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
        <Header onHomeClick={handleHomeClick} />
        <main className="mt-6 sm:mt-8">
          {mode === 'input' ? (
            <>
              <section className="flex flex-col items-center gap-4 text-center">
                <VetPivotLogo wrapperClassName="w-32 h-32 p-4 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 shadow-inner" iconClassName="w-16" textClassName="text-xl mt-1 font-serif tracking-wider" />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-light-tan tracking-tight font-serif">
                    Translate military experience into civilian-ready resume bullets
                  </h1>
                  <p className="mt-3 text-base text-light-tan/80 max-w-2xl mx-auto leading-relaxed">
                    Paste your bullets, evaluation lines, or duty descriptions. Get clear versions you can copy in seconds.
                  </p>
                  <p className="mt-3 text-sm text-light-tan/60">
                    Your text is processed securely and never stored.
                  </p>
                </div>
              </section>
              <section className="mt-12">
                <InputForm
                  inputText={inputText}
                  setInputText={setInputText}
                  onTranslate={handleTranslate}
                  isLoading={isLoading}
                  error={inputError}
                />
              </section>
              <div className="mt-12" ref={outputRef} id="outputs-section">
                <TranslationOutput
                  translations={result}
                  onRegenerate={handleTranslate}
                  isLoading={isLoading}
                  hasSubmitted={hasSubmitted}
                  error={apiError}
                />
              </div>

              <section className="mt-12 rounded-2xl border border-white/10 bg-black/20 p-5">
                <details className="group">
                  <summary className="cursor-pointer list-none flex items-center justify-between text-left">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gold-400/80">Optional Panel</p>
                      <h2 className="text-xl font-semibold text-light-tan mt-1">Optional: Role Fit (O*NET)</h2>
                      <p className="text-sm text-light-tan/60 mt-1">Explore role alignment without re-entering your bullets.</p>
                    </div>
                    <span className="text-light-tan/60 text-sm group-open:rotate-180 transition-transform">⌄</span>
                  </summary>
                  <div className="mt-4">
                    <CareerFlow
                      userBullets={inputText}
                      onSelectedOccupationChange={setSelectedOccupation}
                    />
                  </div>
                </details>
              </section>
            </>
          ) : (
            result && (
              <Dashboard
                result={result}
                selectedOccupation={selectedOccupation}
                onBackToInputs={handleBackToInputs}
                onRunAnotherTranslation={handleRunAnotherTranslation}
              />
            )
          )}

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default App;
