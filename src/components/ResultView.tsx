import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Share2, RefreshCw, Download, Instagram, CheckCircle2, XCircle } from 'lucide-react';
import { FontInfo, Quiz } from '../types/game';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

interface ResultViewProps {
  score: number;
  total: number;
  scoreList: boolean[];
  userAnswers: FontInfo[];
  quizzes: Quiz[];
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ score, total, scoreList, userAnswers, quizzes, onRestart }) => {
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (score >= 8) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [score]);

  const handleDownload = async () => {
    if (shareRef.current === null) return;
    try {
      const dataUrl = await toPng(shareRef.current, { cacheBust: true, width: 1080, height: 1920 });
      
      // Try Web Share API with files first (great for iOS "Save Image")
      if (navigator.canShare) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], 'font-master-result.png', { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: '폰트오락실 결과',
              text: '나의 폰트 안목을 확인해보세요!'
            });
            return; // Successfully shared/saved
          }
        } catch (e) {
          console.warn('Share API with file failed, falling back to download link', e);
        }
      }

      // Fallback for desktop/Android or if Share fails
      const link = document.createElement('a');
      link.download = 'font-master-result.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  const getScoreMessage = () => {
    if (score === total) return "레전드 클리어 \uD83D\uDD79\uFE0F\n당신은 폰트오락실의 살아있는 전설입니다.";
    if (score >= 7) return "폰트 좀 아는 사람이네요 \uD83C\uDFAE\n거의 다 왔어요, 만점까지 한 걸음!";
    if (score >= 4) return "감각은 있어요! 조금만 더 다듬으면 됩니다 \uD83D\uDD79\uFE0F";
    return "동전 한 번 더 넣으세요 \uD83E\uDE99\n폰트오락실은 누구에게나 열려있습니다.";
  };

  const scoreMessage = getScoreMessage();

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl px-4 py-8 mx-auto -mt-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full text-center py-6"
      >
        <span className="text-[10px] font-black tracking-[0.4em] text-gray-400 uppercase">최종 정답률</span>
        <h1 className="my-4 text-[100px] leading-none font-black tracking-tighter">
          {score}<span className="text-4xl opacity-20 italic"> / {total}</span>
        </h1>
        <p className="mb-8 text-xl font-bold tracking-tight whitespace-pre-line">{scoreMessage}</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-8">
          <button 
            onClick={onRestart}
            className="btn-bold flex items-center justify-center gap-3"
          >
            <RefreshCw size={16} />
            다시 도전하기
          </button>
          <button 
            onClick={handleDownload}
            className="btn-outline-bold flex items-center justify-center gap-3"
          >
            <Download size={16} />
            이미지로 저장 (스토리용)
          </button>
        </div>

        <div className="text-left w-full space-y-4 mb-8">
          <h2 className="text-lg font-black border-b-2 border-black pb-2 mb-4">상세 결과</h2>
          {quizzes.map((quiz, idx) => {
            const isCorrect = scoreList[idx];
            const userAnswer = userAnswers[idx];
            return (
              <div key={idx} className="flex flex-col bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  {isCorrect ? (
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                  ) : (
                    <XCircle className="text-red-500 w-5 h-5" />
                  )}
                  <span className="font-bold">문제 {idx + 1}</span>
                </div>
                
                {/* 폰트 모양을 직접 렌더링하기 위해 스타일 태그 추가 */}
                <style dangerouslySetInnerHTML={{ __html: quiz.answer.css }} />
                {userAnswer && !isCorrect && (
                   <style dangerouslySetInnerHTML={{ __html: userAnswer.css }} />
                )}

                <div 
                  className="text-2xl mb-4 text-center break-keep" 
                  style={{ 
                    fontFamily: `"${quiz.answer.family}", sans-serif`,
                    fontWeight: quiz.answer.css.includes('font-weight: 700') || quiz.answer.css.includes('font-weight: bold') ? 'bold' : 'normal'
                  }}
                >
                  {quiz.word}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm bg-white p-3 rounded-lg border border-zinc-100 shadow-sm">
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">정답</span>
                    <span className="font-bold flex items-center gap-2 text-green-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      {quiz.answer.name}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">내가 선택한 폰트</span>
                    <span className={`font-bold flex items-center gap-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {userAnswer?.name || '시간 초과'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
      </motion.div>

      {/* Hidden container for image generation */}
      <div className="fixed top-[-9999px] left-[-9999px]">
        <div 
          ref={shareRef}
          className="w-[1080px] h-[1920px] bg-black p-12 flex flex-col items-center justify-between text-white font-sans"
          style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,100,0,0.1) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(0,200,255,0.1) 0%, transparent 50%)' }}
        >
          <div className="flex flex-col items-center mt-24">
            <div className="px-10 py-4 mb-12 text-5xl font-black tracking-widest text-black bg-white" style={{ fontFamily: 'MemomentKukkuk' }}>폰트오락실</div>
            <h2 className="text-7xl font-black text-center text-gray-400 uppercase tracking-tighter">최종 결과 리포트</h2>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative mb-24">
              <div className="absolute inset-0 bg-white blur-[120px] opacity-20"></div>
              <h1 className="relative font-black text-[500px] leading-none mb-4">{score} <span className="text-8xl opacity-30">/{total}</span></h1>
            </div>
            <p className="max-w-4xl text-6xl font-bold text-center leading-[1.2] px-12 whitespace-pre-line">
              {scoreMessage}
            </p>
          </div>

          <div className="flex flex-col items-center mb-24">
            <div className="grid grid-cols-5 gap-8 mb-24">
              {scoreList.map((correct, i) => (
                <div 
                  key={i} 
                  className={`w-32 h-32 flex items-center justify-center rounded-3xl border-4 text-6xl font-black ${correct ? 'bg-green-500 border-green-500 text-green-500' : 'bg-red-500 border-red-500 text-red-500'}`}
                >
                  {correct ? '✓' : '✗'}
                </div>
              ))}
            </div>
            <div className="text-4xl font-black tracking-widest opacity-20 uppercase">{window.location.host}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
