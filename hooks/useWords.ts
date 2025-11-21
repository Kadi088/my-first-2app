
import { useState, useEffect, useCallback } from 'react';
import type { Word } from '../types';
import { INITIAL_WORDS, INITIAL_CATEGORIES } from '../constants';

const WORDS_STORAGE_KEY = 'vocabularyWords';
const CATEGORIES_STORAGE_KEY = 'vocabularyCategories';

export const useWords = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedWords = localStorage.getItem(WORDS_STORAGE_KEY);
      if (storedWords) {
        setWords(JSON.parse(storedWords));
      } else {
        setWords(INITIAL_WORDS);
      }

      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(INITIAL_CATEGORIES);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setWords(INITIAL_WORDS);
      setCategories(INITIAL_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(words));
    } catch (error) {
      console.error("Failed to save words to localStorage", error);
    }
  }, [words]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error("Failed to save categories to localStorage", error);
    }
  }, [categories]);

  const addWord = useCallback((newWordData: Omit<Word, 'id'>) => {
    setWords(prevWords => {
      const newWord: Word = {
        ...newWordData,
        id: prevWords.length > 0 ? Math.max(...prevWords.map(w => w.id)) + 1 : 1,
      };
      return [...prevWords, newWord];
    });
  }, []);
  
  const deleteWord = useCallback((wordId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الكلمة؟')) {
      setWords(prevWords => prevWords.filter(word => word.id !== wordId));
    }
  }, []);

  const updateWord = useCallback((updatedWord: Word) => {
    setWords(prevWords => 
      prevWords.map(word => word.id === updatedWord.id ? updatedWord : word)
    );
  }, []);

  const addCategory = useCallback((newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prevCategories => [...prevCategories, newCategory]);
    }
  }, [categories]);

  const exportData = useCallback(() => {
    try {
      const dataToExport = {
        words,
        categories,
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vocabulary_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [words, categories]);

  const importData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== 'string') throw new Error('Invalid file content');
          
          const data = JSON.parse(result);
          if (Array.isArray(data.words) && Array.isArray(data.categories)) {
            if (window.confirm('سيتم استبدال جميع البيانات الحالية. هل أنت متأكد؟')) {
              setWords(data.words);
              setCategories(data.categories);
              alert('تم استيراد البيانات بنجاح!');
            }
          } else {
            alert('ملف غير صالح. يجب أن يحتوي على `words` و `categories`.');
          }
        } catch (error) {
          alert(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return { words, categories, addWord, deleteWord, updateWord, addCategory, exportData, importData };
};
