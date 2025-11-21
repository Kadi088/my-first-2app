
import React, { useState, FormEvent } from 'react';
import type { Word } from '../types';

interface AddWordModalProps {
  categories: string[];
  onClose: () => void;
  onAddWord: (word: Omit<Word, 'id'>) => void;
}

const AddWordModal: React.FC<AddWordModalProps> = ({ categories, onClose, onAddWord }) => {
  const [english, setEnglish] = useState('');
  const [arabic, setArabic] = useState('');
  const [category, setCategory] = useState(categories[0] || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !arabic.trim() || !category) {
      alert('يرجى ملء جميع الحقول');
      return;
    }
    onAddWord({
      english: english.trim().toLowerCase(),
      arabic: arabic.trim(),
      category: category,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">إضافة كلمة جديدة</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="الكلمة بالإنجليزية"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="الترجمة بالعربية"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWordModal;
