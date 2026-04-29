import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quiz, FontInfo } from '../types/game';

interface QuizViewProps {
  quiz: Quiz;
  onAnswer: (font: FontInfo | null) => void;
  currentIndex: number;
  totalQuizzes: number;
  score: number;
}

const QuizView: React.FC<QuizViewProps> = ({ quiz, onAnswer, currentIndex, totalQuizzes, score }) => {
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [timeProgress, setTimeProgress] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const onAnswerRef = useRef(onAnswer);

  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  useEffect(() => {
    // Reset state for new quiz
    setIsFontLoaded(false);
    setLoadError(false);
    setSelectedOptionId(null);
    
    let mounted = true;
    const triggerLoad = async () => {
      try {
        await document.fonts.ready;
        // Try to load the font family. We use a short timeout to not block forever.
        const family = `'${quiz.answer.family}'`;
        
        try {
          // Attempt to load
          await Promise.race([
            document.fonts.load(`1em ${family}`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
          ]);
        } catch (e) {
          console.warn(`Font ${family} load attempt failed or timed out`, e);
        }

        if (mounted) {
          // Check if it's actually loaded now
          const isLoaded = document.fonts.check(`1em ${family}`);
          setIsFontLoaded(true);
          if (!isLoaded) setLoadError(true);
        }
      } catch (err) {
        if (mounted) {
          setIsFontLoaded(true);
          setLoadError(true);
        }
      }
    };

    triggerLoad();
    return () => { mounted = false; };
  }, [quiz.answer.family]);

  useEffect(() => {
    if (!isFontLoaded) return;
    
    setTimeLeft(10);
    setTimeProgress(1);
    const startTime = Date.now();
    const duration = 10000;
    
    let animationFrameId: number;
    let isFinished = false;

    const animateTimer = () => {
      // If user selected an answer, stop timer
      if (selectedOptionId || isFinished) return;

      const elapsed = Date.now() - startTime;
      const remainingMs = duration - elapsed;
      
      if (remainingMs <= 0) {
        setTimeProgress(0);
        setTimeLeft(0);
        isFinished = true;
        
        // Wait just a tiny bit at 0 to let user see it, then proceed
        setTimeout(() => {
          onAnswerRef.current(null);
        }, 300);
      } else {
        setTimeProgress(remainingMs / duration);
        setTimeLeft(Math.ceil(remainingMs / 1000));
        animationFrameId = requestAnimationFrame(animateTimer);
      }
    };
    
    animationFrameId = requestAnimationFrame(animateTimer);

    return () => cancelAnimationFrame(animationFrameId);
  }, [quiz.id, isFontLoaded, selectedOptionId]);

  // Inject the specific @font-face for this question locally as well to ensure it's loaded
  const currentFontCss = quiz.answer.css;
  const weightMatch = currentFontCss.match(/font-weight:\s*([^;]+)/);
  const fontWeight = weightMatch ? weightMatch[1].trim() : 'normal';

  const handleOptionClick = (option: FontInfo) => {
    if (selectedOptionId) return; // Prevent double click
    setSelectedOptionId(option.id);
    
    // Provide a small visual delay for mobile feedback
    setTimeout(() => {
      onAnswerRef.current(option);
    }, 450);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto py-6 h-full min-h-[500px]">
      <div className="flex w-full justify-between items-center px-4 mb-4">
        <div className="font-bold text-sm bg-black dark:bg-white text-white dark:text-[#1A1A1A] px-3 py-1 rounded-full tracking-wider transition-colors">
          SCORE {score}
        </div>
        <div className="font-bold text-sm text-zinc-500 dark:text-zinc-400 tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full transition-colors">
          {currentIndex + 1} / {totalQuizzes}
        </div>
      </div>

      <style key={quiz.answer.id} dangerouslySetInnerHTML={{ __html: currentFontCss }} />
      
      <div className="text-center space-y-4 mb-4 flex-1 flex flex-col justify-center w-full px-2 text-black dark:text-white transition-colors">
        <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30">이 폰트의 이름은 무엇일까요?</p>
        
        {/* Display Word */}
        <AnimatePresence mode="wait">
          {isFontLoaded ? (
            <motion.div
              key={`${quiz.id}-${quiz.word}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center py-2"
            >
              <h2 
                style={{ 
                  fontFamily: `"${quiz.answer.family}", serif`,
                  fontWeight: fontWeight as any,
                  fontStyle: 'normal'
                }}
                className="text-[40px] sm:text-[60px] lg:text-[80px] leading-tight tracking-tight select-none break-keep text-center px-2"
              >
                {quiz.word}
              </h2>
              {loadError && (
                <p className="mt-4 text-[10px] font-bold text-red-500/40 uppercase tracking-widest">
                  폰트 로드 실패 (기본 글꼴로 표시됨)
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-20">폰트를 불러오는 중...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Options */}
      <div className="w-full max-w-md space-y-2 mt-auto">
        <p className="text-[10px] text-center uppercase tracking-[0.2em] font-black opacity-20 mb-2">정답이라고 생각하는 폰트 이름을 선택하세요</p>
        <div className="grid grid-cols-1 gap-2">
          {quiz.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const isOtherSelected = selectedOptionId !== null && !isSelected;
            
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOptionId !== null}
                className={`w-full text-left py-3 px-3 sm:px-4 transition-all group flex items-center justify-between cursor-pointer rounded-lg border-2 ${
                  isSelected 
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-[#1A1A1A] scale-[0.98]' 
                    : isOtherSelected 
                      ? 'border-zinc-100 dark:border-zinc-800 opacity-40 grayscale pointer-events-none'
                      : 'border-zinc-100 dark:border-zinc-800 hover:border-black dark:hover:border-white active:scale-[0.98]'
                }`}
              >
                <span className={`text-lg sm:text-xl font-bold tracking-tight transition-transform duration-300 ${isSelected ? 'translate-x-2' : 'group-hover:translate-x-2'}`}>
                  {option.name}
                </span>
                <span className={`text-[10px] font-black uppercase transition-opacity ${isSelected ? 'opacity-100 text-white dark:text-[#1A1A1A]' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isSelected ? '선택됨' : '선택'}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Timer */}
        {isFontLoaded && (
          <div className="w-full mt-6">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">
              <span>남은 시간</span>
              <span className={timeLeft <= 3 ? 'text-red-500 opacity-100' : ''}>{timeLeft}초</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden relative transition-colors">
              <div 
                className={`absolute top-0 left-0 w-full h-full origin-left will-change-transform ${timeLeft <= 3 ? 'bg-red-500' : 'bg-black dark:bg-white transition-colors'}`}
                style={{ transform: `scaleX(${timeProgress})` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
