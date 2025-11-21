import React from 'react';

interface ImageLightboxProps {
  src: string;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, onClose }) => {
  // Effect to handle Escape key press for closing the lightbox
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4 animate-fade-in" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="image-lightbox-title"
    >
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
        `}
      </style>
      <div 
        className="relative max-w-full max-h-full" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="image-lightbox-title" className="sr-only">Enlarged image view</h2>
        <img 
          src={src} 
          alt="Enlarged view" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center text-2xl font-bold hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close image view"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ImageLightbox;
