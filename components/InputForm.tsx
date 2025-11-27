import React from 'react';

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

interface InputFormProps {
  inputText: string;
  setInputText: (text: string) => void;
  onTranslate: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ inputText, setInputText, onTranslate, isLoading }) => {
  const placeholderText = `Paste your military text here. For example: 'Led a team of 12 soldiers during deployment operations responsible for maintaining equipment worth $2.3M...'`;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400">
          <EditIcon />
        </div>
        <h2 className="text-2xl font-serif font-bold text-light-tan tracking-wide">Enter Your Military Text</h2>
      </div>

      <div className="flex flex-col gap-4">
        <label htmlFor="military-text-input" className="sr-only">
          Military Text to Translate
        </label>
        <div className="relative">
          <textarea
            id="military-text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={placeholderText}
            className="w-full h-56 p-6 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all duration-300 resize-none placeholder-light-tan/30 text-lg leading-relaxed shadow-inner"
            disabled={isLoading}
          />
          <div className="absolute bottom-4 right-4 text-xs text-light-tan/30 font-mono">
            {inputText.length} chars
          </div>
        </div>

        <div className="flex items-start gap-3 text-light-tan/60 text-sm bg-black/20 p-4 rounded-lg border border-white/5">
          <div className="text-gold-500 mt-0.5">
            <InfoIcon />
          </div>
          <span>Enter military language from awards, evaluations, or job descriptions. The tool will help translate it into civilian-friendly resume bullets.</span>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onTranslate}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-dark-charcoal font-bold text-lg rounded-xl hover:from-gold-500 hover:to-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-lg hover:shadow-gold-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-charcoal focus:ring-gold-500"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-dark-charcoal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Translating...
            </span>
          ) : (
            <>
              <span>Get Civilian Resume Bullet</span>
              <ArrowRightIcon />
            </>
          )}
        </button>
        <p className="text-center text-xs text-light-tan/40 mt-4 flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Your data is secure and never stored.
        </p>
      </div>
    </div>
  );
};

export default InputForm;