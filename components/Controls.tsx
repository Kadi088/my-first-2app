
import React from 'react';
import { PlusIcon, DownloadIcon, UploadIcon, SearchIcon } from './icons';

interface ControlsProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  onAddWord: () => void;
  onAddCategory: () => void;
  onExport: () => void;
  onImport: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  categories,
  activeCategory,
  setActiveCategory,
  setSearchTerm,
  onAddWord,
  onAddCategory,
  onExport,
  onImport,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن كلمة..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"
          />
          <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button onClick={onAddWord} className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm">
                <PlusIcon className="h-4 w-4" /> كلمة
            </button>
            <button onClick={onAddCategory} className="flex items-center justify-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition text-sm">
                <PlusIcon className="h-4 w-4" /> صنف
            </button>
            <button onClick={onExport} className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm">
                <DownloadIcon className="h-4 w-4" /> تصدير
            </button>
            <button onClick={onImport} className="flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition text-sm">
                <UploadIcon className="h-4 w-4" /> استيراد
            </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
            onClick={() => setActiveCategory('الكل')}
            className={`px-4 py-2 text-sm rounded-full transition ${activeCategory === 'الكل' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
            الكل
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 text-sm rounded-full transition ${activeCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Controls;
