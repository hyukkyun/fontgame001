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
      await document.fonts.load("1em 'Maruminya'");
      const dataUrl = await toPng(shareRef.current, { cacheBust: true, width: 1080, height: 1920 });
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Try Web Share API with files first (great for iOS "Save Image") - ONLY ON MOBILE
      if (isMobile && navigator.canShare) {
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
          className="w-[1080px] h-[1920px] bg-white flex flex-col items-center text-black"
          style={{ fontFamily: "'Maruminya', sans-serif" }}
        >
          {/* Top Header */}
          <div className="flex flex-col items-center mt-40 mb-20 text-center">
            <div className="text-4xl tracking-widest mb-6">(FINAL FONT REPORT)</div>
            <div className="text-[120px] font-black leading-tight tracking-tight">폰트오락실</div>
            <div className="text-[100px] font-black leading-tight tracking-tight">최종결과</div>
          </div>

          {/* Central Box */}
          <div 
            className="relative border-[8px] border-black w-[840px] h-[780px] flex flex-col items-center justify-center text-center my-6 overflow-hidden"
            style={{ backgroundColor: score === total ? '#ffe108' : 'white' }}
          >
            {/* Corner Markers */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-[8px] border-l-[8px] border-black" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-[8px] border-r-[8px] border-black" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-[8px] border-l-[8px] border-black" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-[8px] border-r-[8px] border-black" />

            <div className="text-[280px] leading-none mb-8 mt-4 font-black">{score}</div>
            <p className="text-[48px] font-bold leading-snug whitespace-pre-line tracking-tight px-12 mb-4 shrink-0 break-keep">
              {scoreMessage}
            </p>
          </div>

          {/* Result Barcode */}
          <div className="flex gap-3 mt-28 mb-16">
            {scoreList.map((correct, i) => (
              <div 
                key={i} 
                className={`w-[36px] h-[160px] ${correct ? 'bg-black' : 'border-[6px] border-black bg-white'}`}
              />
            ))}
          </div>

          {/* Date & Time */}
          <div className="text-[42px] tracking-widest font-bold">
            {new Date().getFullYear()}-{new Date().getMonth() + 1}-{new Date().getDate()} - {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}
          </div>

          {/* Footer Info */}
          <div className="flex flex-col items-center mt-auto mb-20 text-[40px] leading-relaxed tracking-widest">
            <p className="mb-2">game.beyondbetterbrand.com</p>
            <p>insta @beyondbetterbrand</p>
            <div className="mt-12 opacity-100 relative">
              <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201.26 216.24" width="80" height="86">
                <g id="w4eCZE">
                  <g>
                    <path fill="black" d="M112.43,194.14c-1.37-.02-2.75.01-4.12,0v-35.53c-1.49-.44-2.85-.08-4.33,0v35.53h-4.12v-35.32c-.16-.06-.26.22-.33.22h-3.79v10.18h-3.79l-.33.33v3.9l-.33.33h-3.68c-.84,1.18-.46,2.77-.54,4.12h-3.79l-.33.33v3.68c-1.06.76-2.66-.01-3.9.54v4.33h-8.45v4.12h-21.02v-4.12h-7.58v-4.12s-.24.04-.36-.08-.06-.36-.08-.36h-3.68v-3.36c0-.06-.62-.59-.43-.98h-3.9v-3.79s-.68-.54-.76-.54h-3.58v-8.02h-4.01l-.33-.33v-25.57l.33-.33h4.01v-4.55h4.12v-8.13l.33-.33h4.01v-3.79l-.33-.28c-.09,0-.16.17-.22.17h-15.6c-.98-1.18.6-3.1-.43-4.33h-7.91c-.19-1.48.74-2.58.43-4.12h-4.77v-4.33h-4.33v-4.33c-.84-.68-4.33.44-4.52-.34l.19-21.11h4.33v-7.69c0-.2.11-.84.33-.98h3.68l.33-.33v-4.01h4.12v-4.01l.33-.33h7.8l.33-.33v-4.01h35.97v4.01l.33.33h8.78v-4.55h-4.55v-8.34l-.33-.28c-.09,0-.16.17-.22.17h-3.9l-.33-.33v-8.34h-4.33v-25.89c0-.6,1.32-.12,1.63-.11.52.02,2.92.18,2.92-.54v-4.66h4.55v-4.55h4.55v-4.44l.33-.28c.09,0,.16.17.22.17h3.79V0l27.3.11v4.44h4.23l.33.33v4.44h4.33l.25,4.3,4.95.25v4.44c0,.06.26.74.35.77,1-.04,2,.02,3-.01.28,0,1.41-.45,1.41.11v12.57l.33.33h4.12l.33-.33v-3.9c0-.08-.38-.24.11-.54h4.23v-4.23l.33-.33h8.56v-4.23l.33-.33h22.43v4.55l4.33.22v4.01l.33.33h4.12l.33.33v4.12l.33.33h4.01v8.56l.33.33h4.01v25.46l-.33.33h-4.01v8.45h-4.12v4.55h-4.55c-.91,1.5-.53,3.1-.87,4.77h18.63v4.33h8.13l.33.33v4.01h4.12v4.12h4.12v4.01l.33.33h4.01v16.47h-4.01l-.33.33v4.01h-4.12v4.12h-4.12v4.33h-8.23v4.33h4.12v4.33h4.01l.33.33v21.45l-.33.33h-3.68l-.33.33v8.13h-4.12v4.12h-4.12v4.12h-4.12v4.12c-1.3.11-2.46.42-3.76.02l-.35.31v4.01h-8.45v4.12h-21.45v-4.12h-8.45v-4.01l-.33-.33h-4.01v-4.12h-4.12v-4.12h-4.33v-4.12h-4.55c0,8.01,0,16.04,0,24.05,1.37.02,2.75-.01,4.12,0v22.1h-8.23v-4.33h4.12c0-5.92,0-11.85,0-17.77ZM104.19,67.17v-3.79l-.33-.33h-12.03v4.12l-4.12.22-.22,7.8h-4.12v34.23h4.12l.22,8.02h4.12v4.12h12.13c.54-1.37-.18-2.7,0-4.12h4.01l.33-.33v-7.69h4.12l.22-33.58h-4.33v-8.34l-.33-.33h-3.79ZM144.93,75.62v-4.01l-.33-.33h-10.29v4.33l-4.33.22v8.67h-4.12v30.33l4.02.42.31,6.95h4.33v4.12c.28-.12.64.22.76.22h9.64v-4.33h4.12v-7.37h4.12v-30.33h-3.79l-.33-.33v-8.56h-4.12ZM129.54,134.34h-33.37v4.01l-.34.3c-1.35-.51-2.62.1-3.99.02v11.48l3.9.22v4.12h33.8v-4.01l.33-.33h3.79v-11.48h-4.12v-4.33Z"/>
                    <polygon fill="black" points="108.09 194.14 108.09 211.69 103.98 211.69 104.19 194.14 108.09 194.14"/>
                    <path fill="white" d="M104.19,67.17h3.79l.33.33v8.34h4.33l-.22,33.58h-4.12v7.69l-.33.33h-4.01c-.18,1.42.54,2.75,0,4.12h-12.13v-4.12h-4.12l-.22-8.02h-4.12v-34.23h4.12l.22-7.8,4.12-.22v-4.12h12.03l.33.33v3.79ZM107.66,96.64h-8.23c-.15,1.41-.66,2.61-.43,4.12h-2.82s0,7.69,0,7.69c0,.07-.3.31-.22.54l3.87.46.46,3.66,4.51-.05c.9-1.21,1.5-2.24,1.76-3.76l1.97-.09c-.04-2.84.37-5.61,0-8.45h-.87s0-4.12,0-4.12Z"/>
                    <path fill="white" d="M144.93,75.62h4.12v8.56l.33.33h3.79v30.33h-4.12v7.37h-4.12v4.33h-9.64c-.12,0-.48-.33-.76-.22v-4.12h-4.33l-.31-6.95-4.02-.42v-30.33h4.12v-8.67l4.33-.22v-4.33h10.29l.33.33v4.01ZM144.93,101.62h-4.77v4.01l-.33.33h-3.79v8.67h4.12v3.47h5.85c-.04-1.34,1.02-2.21,1.33-3.43l1.7-.03v-8.67h-3.79l-.33-.33v-4.01Z"/>
                    <path fill="white" d="M129.54,134.34v4.33h4.12v11.48h-3.79l-.33.33v4.01h-33.8v-4.12l-3.9-.22v-11.48c1.37.08,2.64-.53,3.99-.02l.34-.3v-4.01h33.37Z"/>
                    <path fill="black" d="M107.66,96.64v4.12h.87c.37,2.84-.04,5.61,0,8.45l-1.97.09c-.26,1.52-.87,2.55-1.76,3.76l-4.51.05-.46-3.66-3.87-.46c-.08-.23.22-.47.22-.54v-7.69h2.82c-.23-1.5.28-2.71.43-4.12h8.23Z"/>
                    <path fill="black" d="M144.93,101.62v4.01l.33.33h3.79v8.67l-1.7.03c-.31,1.22-1.37,2.1-1.33,3.43h-5.85v-3.47h-4.12v-8.67h3.79l.33-.33v-4.01h4.77Z"/>
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
