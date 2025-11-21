
import React from 'react';
import type { Word } from '../types';
import WordCard from './WordCard';

interface WordsGridProps {
  words: Word[];
  onWordClick: (word: Word) => void;
}

const WordsGrid: React.FC<WordsGridProps> = ({ words, onWordClick }) => {
  if (words.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <h2 className="text-2xl font-semibold">لا توجد كلمات مطابقة</h2>
        <p>حاول تغيير فلتر البحث أو الصنف.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {words.map(word => (
        <WordCard key={word.id} word={word} onClick={() => onWordClick(word)} />
      ))}
    </div>
  );
};

export default WordsGrid;
