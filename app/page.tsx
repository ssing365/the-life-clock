'use client';

import { useState, useEffect, useRef } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths, format } from 'date-fns';

export default function Home() {
  const today = new Date();
  const [birthDate, setBirthDate] = useState(format(today, 'yyyy-MM-dd'));
  const [lifeExpectancy, setLifeExpectancy] = useState('80');
  const [showResult, setShowResult] = useState(false);
  const [lifeClock, setLifeClock] = useState({ hour: 0, min: 0, sec: 0, ms: 0, us: 0 });
  const requestRef = useRef<number>(0);

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
    const us = Math.floor((msInLife * 1000) % 1000); // microsecond(마이크로초) 비슷하게

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
  const lifeMinuteToDays = totalDays / (24 * 60); // 하루 = 24시간 * 60분

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-4xl font-bold mb-6 text-purple-300">Your Life Clock</h1>

      {/** 입력 화면 */}
      {!showResult && (
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-md max-w-md w-full animate-fade-in">
          
          {/* 생일 입력 */}
          <label className="block white text-lg mb-2">
            When is your birthday?
          </label>
          <input type="date" value={birthDate} 
            onChange={(e) => setBirthDate(e.target.value)} 
            className="w-full p-2 mb-4 rounded border text-white" />

          {/* 수명 입력 */}
          <label className="block text-lg mb-2">
            Life Expectancy (years)
          </label>
          <input type="number" value={lifeExpectancy} 
            onChange={(e) => setLifeExpectancy(e.target.value)} 
            className="w-full p-2 mb-4 rounded border text-white" />

          {/* 계산 버튼 */}
          <button onClick={() => setShowResult(true)} 
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-all">
            Calculate
          </button>
        </div>
      )}

      {/** 결과 화면 */}
      {showResult && (
        <div className="text-center animate-fade-in w-full max-w-4xl">
          
          {/* 디지털 시계 */}
          <div className="text-6xl sm:text-8xl font-bold text-green-400 mb-2 tracking-wide">
            {String(lifeClock.hour).padStart(2, '0')}:{/* 시 */}
            {String(lifeClock.min).padStart(2, '0')}:{/* 분 */}
            {String(lifeClock.sec).padStart(2, '0')}{/* 초 */}
            <span className="text-xl sm:text-4xl text-green-300">
            .{String(lifeClock.ms).padStart(3, '0')}{/* 밀리초 */}
            </span>
            <span className="text-sm sm:text-2xl text-green-200">
            .{String(lifeClock.us).padStart(3, '0')}{/* 유닛초 */}
            </span>
          </div>

          {/* 설명 태그 */}
          <p className="text-lg mb-2 text-gray-300">⏳ You have lived 
            <span className="font-semibold text-purple-300"> {(lifeRatio * 100).toFixed(1)}% </span> 
            of your life.
          </p>
          <p className="text-md text-gray-300">
            You have
            <span className="font-semibold text-purple-300 ml-1 ">
              {remainingDays.toLocaleString()} days ({yearsLeft}y {monthsLeft}m {daysLeft}d)
            </span> left
            <br />out of {}
            <span className="font-semibold">{totalDays.toLocaleString()} </span> 
            days in your life.
          </p>

          {/* 계산식 설명 */}
          <div className="relative group mt-1 cursor-pointer w-fit mx-auto">
            <span className="text-xs text-gray-500 underline decoration-dotted">ⓘ View calculation method</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-3 py-2 w-64 shadow-lg z-10">
              Calculated as of {format(today, 'yyyy-MM-dd')}<br />
              1 year = 365 days<br />
              ⏱ 1 minute in your life clock ≈ {lifeMinuteToDays.toFixed(2)} days
            </div>
          </div>

          {/* 뒤로가기 버튼 */}
          <button onClick={() => setShowResult(false)} className="mt-8 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
            Go Back
          </button>
        </div>
      )}
    </main>
  );
}
