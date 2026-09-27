'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths } from 'date-fns';
import InputForm from './components/InputForm';
import LifeClock from './components/LifeClock';
import LifeStats from './components/LifeStats';
import Quote from './components/Quote';
import Footer from './components/Footer';
import WaveBackground from './components/WaveBackground';
import BgmToggle from './components/BgmToggle';
import useInterstitialAd from './hooks/useInterstitialAd';

export default function Home() {
  const today = new Date();
  const [birthDate, setBirthDate] = useState(''); // 입력 전에는 빈 값 (yyyy-MM-dd)
  const [lifeExpectancy, setLifeExpectancy] = useState('100');
  const [showResult, setShowResult] = useState(false);
  const [lifeClock, setLifeClock] = useState({ hour: 0, min: 0, sec: 0, ms: 0, us: 0 });
  const requestRef = useRef<number>(0);
  // 빌드 시 미리 그려지는 HTML이 한국어가 되도록 기본값은 'ko' (처음 열 때 영어가 잠깐 보이지 않게)
  const [lang, setLang] = useState('ko');
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isAdShowing, setIsAdShowing] = useState(false);
  const [isInToss, setIsInToss] = useState(false); // 광고는 토스 앱에서만 나오므로 안내 문구도 그때만 표시
  // 다시 하기 누를 때 띄우는 전면 광고 (토스 앱에서만)
  const showAd = useInterstitialAd({
    onAdOpen: () => setIsAdShowing(true),
    onAdClose: () => setIsAdShowing(false),
  });

  // 컴포넌트 시작할 때 언어 결정: 토스 앱에서는 항상 한국어, 일반 웹은 브라우저 언어 감지
  useEffect(() => {
    const inToss = 'ReactNativeWebView' in window;
    setIsInToss(inToss);
    const userLang = navigator.language || navigator.languages[0];
    if (inToss || userLang.startsWith('ko')) {
      setLang('ko');
    } else {
      setLang('en');
    }
  }, []);

  // 하단 명언
  const quotes = [
    { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
    { text: "Lost time is never found again.", author: "Benjamin Franklin" },
    { text: "The key is in not spending time, but in investing it.", author: "Stephen R. Covey" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Time is the most valuable thing a man can spend.", author: "Theophrastus" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Time flies over us, but leaves its shadow behind.", author: "Nathaniel Hawthorne" },
  ];
  
  const randomQuote = useMemo(() => {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [showResult]);

  const updateLifeClock = () => {
    const birth = new Date(birthDate);
    const death = new Date(birth);
    death.setFullYear(birth.getFullYear() + parseInt(lifeExpectancy));
    const now = new Date();

    const totalMs = death.getTime() - birth.getTime();
    const livedMs = now.getTime() - birth.getTime();
    const lifeRatio = livedMs / totalMs;

    const totalLifeMs = 24 * 60 * 60 * 1000; // 24시간
    const msInLife = lifeRatio * totalLifeMs;

    const hour = Math.floor(msInLife / (60 * 60 * 1000));
    const min = Math.floor((msInLife % (60 * 60 * 1000)) / (60 * 1000));
    const sec = Math.floor((msInLife % (60 * 1000)) / 1000);
    const ms = Math.floor(msInLife % 1000);
    const us = Math.floor((msInLife * 1000) % 1000);

    setLifeClock({ hour, min, sec, ms, us });
    requestRef.current = requestAnimationFrame(updateLifeClock);
  };

  useEffect(() => {
    if (showResult) {
      requestRef.current = requestAnimationFrame(updateLifeClock);
      return () => cancelAnimationFrame(requestRef.current!);
    }
  }, [showResult, birthDate, lifeExpectancy]);

  const birth = new Date(birthDate);
  const death = new Date(birth);
  death.setFullYear(birth.getFullYear() + parseInt(lifeExpectancy));

  const totalDays = Math.ceil((death.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  const livedDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = totalDays - livedDays;
  const lifeRatio = livedDays / totalDays;

  // 년/월/일 계산 (간단 로직)
  const yearsLeft = differenceInYears(death, today);
  const afterYears = addYears(today, yearsLeft);
  const monthsLeft = differenceInMonths(death, afterYears);
  const afterMonths = addMonths(afterYears, monthsLeft);
  const daysLeft = differenceInDays(death, afterMonths);

  // 잠깐 떴다 사라지는 안내 문구
  const showToast = (message: string, ok = true) => {
    setToast({ message, ok });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  // 공유하기: 현재 인생 시각 문구 + 앱 링크를 클립보드에 복사
  const handleShare = async () => {
    const { hour, min } = lifeClock;
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const text = lang === 'ko'
      ? `제 인생은 ${hour < 12 ? '오전' : '오후'} ${hour12}시 ${min}분을 지나고 있어요. 당신은 몇시인가요?`
      : `My life is passing ${hour12}:${String(min).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}. What time is yours?`;

    try {
      if ('ReactNativeWebView' in window) {
        // 토스 앱 안: 토스 공유 링크 + SDK 클립보드 (웹 빌드에서는 불러오지 않도록 동적 import)
        const { getTossShareLink, setClipboardText } = await import('@apps-in-toss/web-framework');
        const link = await getTossShareLink('intoss://life-clock');
        await setClipboardText(`${text}\n${link}`);
      } else {
        // 일반 웹: 현재 사이트 주소
        await navigator.clipboard.writeText(`${text}\n${window.location.origin}`);
      }
      showToast(lang === 'ko' ? '클립보드에 복사되었습니다!' : 'Copied to clipboard!');
    } catch (e) {
      console.error(e);
      showToast(lang === 'ko' ? '복사하지 못했어요. 다시 시도해주세요.' : 'Could not copy. Please try again.', false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-900 text-white">
      {/* 파도 배경: 입력 화면은 낮게, 결과 화면은 살아온 비율만큼 차오름 */}
      <WaveBackground level={showResult ? Math.max(lifeRatio, 0.08) : 0.12} />

      {/* 배경음악 on/off */}
      <BgmToggle lang={lang} suspended={isAdShowing} />

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-6">
        <h1 className={`font-dots text-4xl font-bold ${showResult ? 'mb-5' : 'mb-3'} bg-gradient-to-r from-amber-200 via-pink-200 to-sky-200 bg-clip-text text-transparent`}>Your life clock</h1>

        {/* 입력 화면 부제 */}
        {!showResult && (
          <p className="font-dots text-center text-sm sm:text-base leading-relaxed text-white/80 mb-6 animate-fade-in">
            {lang === 'ko' ? (
              <>생년월일을 입력하고<br />내 인생은 지금 몇 시를 지나고 있는지 알아봐요</>
            ) : (
              <>Enter your birthdate<br />and see what time your life is passing right now</>
            )}
          </p>
        )}

        {!showResult ? (
          <InputForm
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            lifeExpectancy={lifeExpectancy}
            setLifeExpectancy={setLifeExpectancy}
            setShowResult={setShowResult}
            lang={lang}
          />
        ) : (
          <div className="text-center animate-fade-in w-full max-w-4xl">
            <LifeClock lifeClock={lifeClock} />
            <LifeStats
              lifeRatio={lifeRatio}
              totalDays={totalDays}
              remainingDays={remainingDays}
              yearsLeft={yearsLeft}
              monthsLeft={monthsLeft}
              daysLeft={daysLeft}
              lang={lang}
            />
            
            <div className="mt-8 flex flex-col items-center gap-3">
              {/* 공유하기 버튼 */}
              <button
                onClick={handleShare}
                className="font-dots font-medium min-w-32 bg-gradient-to-r from-amber-200 to-pink-300 text-slate-900 px-4 py-2 rounded shadow-lg shadow-pink-500/20 hover:brightness-110 transition-all"
              >
                {lang === 'ko' ? '공유하기' : 'Share'}
              </button>

              {/* 다시 하기 버튼 + 광고 안내 */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => {
                    // 화면은 바로 입력 화면으로 바꾸고 그 위에 광고를 띄움 (광고가 닫혀도 흐름이 막히지 않게)
                    setShowResult(false);
                    showAd();
                  }}
                  className="font-dots min-w-32 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded hover:bg-white/20 transition-all"
                >
                  {lang === 'ko' ? '다시 하기' : 'Try again'}
                </button>
                {isInToss && (
                  <span className="font-dots text-xs text-white/50">
                    {lang === 'ko' ? '(광고가 나와요)' : '(Includes an ad)'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="relative z-10 pb-4">
        {showResult && randomQuote && <Quote quote={randomQuote} />}
        {!showResult && <Footer />}
      </div>

      {/* 안내 토스트: 화면 가운데에 크게 */}
      {toast && (
        <div className="fixed inset-0 z-30 flex items-center justify-center px-6 pointer-events-none">
          <div
            role="status"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-200 to-pink-300 text-slate-900 font-dots font-semibold text-lg shadow-2xl shadow-pink-500/40 animate-fade-in"
          >
            <span aria-hidden className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-amber-200 text-base">
              {toast.ok ? '✓' : '!'}
            </span>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
