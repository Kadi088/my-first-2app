
import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="text-center mb-8 relative pt-8">
      <button
        onClick={toggleTheme}
        className="absolute top-0 left-0 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
      </button>
    </header>
  );
};

export default Header;
