import { Dispatch, SetStateAction } from 'react';
import Swal from 'sweetalert2';

interface InputFormProps {
  birthDate: string;
  setBirthDate: Dispatch<SetStateAction<string>>;
  lifeExpectancy: string;
  setLifeExpectancy: Dispatch<SetStateAction<string>>;
  setShowResult: Dispatch<SetStateAction<boolean>>;
  lang: string;
}

export default function InputForm({
  birthDate,
  setBirthDate,
  lifeExpectancy,
  setLifeExpectancy,
  setShowResult,
  lang
}: InputFormProps) {
  const today = new Date();

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

    const birth = new Date(birthDate);

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

    // 이미 수명 끝났는지 검사
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
    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl shadow-md max-w-md w-full animate-fade-in">
      {/* 생일 입력 */}
      <label className="font-dots block text-gray-50 text-lg font-semibold mb-2 ">
        {lang === 'ko' ? '생년월일' : 'Your birthdate'}
      </label>
      <input
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        max="9999-12-31"
        className="w-full p-2 mb-4 rounded border text-gray-50"
      />

      {/* 수명 입력 */}
      <label className="font-dots block text-lg text-gray-50 font-semibold mb-2">
        {lang === 'ko' ? '예상 수명' : 'Life expectancy'}
      </label>
      <input
        type="number"
        value={lifeExpectancy}
        onChange={(e) => setLifeExpectancy(e.target.value)}
        className="w-full p-2 mb-4 rounded border text-gray-50"
        autoComplete="off"
        placeholder={lang === 'ko' ? '예상 수명을 입력하세요' : 'Enter your life expectancy'}
      />

      {/* 계산 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={handleClick}
          className="font-dots font-medium bg-sky-200 text-slate-900 px-4 py-2 rounded hover:bg-sky-300 transition-all"
        >
          {lang === 'ko' ? '나의 인생 시계 보기' : 'Show my life clock'}
        </button>
      </div>
    </div>
  );
} 