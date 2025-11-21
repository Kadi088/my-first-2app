import React, { useState, useEffect, useRef } from 'react';
import type { Word, Recording, Image as WordImage, AudioFile } from '../types';
import AccordionSection from './AccordionSection';
import HandwritingCanvas from './HandwritingCanvas';
import ImageLightbox from './ImageLightbox';

interface LearningModalProps {
  word: Word;
  onClose: () => void;
  onUpdateWord: (word: Word) => void;
  onDeleteWord: (id: number) => void;
}

const LearningModal: React.FC<LearningModalProps> = ({ word, onClose, onUpdateWord, onDeleteWord }) => {
  const [activeSection, setActiveSection] = useState<string | null>('repetition');
  const [repetitionInput, setRepetitionInput] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [autoPronunciationInterval, setAutoPronunciationInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const [loopingAudioId, setLoopingAudioId] = useState<number | null>(null);
  const audioFileRefs = useRef<Map<number, HTMLAudioElement>>(new Map());
  const [viewingImage, setViewingImage] = useState<string | null>(null);


  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (autoPronunciationInterval) {
        clearInterval(autoPronunciationInterval);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      // Stop any looping audio when the modal is closed
      audioFileRefs.current.forEach(audioEl => {
        if (audioEl) {
          audioEl.loop = false;
          audioEl.pause();
        }
      });
    };
  }, [autoPronunciationInterval]);

  const handleUpdate = (field: keyof Word, value: any) => {
    onUpdateWord({ ...word, [field]: value });
  };
  
  const addRepetition = () => {
    const newCount = Math.min((word.repetitions || 0) + 1, 200);
    handleUpdate('repetitions', newCount);
    setRepetitionInput('');
    pronounceWord('normal');
  };

  const pronounceWord = (speed: 'slow' | 'normal') => {
      if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word.english);
          utterance.lang = 'en-US';
          utterance.rate = speed === 'slow' ? 0.6 : 1.0;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
      }
  };

  const startAutoPronunciation = () => {
      stopAutoPronunciation();
      pronounceWord('normal');
      const interval = setInterval(() => pronounceWord('normal'), 3000);
      setAutoPronunciationInterval(interval);
  };

  const stopAutoPronunciation = () => {
      if (autoPronunciationInterval) {
          clearInterval(autoPronunciationInterval);
          setAutoPronunciationInterval(null);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
  };

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        let audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const newRecording: Recording = { id: Date.now(), url: audioUrl };
          const newRecordings = [...(word.recordings || []), newRecording];
          handleUpdate('recordings', newRecordings);
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorder.start();
      } catch (err) {
        alert('لا يمكن الوصول إلى الميكروفون. يرجى التحقق من الأذونات.');
        console.error("Mic access error:", err);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const startLoopingAudio = (id: number) => {
    // Stop any other looping audio first
    if (loopingAudioId !== null && audioFileRefs.current.has(loopingAudioId)) {
      const currentAudio = audioFileRefs.current.get(loopingAudioId);
      if (currentAudio) {
        currentAudio.loop = false;
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // Start looping the new one
    const audioEl = audioFileRefs.current.get(id);
    if (audioEl) {
      audioEl.loop = true;
      audioEl.play().catch(e => console.error("Audio play failed", e));
      setLoopingAudioId(id);
    }
  };

  const stopLoopingAudio = (id: number) => {
    const audioEl = audioFileRefs.current.get(id);
    if (audioEl) {
      audioEl.loop = false;
      audioEl.pause();
    }
    setLoopingAudioId(null);
  };

  const deleteRecording = (id: number) => {
    if (loopingAudioId === id) {
      stopLoopingAudio(id);
    }
    const newRecordings = (word.recordings || []).filter(rec => rec.id !== id);
    handleUpdate('recordings', newRecordings);
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const newImage: WordImage = { id: Date.now(), url: reader.result as string, name: file.name };
              handleUpdate('images', [...(word.images || []), newImage]);
          };
          reader.readAsDataURL(file);
      }
  };

  const deleteImage = (id: number) => {
    const newImages = (word.images || []).filter(img => img.id !== id);
    handleUpdate('images', newImages);
  };
  
  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('audio/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const newAudio: AudioFile = { id: Date.now(), url: reader.result as string, name: file.name, type: file.type };
              handleUpdate('audioFiles', [...(word.audioFiles || []), newAudio]);
          };
          reader.readAsDataURL(file);
      }
  };

  const deleteAudioFile = (id: number) => {
    if (loopingAudioId === id) {
      stopLoopingAudio(id);
    }
    const newAudioFiles = (word.audioFiles || []).filter(file => file.id !== id);
    handleUpdate('audioFiles', newAudioFiles);
  };

  const repetitionProgress = Math.min(((word.repetitions || 0) / 200) * 100, 100);
  const handwritingProgress = Math.min(((word.handwritingCount || 0) / 200) * 100, 100);


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تعلم كلمة: <span className="text-blue-500">{word.english}</span></h2>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl">&times;</button>
              </div>
              
              <div className="space-y-3">
                <AccordionSection title="التكرار الكتابي" id="repetition" activeSection={activeSection} setActiveSection={setActiveSection}>
                  <div className="p-4">
                    <input type="text" value={repetitionInput} onChange={e => setRepetitionInput(e.target.value)} placeholder="اكتب الكلمة هنا" className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"/>
                    <button onClick={addRepetition} disabled={repetitionInput.toLowerCase() !== word.english.toLowerCase()} className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">إضافة تكرار</button>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{width: `${repetitionProgress}%`}}></div></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">التقدم: {word.repetitions || 0} / 200</p>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="النطق" id="pronunciation" activeSection={activeSection} setActiveSection={setActiveSection}>
                    <div className="p-4 flex flex-wrap gap-2">
                        <button onClick={() => pronounceWord('slow')} className="px-5 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">نطق بطيء</button>
                        <button onClick={() => pronounceWord('normal')} className="px-5 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition">نطق طبيعي</button>
                        <button onClick={startAutoPronunciation} disabled={!!autoPronunciationInterval} className="px-5 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:bg-gray-400">تكرار تلقائي</button>
                        <button onClick={stopAutoPronunciation} className="px-5 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition">إيقاف</button>
                    </div>
                </AccordionSection>

                <AccordionSection title="تسجيل الصوت" id="recording" activeSection={activeSection} setActiveSection={setActiveSection}>
                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <button onClick={startRecording} disabled={isRecording} className="px-5 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400">بدء التسجيل</button>
                      <button onClick={stopRecording} disabled={!isRecording} className="px-5 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400">إيقاف</button>
                      {isRecording && <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>}
                    </div>
                    <div className="space-y-2">
                      {(word.recordings || []).map(rec => (
                        <div key={rec.id} className="flex flex-wrap items-center justify-between gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                          <audio 
                            src={rec.url} 
                            controls 
                            className="h-10 max-w-[180px] sm:max-w-xs"
                            ref={el => {
                                if (el) audioFileRefs.current.set(rec.id, el);
                                else audioFileRefs.current.delete(rec.id);
                            }}
                          ></audio>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                              {loopingAudioId === rec.id ? (
                                  <button onClick={() => stopLoopingAudio(rec.id)} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 whitespace-nowrap">إيقاف التكرار</button>
                              ) : (
                                  <button onClick={() => startLoopingAudio(rec.id)} className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 whitespace-nowrap">تكرار</button>
                              )}
                              <button onClick={() => deleteRecording(rec.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">حذف</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionSection>
                
                <AccordionSection title="الصور" id="images" activeSection={activeSection} setActiveSection={setActiveSection}>
                    <div className="p-4">
                        <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <label htmlFor="image-upload" className="cursor-pointer px-5 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-4 inline-block">رفع صورة</label>
                        <div className="flex flex-wrap gap-4 mt-4">
                            {(word.images || []).map(img => (
                              <div key={img.id} className="relative group">
                                  <button 
                                    type="button" 
                                    onClick={() => setViewingImage(img.url)} 
                                    className="block w-24 h-24 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                                    aria-label={`View image ${img.name}`}
                                  >
                                    <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                  </button>
                                  <button 
                                    onClick={() => deleteImage(img.id)} 
                                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 transform translate-x-1/2 -translate-y-1/2"
                                    aria-label={`Delete image ${img.name}`}
                                  >
                                    &times;
                                  </button>
                              </div>
                            ))}
                        </div>
                    </div>
                </AccordionSection>

                <AccordionSection title="ملفات الصوت" id="audio_files" activeSection={activeSection} setActiveSection={setActiveSection}>
                  <div className="p-4">
                      <input type="file" id="audio-upload" accept="audio/*" className="hidden" onChange={handleAudioFileUpload} />
                      <button onClick={() => document.getElementById('audio-upload')?.click()} className="px-5 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-4">رفع ملف صوتي</button>
                      <div className="space-y-2">
                          {(word.audioFiles || []).map(file => (
                              <div key={file.id} className="flex flex-wrap items-center justify-between gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                                  <p className="text-sm truncate flex-1 min-w-[120px]" title={file.name}>{file.name}</p>
                                  <div className="flex items-center gap-2 flex-wrap justify-end">
                                      <audio 
                                          src={file.url} 
                                          controls 
                                          className="h-10 max-w-[180px] sm:max-w-xs"
                                          ref={el => {
                                              if (el) audioFileRefs.current.set(file.id, el);
                                              else audioFileRefs.current.delete(file.id);
                                          }}
                                      />
                                      {loopingAudioId === file.id ? (
                                          <button onClick={() => stopLoopingAudio(file.id)} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 whitespace-nowrap">إيقاف التكرار</button>
                                      ) : (
                                          <button onClick={() => startLoopingAudio(file.id)} className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 whitespace-nowrap">تكرار</button>
                                      )}
                                      <button onClick={() => deleteAudioFile(file.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">حذف</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="الكتابة اليدوية" id="handwriting" activeSection={activeSection} setActiveSection={setActiveSection}>
                  <div className="p-4">
                    <HandwritingCanvas 
                      wordToDraw={word.english} 
                      onSave={() => handleUpdate('handwritingCount', Math.min((word.handwritingCount || 0) + 1, 200))}
                    />
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"><div className="bg-yellow-500 h-2.5 rounded-full" style={{width: `${handwritingProgress}%`}}></div></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">التقدم: {word.handwritingCount || 0} / 200</p>
                    </div>
                  </div>
                </AccordionSection>
              </div>

              <div className="flex justify-center mt-6">
                  <button onClick={() => onDeleteWord(word.id)} className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                      حذف الكلمة
                  </button>
              </div>
          </div>
      </div>
      {viewingImage && <ImageLightbox src={viewingImage} onClose={() => setViewingImage(null)} />}
    </>
  );
};

export default LearningModal;