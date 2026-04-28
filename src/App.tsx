/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, Type, Gamepad2 } from 'lucide-react';
import { GameState, Quiz, FontInfo } from './types/game';
import { NOONNU_FONTS } from './constants/fonts';
import { POPULAR_WORDS } from './constants/words';
import FontLoader from './components/FontLoader';
import QuizView from './components/QuizView';
import ResultView from './components/ResultView';
import AdminView from './components/AdminView';

const QUIZ_COUNT = 10;
const OPTIONS_COUNT = 4;

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentQuizIndex: 0,
    score: 0,
    scoreList: [],
    userAnswers: [],
    quizzes: [],
    status: 'IDLE',
  });

  useEffect(() => {
    if (gameState.status === 'PLAYING') {
      const currentQuiz = gameState.quizzes[gameState.currentQuizIndex];
      const nextQuiz = gameState.quizzes[gameState.currentQuizIndex + 1];

      const loadFont = (family: string) => {
        document.fonts.load(`1em '${family}'`).catch(() => {});
      };

      if (currentQuiz) {
        currentQuiz.options.forEach(opt => loadFont(opt.family));
        loadFont(currentQuiz.answer.family);
      }
      
      if (nextQuiz) {
        nextQuiz.options.forEach(opt => loadFont(opt.family));
        loadFont(nextQuiz.answer.family);
      }
    }
  }, [gameState.currentQuizIndex, gameState.status, gameState.quizzes]);

  const generateQuizzes = useCallback(() => {
    const shuffledFonts = shuffle(NOONNU_FONTS);
    const shuffledWords = shuffle(POPULAR_WORDS);
    const pickedFonts = shuffledFonts.slice(0, QUIZ_COUNT);
    
    const newQuizzes: Quiz[] = pickedFonts.map((font, idx) => {
      // Pick 3 random wrong fonts
      const otherFonts = NOONNU_FONTS.filter(f => f.id !== font.id);
      const wrongOptions = shuffle(otherFonts).slice(0, OPTIONS_COUNT - 1);
      
      const options = shuffle([font, ...wrongOptions]);
      
      const word = shuffledWords[idx % shuffledWords.length];
      
      return {
        id: `quiz-${idx}-${Date.now()}`, // Added timestamp to ensure unique IDs across games
        word,
        answer: font,
        options,
      };
    });
    
    return newQuizzes;
  }, []);

  const startGame = () => {
    const quizzes = generateQuizzes();
    setGameState({
      currentQuizIndex: 0,
      score: 0,
      scoreList: [],
      userAnswers: [],
      quizzes: quizzes,
      status: 'PLAYING',
    });
  };

  const handleAnswer = (pickedFont: FontInfo | null) => {
    const currentQuiz = gameState.quizzes[gameState.currentQuizIndex];
    const isCorrect = pickedFont ? pickedFont.id === currentQuiz.answer.id : false;
    
    const nextScore = isCorrect ? gameState.score + 1 : gameState.score;
    const nextScoreList = [...gameState.scoreList, isCorrect];
    const nextUserAnswers = [...gameState.userAnswers, pickedFont];
    const nextIndex = gameState.currentQuizIndex + 1;
    
    if (nextIndex >= QUIZ_COUNT) {
      setGameState(prev => ({
        ...prev,
        score: nextScore,
        scoreList: nextScoreList,
        userAnswers: nextUserAnswers,
        status: 'RESULT',
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        currentQuizIndex: nextIndex,
        score: nextScore,
        scoreList: nextScoreList,
        userAnswers: nextUserAnswers,
      }));
    }
  };

  return (
    <div className="relative min-h-screen font-sans bg-white text-[#1A1A1A] overflow-hidden">
      <FontLoader />
      
      {/* Background Decorative Element */}
      <div className="decorative-grid" />

      {/* Main Layout Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center p-8 md:p-12 z-50">
          <button 
            onClick={() => setGameState(prev => ({ ...prev, status: 'IDLE' }))}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-black flex items-center justify-center text-white"><Gamepad2 size={16} /></div>
            <span style={{ fontFamily: 'MemomentKukkuk', fontSize: '1.25rem' }} className="font-black tracking-widest hidden sm:block">폰트오락실</span>
          </button>
          
          <AnimatePresence mode="wait">
            {gameState.status === 'PLAYING' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-end uppercase"
              >
                <span className="text-[10px] font-bold opacity-40 mb-1">문제</span>
                <span className="text-2xl font-black">
                  {String(gameState.currentQuizIndex + 1).padStart(2, '0')}
                  <span className="opacity-20 italic"> / {QUIZ_COUNT}</span>
                </span>
              </motion.div>
            )}
            {gameState.status !== 'PLAYING' && (
              <div className="text-[10px] font-black uppercase tracking-widest opacity-40 text-right">
                made by{' '}
                <a 
                  href="https://www.instagram.com/beyondbetterbrand/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:opacity-100 transition-opacity underline ml-1"
                >
                  @beyondbetterbrand
                </a>
              </div>
            )}
          </AnimatePresence>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-20">
          <AnimatePresence mode="wait">
            {gameState.status === 'IDLE' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="flex flex-col items-center text-center space-y-8"
              >
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">당신의 안목을 테스트하세요</p>
                <h1 style={{ fontFamily: 'MemomentKukkuk' }} className="text-red-600 text-6xl md:text-[100px] leading-none mb-4 tracking-normal">
                  폰트오락실
                </h1>
                <p className="max-w-xl text-sm font-medium leading-relaxed opacity-40 mb-8 px-4">
                  눈누의 인기폰트({NOONNU_FONTS.length}개) 중 랜덤으로 선별된 10개의 퀴즈를 풀어보세요. <br />
                  당신의 디자인 감각을 테스트하고 SNS에 결과를 공유해보세요.
                  <br /><br />
                  <span className="text-xs opacity-80">이 게임은 눈누에서 제공하는 웹폰트 링크를 사용합니다.</span>
                </p>
                
                <button
                  onClick={startGame}
                  className="btn-bold group relative flex items-center gap-4"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    게임 시작 <Play size={16} fill="currentColor" />
                  </span>
                </button>
              </motion.div>
            )}

            {gameState.status === 'PLAYING' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <QuizView 
                  quiz={gameState.quizzes[gameState.currentQuizIndex]}
                  onAnswer={handleAnswer}
                  currentIndex={gameState.currentQuizIndex}
                  totalQuizzes={QUIZ_COUNT}
                  score={gameState.score}
                />
              </motion.div>
            )}

            {gameState.status === 'RESULT' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <ResultView 
                  score={gameState.score}
                  total={QUIZ_COUNT}
                  scoreList={gameState.scoreList}
                  userAnswers={gameState.userAnswers}
                  quizzes={gameState.quizzes}
                  onRestart={startGame}
                />
              </motion.div>
            )}

            {gameState.status === 'ADMIN' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full fixed inset-0 z-[100] bg-white overflow-auto"
              >
                <AdminView onBack={() => setGameState(prev => ({ ...prev, status: 'IDLE' }))} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sidebar Label (Desktop Only) */}
        <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-10">
          <div className="h-20 w-px bg-zinc-200"></div>
          <p className="vertical-label text-[10px] font-bold uppercase tracking-widest opacity-40">
            당신의 결과를 SNS에 공유해보세요
          </p>
          <div className="h-20 w-px bg-zinc-200"></div>
        </div>

        {/* Footer */}
        <footer className="p-8 md:p-12 flex justify-between items-end flex-wrap gap-4 z-50">
          <div className="max-w-[250px] sm:max-w-sm flex flex-col gap-1">
            <p className="text-sm font-black tracking-widest" style={{ fontFamily: 'MemomentKukkuk' }}>폰트오락실 Beta</p>
            <p className="text-[10px] leading-relaxed font-bold opacity-40 uppercase tracking-widest">
              made by{' '}
              <a 
                href="https://www.instagram.com/beyondbetterbrand/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:opacity-100 transition-opacity underline ml-1"
              >
                @beyondbetterbrand
              </a>
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {gameState.status === 'PLAYING' && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold opacity-30 uppercase">점수</span>
                <span className="text-2xl font-black">{gameState.score * 100}</span>
              </div>
            )}
            <div className="flex gap-4">
              <button 
                onClick={() => setGameState(prev => ({ ...prev, status: 'ADMIN' }))}
                className="text-[10px] font-bold opacity-20 hover:opacity-100 transition-opacity uppercase tracking-widest"
              >
                등록폰트
              </button>
              <Sparkles size={16} className="opacity-20 translate-y-[-2px]" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
