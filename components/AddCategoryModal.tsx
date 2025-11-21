
import React, { useState, FormEvent } from 'react';

interface AddCategoryModalProps {
  onClose: () => void;
  onAddCategory: (category: string) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onClose, onAddCategory }) => {
  const [category, setCategory] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!category.trim()) {
      alert('يرجى إدخال اسم الصنف');
      return;
    }
    onAddCategory(category.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">إضافة صنف جديد</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="اسم الصنف الجديد (مثال: تقني)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoFocus
          />
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
              className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
            >
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
