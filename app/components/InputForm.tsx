import { Dispatch, SetStateAction, useRef, useState } from 'react';

interface InputFormProps {
  birthDate: string;
  setBirthDate: Dispatch<SetStateAction<string>>;
  lifeExpectancy: string;
  setLifeExpectancy: Dispatch<SetStateAction<string>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
  lang: string;
}

// 예상 수명 슬라이더 범위
const MIN_LIFE = 60;
const MAX_LIFE = 120;

// 숫자만 남기고 최대 길이로 자름
const onlyDigits = (value: string, maxLength: number) => value.replace(/\D/g, '').slice(0, maxLength);

export default function InputForm({
  birthDate,
  setBirthDate,
  lifeExpectancy,
  setLifeExpectancy,
  setShowResult,
  lang
}: InputFormProps) {
  // 이전에 입력한 생년월일이 있으면(다시 하기) 칸에 채워둠
  const [initYear = '', initMonth = '', initDay = ''] = birthDate ? birthDate.split('-') : [];
  const [year, setYear] = useState(initYear);
  const [month, setMonth] = useState(initMonth);
  const [day, setDay] = useState(initDay);
  const [error, setError] = useState('');
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  const handleYear = (value: string) => {
    const v = onlyDigits(value, 4);
    setYear(v);
    setError('');
    if (v.length === 4) monthRef.current?.focus();
  };

  const handleMonth = (value: string) => {
    const v = onlyDigits(value, 2);
    setMonth(v);
    setError('');
    // 두 자리를 채웠거나 2~9처럼 뒤에 올 숫자가 없으면 일 칸으로 이동
    if (v.length === 2 || (v.length === 1 && Number(v) > 1)) dayRef.current?.focus();
  };

  const handleDay = (value: string) => {
    setDay(onlyDigits(value, 2));
    setError('');
  };

  const handleClick = () => {
    const today = new Date();
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);

    // 생년월일을 모두 입력했는지 검사
    if (year.length !== 4 || !month || !day) {
      setError(lang === 'ko' ? '생년월일을 모두 입력해주세요. (예: 1995 03 15)' : 'Please fill in your full birthdate. (e.g. 1995 03 15)');
      return;
    }

    // 실제로 있는 날짜인지 검사 (2월 30일 등)
    const lastDay = new Date(y, m, 0).getDate();
    if (y < 1900 || m < 1 || m > 12 || d < 1 || d > lastDay) {
      setError(lang === 'ko' ? '올바른 날짜를 입력해주세요.' : 'Please enter a valid date.');
      return;
    }

    const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const birth = new Date(dateString);

    // 생년월일을 미래로 입력하지 않았는지 검사
    if (birth > today) {
      setError(lang === 'ko' ? '오늘 이후 날짜를 생일로 입력할 수 없어요.' : 'Birthday cannot be in the future.');
      return;
    }

    // 이미 수명 끝났는지 검사
    const deathDate = new Date(birth);
    deathDate.setFullYear(deathDate.getFullYear() + parseInt(lifeExpectancy));
    if (today > deathDate) {
      setError(lang === 'ko' ? '예상 수명을 지금 나이보다 높게 설정해주세요.' : 'Please set a life expectancy higher than your current age.');
      return;
    }

    setBirthDate(dateString);
    setShowResult(true);
  };

  const fieldClass =
    'w-full p-2 rounded border border-white/20 bg-white/5 text-gray-50 text-center text-lg placeholder:text-white/40 focus:outline-none focus:border-sky-300';

  return (
    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-md max-w-md w-full animate-fade-in">
      {/* 생일 입력: 년/월/일 칸을 나눠 숫자 키패드로 입력 */}
      <label htmlFor="birth-year" className="font-dots block text-gray-50 text-lg font-semibold mb-2">
        {lang === 'ko' ? '생년월일' : 'Your birthdate'}
      </label>
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 mb-5">
        <input
          id="birth-year"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="bday-year"
          maxLength={4}
          value={year}
          onChange={(e) => handleYear(e.target.value)}
          placeholder={lang === 'ko' ? '연도' : 'YYYY'}
          aria-label={lang === 'ko' ? '연도' : 'Year'}
          className={fieldClass}
        />
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="bday-month"
          maxLength={2}
          value={month}
          onChange={(e) => handleMonth(e.target.value)}
          placeholder={lang === 'ko' ? '월' : 'MM'}
          aria-label={lang === 'ko' ? '월' : 'Month'}
          className={fieldClass}
        />
        <input
          ref={dayRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="bday-day"
          maxLength={2}
          value={day}
          onChange={(e) => handleDay(e.target.value)}
          placeholder={lang === 'ko' ? '일' : 'DD'}
          aria-label={lang === 'ko' ? '일' : 'Day'}
          className={fieldClass}
        />
      </div>

      {/* 수명 입력: 60~120세 슬라이더 */}
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor="life-expectancy" className="font-dots text-lg text-gray-50 font-semibold">
          {lang === 'ko' ? '예상 수명' : 'Life expectancy'}
        </label>
        <span className="font-dots text-lg font-semibold text-amber-200">
          {lang === 'ko' ? `${lifeExpectancy}세` : `${lifeExpectancy} yrs`}
        </span>
      </div>
      <input
        id="life-expectancy"
        type="range"
        min={MIN_LIFE}
        max={MAX_LIFE}
        step={1}
        value={lifeExpectancy}
        onChange={(e) => {
          setLifeExpectancy(e.target.value);
          setError('');
        }}
        className="w-full h-6 accent-amber-300 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-white/50 mb-4">
        <span>{MIN_LIFE}</span>
        <span>{MAX_LIFE}</span>
      </div>

      {/* 입력 오류 안내 */}
      {error && <p role="alert" className="text-sm text-rose-200 text-center mb-3">{error}</p>}

      {/* 계산 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={handleClick}
          className="font-dots font-medium bg-gradient-to-r from-amber-200 to-pink-300 text-slate-900 px-4 py-2 rounded shadow-lg shadow-pink-500/20 hover:brightness-110 transition-all"
        >
          {lang === 'ko' ? '나의 인생 시계 보기' : 'Show my life clock'}
        </button>
      </div>
    </div>
  );
}
