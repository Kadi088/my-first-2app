
import React from 'react';
import { ChevronDownIcon } from './icons';

interface AccordionSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  activeSection: string | null;
  setActiveSection: (id: string | null) => void;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ id, title, children, activeSection, setActiveSection }) => {
  const isOpen = activeSection === id;

  const toggleSection = () => {
    setActiveSection(isOpen ? null : id);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={toggleSection}
        className="w-full flex justify-between items-center p-3 text-lg font-semibold bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        <span>{title}</span>
        <ChevronDownIcon className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
      >
        <div className="bg-white dark:bg-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccordionSection;
