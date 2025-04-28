'use client';

import { useState, useEffect, useRef } from 'react';
import { differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths, format } from 'date-fns';
import Swal from 'sweetalert2';

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


  const handleClick = () => {
    // 생년월일 입력했는지 검사
    if (!birthDate) {
      Swal.fire('Warning', 'Please select your birthday.<br/>생년월일을 입력해주세요.', 'warning');
      return;
    }

    // 수명 입력했는지 검사
    if (!lifeExpectancy) {
      Swal.fire('Warning', 'Please select your life expectancy<br/>수명을 입력해주세요.(수명 범위 1~500)', 'error');
      return;
    }

    // 생년월일을 미래로 입력하지 않았는지 검사
    if (birth > today) {
      Swal.fire('Error', 'Birthday cannot be in the future.<br/>오늘 이후 날짜를 생일로 입력할 수 없습니다.', 'error');
      return;
    }

    // 수명을 1~500살 사이로 입력했는지 검사
    const expectancy = parseInt(lifeExpectancy);
    if (isNaN(expectancy) || expectancy < 1 || expectancy > 500) {
      Swal.fire('Error', 'Life expectancy must be between 1 and 500.<br/>수명은 1~500살 사이로 입력해주세요.', 'error');
      return;
    }

    // 이미 수명 끝났는지 검사 ex)1900년생, 수명:50
    const deathDate = new Date(birthDate);
    deathDate.setFullYear(deathDate.getFullYear() + expectancy);
    if (today > deathDate) {
      Swal.fire('Error', 'The life expectancy you entered has already been exceeded.<br/>입력한 수명이 이미 초과되었습니다.', 'error');
      return;
    }

    setShowResult(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">

      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-8 text-sky-200">Your Life Clock</h1>

        {/** 입력 화면 */}
        {!showResult && (
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-md max-w-md w-full animate-fade-in">

            {/* 생일 입력 */}
            <label className="block text-gray-50 text-lg font-semibold mb-2 ">
              Your birthdate
            </label>
            <input type="date" value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max = "9999-12-31"
              className="w-full p-2 mb-4 rounded border text-gray-50" />

            {/* 수명 입력 */}
            <label className="block text-lg text-gray-50 font-semibold mb-2">
              Life expectancy
            </label>
            <input type="number" value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(e.target.value)}
              className="w-full p-2 mb-4 rounded border text-gray-50" />

            {/* 계산 버튼 */}
            <div className="flex justify-center">
              <button onClick={handleClick}
                className="bg-sky-200 text-slate-900 px-4 py-2 rounded hover:bg-sky-300 transition-all">
                Show my life clock
              </button>
            </div>
          </div>
        )}

        {/** 결과 화면 */}
        {showResult && (
          <div className="text-center animate-fade-in w-full max-w-4xl">

            {/* 디지털 시계 */}
            <div className="text-6xl sm:text-9xl font-bold text-indigo-100 mb-8 tracking-wide">
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
            <p className="text-lg mb-2 mt-5 text-gray-200">You have lived
              <span className="font-semibold text-sky-300"> {(lifeRatio * 100).toFixed(1)}% </span>
              of your life.
            </p>
            <p className="text-md text-gray-200">
              You have
              <span className="font-semibold text-sky-300 ml-1 ">
                {remainingDays.toLocaleString()} days ({yearsLeft}y {monthsLeft}m {daysLeft}d)
                left </span>
              { } out of { }
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
      <footer className="text-center text-xs text-gray-500">
        © 2025 ssing. All rights reserved.
      </footer>
    </div>
  );
}
