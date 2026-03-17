import React, { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import TranslationOutput from './components/TranslationOutput';
import Footer from './components/Footer';
import VetPivotLogo from './components/VetPivotLogo';
import type { TranslationResult } from './types';
import { getTranslationFromBackend } from './services/backendService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const outputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasSubmitted || isLoading || apiError || result) {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasSubmitted, isLoading, apiError, result]);

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

    try {
      const translationResult = await getTranslationFromBackend(inputText);
      setResult(translationResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get translations. Please try again.';
      setApiError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHomeClick = () => {
    setResult(null);
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
          <section className="flex flex-col items-center gap-4 text-center">
            <VetPivotLogo wrapperClassName="w-32 h-32 p-4 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 shadow-inner" iconClassName="w-16" textClassName="text-xl mt-1 font-serif tracking-wider" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-light-tan tracking-tight font-serif">
                Translate military experience into civilian-ready resume bullets
              </h1>
              <p className="mt-3 text-base text-light-tan/80 max-w-2xl mx-auto leading-relaxed">
                Paste your bullet or short experience text and get one clear translation you can copy in seconds.
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
              isLoading={isLoading}
              hasSubmitted={hasSubmitted}
              error={apiError}
            />
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default App;
