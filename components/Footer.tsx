import React from 'react';

const InputIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const AITranslationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M5.5 9.5A7 7 0 0012 16.5a7.4 7.4 0 005-2.5M20 20v-5h-5M18.5 14.5A7 7 0 0012 7.5a7.4 7.4 0 00-5 2.5" />
  </svg>
);

const ResumeReadyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const Footer: React.FC = () => {
  const steps = [
    {
      icon: <InputIcon />,
      title: "1. Input Military Text",
      description: "Paste your military awards, evaluations, or job descriptions."
    },
    {
      icon: <AITranslationIcon />,
      title: "2. AI Translation",
      description: "Our system converts military jargon into civilian-friendly language."
    },
    {
      icon: <ResumeReadyIcon />,
      title: "3. Resume-Ready Bullets",
      description: "Get polished resume bullets that employers will understand."
    }
  ];

  return (
    <section className="py-16 sm:py-24 my-16 border-y border-white/10">
      <h2 className="text-3xl font-bold text-center mb-12 text-light-tan">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 mb-4 rounded-full bg-dark-charcoal text-light-tan">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-light-tan">{step.title}</h3>
            <p className="text-light-tan/80">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Footer;