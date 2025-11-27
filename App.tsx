import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import TranslationOutput from './components/TranslationOutput';
import Spinner from './components/Spinner';
import Footer from './components/Footer';
import VetPivotLogo from './components/VetPivotLogo';
import type { TranslationResult } from './types';
import { getTranslationFromBackend } from './services/backendService';


const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [translations, setTranslations] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to translate.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTranslations(null);

    try {
      const result = await getTranslationFromBackend(inputText);
      setTranslations(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get translations. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      <div className="w-full max-w-4xl mx-auto bg-dark-charcoal/30 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
        <Header />
        <main className="mt-8 sm:mt-12">
          <section className="flex flex-col items-center gap-6 text-center">
            <VetPivotLogo wrapperClassName="w-48 h-48 p-6 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 shadow-inner" iconClassName="w-24" textClassName="text-2xl mt-2 font-serif tracking-wider" />
            <div>
              <h1 className="text-4xl sm:text-6xl font-bold text-light-tan tracking-tight font-serif">
                VETPIVOT
              </h1>
              <p className="mt-2 text-xl text-gold-400 font-medium tracking-widest uppercase text-xs">
                Resume Optimizer
              </p>
              <p className="mt-6 text-lg text-light-tan/80 max-w-2xl mx-auto leading-relaxed">
                Translate your military service into civilian language that recruiters understand.
              </p>
            </div>
          </section>

          <Footer />

          <section className="mt-12">
            <InputForm
              inputText={inputText}
              setInputText={setInputText}
              onTranslate={handleTranslate}
              isLoading={isLoading}
            />
          </section>

          <div className="mt-12">
            {isLoading && (
              <div className="flex justify-center items-center h-40">
                <Spinner />
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center backdrop-blur-sm" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {translations && !isLoading && (
              <TranslationOutput
                translations={translations}
                onRegenerate={handleTranslate}
                isLoading={isLoading}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;