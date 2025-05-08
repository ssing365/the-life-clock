'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths, format } from 'date-fns';
import InputForm from './components/InputForm';
import LifeClock from './components/LifeClock';
import LifeStats from './components/LifeStats';
import Quote from './components/Quote';
import Footer from './components/Footer';

export default function Home() {
  const today = new Date();
  const [birthDate, setBirthDate] = useState(format(today, 'yyyy-MM-dd'));
  const [lifeExpectancy, setLifeExpectancy] = useState('100');
  const [showResult, setShowResult] = useState(false);
  const [lifeClock, setLifeClock] = useState({ hour: 0, min: 0, sec: 0, ms: 0, us: 0 });
  const requestRef = useRef<number>(0);
  const [lang, setLang] = useState('en');

  // 컴포넌트 시작할 때 사용자 브라우저 언어 감지
  useEffect(() => {
    const userLang = navigator.language || navigator.languages[0];
    if (userLang.startsWith('ko')) {
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
  
  // 📌 Calculation info : 인생시계 1분 = 며칠?
  const lifeMinuteToDays = totalDays / (24 * 60);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <h1 className="font-dots text-4xl font-bold mb-5 text-sky-200">Your life clock</h1>

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
              lifeMinuteToDays={lifeMinuteToDays}
              lang={lang}
            />
            
            {/* 뒤로가기 버튼 */}
            <button
              onClick={() => setShowResult(false)}
              className="mt-8 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Go Back
            </button>
          </div>
        )}
      </main>

      {showResult && randomQuote && <Quote quote={randomQuote} />}
      {!showResult && <Footer />}
    </div>
  );
}
