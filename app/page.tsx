'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths, format } from 'date-fns';
import Swal from 'sweetalert2';

export default function Home() {
  const today = new Date();
  const [birthDate, setBirthDate] = useState(format(today, 'yyyy-MM-dd'));
  const [lifeExpectancy, setLifeExpectancy] = useState('80');
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


  const handleClick = () => {
    // 생년월일 입력했는지 검사
    if (!birthDate) {
      Swal.fire('Warning',
        lang === 'ko' ? '생년월일을 입력해주세요.'
          : 'Please select your birthday.', 'warning');
      return;
    }

    // 수명 입력했는지 검사
    if (!lifeExpectancy) {
      Swal.fire('Warning', lang === 'ko' ? '수명을 입력해주세요.(수명 범위 1~500)'
        : 'Please select your life expectancy', 'error');
      return;
    }

    // 생년월일을 미래로 입력하지 않았는지 검사
    if (birth > today) {
      Swal.fire('Error', lang === 'ko' ? '오늘 이후 날짜를 생일로 입력할 수 없습니다.'
        : 'Birthday cannot be in the future.', 'error');
      return;
    }

    // 수명을 1~500살 사이로 입력했는지 검사
    const expectancy = parseInt(lifeExpectancy);
    if (isNaN(expectancy) || expectancy < 1 || expectancy > 500) {
      Swal.fire('Error', lang === 'ko' ? '수명은 1~500살 사이로 입력해주세요.'
        : 'Life expectancy must be between 1 and 500.', 'error');
      return;
    }

    // 이미 수명 끝났는지 검사 ex)1900년생, 수명:50
    const deathDate = new Date(birthDate);
    deathDate.setFullYear(deathDate.getFullYear() + expectancy);
    if (today > deathDate) {
      Swal.fire('Error', lang === 'ko' ? '입력한 수명이 이미 초과되었습니다.'
        : 'The life expectancy you entered has already been exceeded.', 'error');
      return;
    }

    setShowResult(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">

      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <h1 className="font-dots text-4xl font-bold mb-5 text-sky-200">Your life clock</h1>

        {/** 입력 화면 */}
        {!showResult && (
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-md max-w-md w-full animate-fade-in">

            {/* 생일 입력 */}
            <label className="font-dots block text-gray-50 text-lg font-semibold mb-2 ">
              {lang === 'ko' ? '생년월일' : 'Your birthdate'}
            </label>
            <input type="date" value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max="9999-12-31"
              className="w-full p-2 mb-4 rounded border text-gray-50" />

            {/* 수명 입력 */}
            <label className="font-dots block text-lg text-gray-50 font-semibold mb-2">
              {lang === 'ko' ? '예상 수명' : 'Life expectancy'}
            </label>
            <input type="number" value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(e.target.value)}
              className="w-full p-2 mb-4 rounded border text-gray-50" />

            {/* 계산 버튼 */}
            <div className="flex justify-center">
              <button onClick={handleClick}
                className="font-dots font-medium bg-sky-200 text-slate-900 px-4 py-2 rounded hover:bg-sky-300 transition-all">
                {lang === 'ko' ? '나의 인생 시계 보기' : 'Show my life clock'}
              </button>
            </div>
          </div>
        )}

        {/** 결과 화면 */}
        {showResult && (
          <div className="text-center animate-fade-in w-full max-w-4xl">
            {/* 디지털 시계 */}
            <div className="text-6xl sm:text-9xl font-bold text-indigo-100 mt-8 mb-8 tracking-wide">
              {String(lifeClock.hour).padStart(2, '0')}:{/* 시 */}
              {String(lifeClock.min).padStart(2, '0')}:{/* 분 */}
              {String(lifeClock.sec).padStart(2, '0')}{/* 초 */}
              <span className="text-xl sm:text-4xl text-indigo-200">
                .{String(lifeClock.ms).padStart(3, '0')}{/* 밀리초 */}
              </span>
              <span className="text-sm sm:text-2xl text-indigo-300">
                .{String(lifeClock.us).padStart(3, '0')}{/* 유닛초 */}
              </span>
            </div>

            {/* 설명 태그 */}
            {lang === 'ko' ? <p className="font-dots text-lg mb-2 mt-5 text-gray-200">당신은 지금 인생의
              <span className="font-semibold text-sky-300"> {(lifeRatio * 100).toFixed(1)}% </span>
              를 살아왔습니다.
            </p> :
              <p className="text-lg mb-2 mt-5 text-gray-200">You have lived
                <span className="font-semibold text-sky-300"> {(lifeRatio * 100).toFixed(1)}% </span>
                of your life.
              </p>}

            {lang === 'ko' ? <p className="font-dots text-md text-gray-200">
              전체{" "}
              <span className="font-semibold">{totalDays.toLocaleString()}</span>일 중, 앞으로
              <span className="font-semibold text-sky-300 ml-1 ">
              {remainingDays.toLocaleString()}일 - {yearsLeft}년 {monthsLeft}개월 {daysLeft}일
              </span>
              이 남아있습니다.
            </p>
              : <p className="text-md text-gray-200">
                You have
                <span className="font-semibold text-sky-300 ml-1 ">
                  {remainingDays.toLocaleString()} days ({yearsLeft}y {monthsLeft}m {daysLeft}d)
                  left </span>
                { } out of { }
                <span className="font-semibold">{totalDays.toLocaleString()} </span>
                days in your life.
              </p>}


            {/* 계산식 설명 */}
            <div className="relative group mt-1 cursor-pointer w-fit mx-auto">
              <span className="text-xs text-gray-500 underline">ⓘ View calculation method</span>
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

      {/* 하단 명언 */}
      {showResult && randomQuote && (
        <p className="font-serif text-center text-sm text-gray-400 italic mt-4">
          “{randomQuote.text}” – {randomQuote.author}
        </p>
      )}

      {/* 메인 하단 저작권 */}
      {!showResult && (
        <footer className="text-center text-xs text-gray-500">
          © 2025 ssing. All rights reserved.
        </footer>
      )}
    </div>
  );
}
