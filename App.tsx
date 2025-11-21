
import React, { useState, useEffect, useMemo } from 'react';
import { useWords } from './hooks/useWords';
import type { Word } from './types';
import Header from './components/Header';
import Controls from './components/Controls';
import WordsGrid from './components/WordsGrid';
import AddWordModal from './components/AddWordModal';
import LearningModal from './components/LearningModal';
import AddCategoryModal from './components/AddCategoryModal';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const {
    words,
    categories,
    addWord,
    deleteWord,
    updateWord,
    addCategory,
    exportData,
    importData,
  } = useWords();

  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddWordModalOpen, setAddWordModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [learningWord, setLearningWord] = useState<Word | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const filteredWords = useMemo(() => {
    return words.filter(word => {
      const categoryMatch = activeCategory === 'الكل' || word.category === activeCategory;
      const searchMatch = searchTerm === '' ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.arabic.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [words, activeCategory, searchTerm]);

  const handleUpdateAndRefreshModal = (updatedWord: Word) => {
    updateWord(updatedWord);
    setLearningWord(updatedWord);
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header theme={theme} toggleTheme={toggleTheme} />
        
        <Controls
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          setSearchTerm={setSearchTerm}
          onAddWord={() => setAddWordModalOpen(true)}
          onAddCategory={() => setAddCategoryModalOpen(true)}
          onExport={exportData}
          onImport={importData}
        />

        <WordsGrid words={filteredWords} onWordClick={setLearningWord} />

        {isAddWordModalOpen && (
          <AddWordModal
            categories={categories}
            onClose={() => setAddWordModalOpen(false)}
            onAddWord={(word) => {
              addWord(word);
              setAddWordModalOpen(false);
            }}
          />
        )}

        {isAddCategoryModalOpen && (
          <AddCategoryModal
            onClose={() => setAddCategoryModalOpen(false)}
            onAddCategory={(category) => {
              addCategory(category);
              setAddCategoryModalOpen(false);
            }}
          />
        )}

        {learningWord && (
          <LearningModal
            word={learningWord}
            onClose={() => setLearningWord(null)}
            onUpdateWord={handleUpdateAndRefreshModal}
            onDeleteWord={(id) => {
              deleteWord(id);
              setLearningWord(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
