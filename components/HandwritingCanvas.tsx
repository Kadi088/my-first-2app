import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HandwritingCanvasProps {
  wordToDraw: string;
  onSave: () => void;
}

const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ wordToDraw, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasEnabled, setCanvasEnabled] = useState(true);
  const [validationMessage, setValidationMessage] = useState<{type: 'success' | 'error' | 'none', text: string}>({ type: 'none', text: '' });


  const getCanvasContext = (canvas: HTMLCanvasElement | null) => {
    return canvas ? canvas.getContext('2d', { willReadFrequently: true }) : null;
  };
  
  const prepareCanvases = useCallback(() => {
    setValidationMessage({ type: 'none', text: '' });
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (container && (canvas.width !== container.clientWidth || canvas.height !== 200)) {
        canvas.width = container.clientWidth;
        canvas.height = 200;
    }

    const ctx = getCanvasContext(canvas);
    if (!ctx) return;
    
    // Prepare offscreen canvas for validation
    if (!textCanvasRef.current) {
        textCanvasRef.current = document.createElement('canvas');
    }
    const textCanvas = textCanvasRef.current;
    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;
    const textCtx = getCanvasContext(textCanvas);
    if (!textCtx) return;

    // Clear both canvases
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);

    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Common font settings
    const fontSize = Math.min(canvas.width / (wordToDraw.length * 0.6), 80);
    const font = `bold ${fontSize}px sans-serif`;
    
    // Draw solid text on the off-screen canvas (for validation)
    textCtx.font = font;
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.fillStyle = '#000000'; // Any solid color will do
    textCtx.fillText(wordToDraw, canvas.width / 2, canvas.height / 2);

    // Draw faint guide text on the visible canvas
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    ctx.fillText(wordToDraw, canvas.width / 2, canvas.height / 2);

  }, [wordToDraw]);

  const clearDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext(canvas);
    if(ctx && canvas) {
      // Clear user drawing but keep the guide text
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      prepareCanvases();
    }
  }, [prepareCanvases]);

  const handleCheck = () => {
    const canvas = canvasRef.current;
    const textCanvas = textCanvasRef.current;
    if (!canvas || !textCanvas) return;

    const ctx = getCanvasContext(canvas);
    const textCtx = getCanvasContext(textCanvas);
    if (!ctx || !textCtx) return;

    const drawingData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const textData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height).data;

    let totalTextPixels = 0;
    let coveredPixels = 0;

    for (let i = 0; i < textData.length; i += 4) {
      const alphaText = textData[i + 3];
      if (alphaText > 0) {
        totalTextPixels++;
        const alphaDrawing = drawingData[i + 3];
        if (alphaDrawing > 0) {
          coveredPixels++;
        }
      }
    }

    const coverage = totalTextPixels > 0 ? (coveredPixels / totalTextPixels) * 100 : 0;
    
    if (coverage >= 90) {
      setValidationMessage({ type: 'success', text: `ممتاز! لقد قمت بتغطية ${coverage.toFixed(0)}% من الكلمة.` });
      onSave();
      setTimeout(() => {
        clearDrawing();
      }, 2000);
    } else {
      setValidationMessage({ type: 'error', text: `حاول مرة أخرى. لقد قمت بتغطية ${coverage.toFixed(0)}% فقط.` });
    }
  };

  const getCoords = (e: MouseEvent | TouchEvent): { x: number, y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
          if (e.touches.length === 0) return null;
          return {
              x: e.touches[0].clientX - rect.left,
              y: e.touches[0].clientY - rect.top,
          };
      }
      return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
      };
  };

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    if (!canvasEnabled) return;
    if('touches' in e) e.preventDefault();
    const coords = getCoords(e);
    const ctx = getCanvasContext(canvasRef.current);
    if (coords && ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
      setValidationMessage({ type: 'none', text: '' });
    }
  }, [canvasEnabled]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing || !canvasEnabled) return;
    if('touches' in e) e.preventDefault();
    const coords = getCoords(e);
    const ctx = getCanvasContext(canvasRef.current);
    if (coords && ctx) {
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const isDarkMode = document.documentElement.classList.contains('dark');
      ctx.strokeStyle = isDarkMode ? '#e5e7eb' : '#1f2937';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  }, [isDrawing, canvasEnabled]);

  const stopDrawing = useCallback(() => {
    const ctx = getCanvasContext(canvasRef.current);
    if (ctx) {
      ctx.closePath();
      setIsDrawing(false);
    }
  }, []);

  useEffect(() => {
    prepareCanvases();
    window.addEventListener('resize', prepareCanvases);
    
    return () => {
      window.removeEventListener('resize', prepareCanvases);
    };
  }, [prepareCanvases]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // FIX: Explicitly typing touchOptions helps TypeScript correctly resolve the addEventListener overloads.
    const touchOptions: AddEventListenerOptions = { passive: false };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing, touchOptions);
    canvas.addEventListener('touchmove', draw, touchOptions);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);

      canvas.removeEventListener('touchstart', startDrawing, touchOptions);
      canvas.removeEventListener('touchmove', draw, touchOptions);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);
  
  const validationColor = validationMessage.type === 'success' 
    ? 'text-green-500' 
    : validationMessage.type === 'error' 
    ? 'text-red-500' 
    : '';

  return (
    <div>
        <label className="flex items-center mb-4 cursor-pointer">
            <input type="checkbox" checked={canvasEnabled} onChange={() => setCanvasEnabled(!canvasEnabled)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <span className="ms-2 text-sm text-gray-700 dark:text-gray-300">تفعيل الرسم (ألغ التفعيل للتمرير)</span>
        </label>
        <div className={`relative touch-none border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 ${!canvasEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <canvas ref={canvasRef} className="relative z-10 w-full"></canvas>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button onClick={clearDrawing} className="px-5 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">مسح</button>
            <button onClick={handleCheck} className="px-5 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition">تحقق من الإجابة</button>
        </div>
        {validationMessage.text && (
            <p className={`mt-3 text-sm font-semibold text-center ${validationColor}`}>{validationMessage.text}</p>
        )}
    </div>
  );
};

export default HandwritingCanvas;