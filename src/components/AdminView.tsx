import React, { useState } from 'react';
import { NOONNU_FONTS } from '../constants/fonts';
import { ArrowLeft, ExternalLink, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminViewProps {
  onBack: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFonts = NOONNU_FONTS.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.family.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-bold uppercase opacity-40 hover:opacity-100 transition-opacity mb-4"
            >
              <ArrowLeft size={16} /> 홈으로 돌아가기
            </button>
            <h1 className="text-4xl font-black tracking-tight">폰트 목록 ({NOONNU_FONTS.length})</h1>
            <p className="text-gray-400 mt-2 font-medium">모든 폰트가 정상적으로 로드되는지 확인하세요.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={() => {
                NOONNU_FONTS.forEach(f => {
                  const weightMatch = f.css.match(/font-weight:\s*([^;]+)/);
                  const weight = weightMatch ? weightMatch[1].trim() : '400';
                  document.fonts.load(`${weight} 1em '${f.family}'`);
                });
                alert('모든 폰트 로드를 시도합니다.');
              }}
              className="px-6 py-3 bg-black text-white text-xs font-black rounded-full hover:bg-zinc-800 transition-colors"
            >
              모든 폰트 불러오기
            </button>
            <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
            <input 
              type="text" 
              placeholder="폰트 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-zinc-50 border border-zinc-200 rounded-full w-full md:w-80 outline-none focus:border-black transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFonts.map((font, idx) => {
            const weightMatch = font.css.match(/font-weight:\s*([^;]+)/);
            const weight = weightMatch ? weightMatch[1].trim() : '400';
            
            return (
              <motion.div 
                key={font.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.01 }}
                className="p-6 border border-zinc-100 bg-zinc-50/50 rounded-2xl hover:border-black transition-colors group"
              >
                <style dangerouslySetInnerHTML={{ __html: font.css }} />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black p-1 px-2 bg-black text-white rounded">#{idx + 1}</span>
                    <FontStatus family={font.family} weight={weight} />
                  </div>
                </div>
                
                <div className="mb-6 h-20 flex items-center overflow-hidden">
                  <p 
                    style={{ fontFamily: `'${font.family}', serif`, fontWeight: weight, fontStyle: 'normal' }}
                    className="text-4xl leading-tight truncate w-full"
                  >
                    {font.name}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-2">
                  <div className="text-[10px] uppercase font-bold tracking-widest opacity-30">
                    {font.family} ({weight})
                  </div>
                  <div className="text-[8px] truncate opacity-20 hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden flex items-center justify-between">
                    <span className="truncate flex-1">{font.css.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] || 'URL Not Found'}</span>
                    <button 
                      onClick={() => {
                        const url = font.css.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
                        if (url) {
                          navigator.clipboard.writeText(url);
                          alert('URL이 복사되었습니다.');
                        }
                      }}
                      className="ml-2 hover:text-black transition-colors font-bold"
                    >
                      COPY
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FontStatus: React.FC<{ family: string; weight: string }> = ({ family, weight }) => {
  const [status, setStatus] = useState<'checking' | 'loaded' | 'failed'>('checking');

  React.useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        await document.fonts.ready;
        const query = `${weight} 1em '${family}'`;
        const loaded = document.fonts.check(query);
        if (mounted) setStatus(loaded ? 'loaded' : 'failed');
        
        if (!loaded) {
          // Try to load it
          await document.fonts.load(query);
          if (mounted) setStatus(document.fonts.check(query) ? 'loaded' : 'failed');
        }
      } catch (e) {
        if (mounted) setStatus('failed');
      }
    };
    check();
    return () => { mounted = false; };
  }, [family, weight]);

  if (status === 'loaded') return <span className="text-[8px] font-bold text-green-500 uppercase tracking-tighter">로드 완료</span>;
  if (status === 'failed') return <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">로드 실패</span>;
  return <span className="text-[8px] font-bold text-zinc-300 animate-pulse uppercase tracking-tighter">로딩 중...</span>;
};

export default AdminView;
