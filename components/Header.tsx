import React from 'react';
import VetPivotLogo from './VetPivotLogo';

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center gap-4">
        <VetPivotLogo wrapperClassName="w-12 h-12 p-1.5" iconClassName="w-5" textClassName="text-[7px] -mt-1" />
      </div>
      <nav>
        <a href="#" className="flex items-center gap-2 text-light-tan/80 hover:text-light-tan transition-colors">
          <HomeIcon />
          <span>Home</span>
        </a>
      </nav>
    </header>
  );
};

export default Header;