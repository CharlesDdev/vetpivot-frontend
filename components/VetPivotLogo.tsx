import React from 'react';

interface VetPivotLogoProps {
  wrapperClassName?: string;
  iconClassName?: string;
  textClassName?: string;
}

const VetPivotLogo: React.FC<VetPivotLogoProps> = ({ wrapperClassName, iconClassName, textClassName }) => (
  <div className={`bg-dark-charcoal rounded-full flex flex-col items-center justify-center aspect-square ${wrapperClassName}`}>
    <svg
      viewBox="0 0 100 70"
      className={`fill-current text-light-tan ${iconClassName}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 0 L50 70 L90 0 L70 0 L50 35 L30 0 Z" />
    </svg>
    <span className={`text-light-tan font-bold tracking-widest whitespace-nowrap ${textClassName}`}>
      VETPIVOT
    </span>
  </div>
);

export default VetPivotLogo;