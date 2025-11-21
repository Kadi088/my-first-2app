
import React, { useState } from 'react';
import type { Word } from '../types';

interface WordCardProps {
  word: Word;
  onClick: () => void;
}

const categoryColors: { [key: string]: string } = {
  "سهل": 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  "متوسط": 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  "صعب": 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  "طبي": 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  "رياضي": 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

const WordCard: React.FC<WordCardProps> = ({ word, onClick }) => {
  const [showTranslation, setShowTranslation] = useState(false);

  const repetitionProgress = Math.min((word.repetitions || 0) / 200 * 100, 100);
  const handwritingProgress = Math.min((word.handwritingCount || 0) / 200 * 100, 100);
  const overallProgress = (repetitionProgress + handwritingProgress) / 2;
  const categoryColor = categoryColors[word.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';


  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${categoryColor}`}>
          {word.category}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">#{word.id}</span>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{word.english}</h3>
      
      {showTranslation && (
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{word.arabic}</p>
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowTranslation(!showTranslation);
        }}
        className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
      >
        {showTranslation ? 'إخفاء الترجمة' : 'عرض الترجمة'}
      </button>
      
      <div className="space-y-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${overallProgress}%` }}></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-left">التقدم: {overallProgress.toFixed(0)}%</p>
      </div>
    </div>
  );
};

export default WordCard;
