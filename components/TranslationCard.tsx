import React, { useState, useCallback } from 'react';

interface TranslationCardProps {
  title: string;
  content: string;
}

const CopyIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);

const CheckIcon: React.FC<{className: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const TranslationCard: React.FC<TranslationCardProps> = ({ title, content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  return (
    <div className="bg-dark-charcoal/50 border border-white/10 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-dark-charcoal/80 border-b border-white/10">
        <h3 className="text-lg font-bold text-light-tan">{title}</h3>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors duration-200 ${copied ? 'bg-green-600 text-white' : 'bg-dark-olive hover:bg-opacity-80 text-light-tan/90'}`}
          aria-label={`Copy ${title}`}
        >
          {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4">
        <p className="text-light-tan/90 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};

export default TranslationCard;