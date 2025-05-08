import { format } from 'date-fns';

interface LifeStatsProps {
  lifeRatio: number;
  totalDays: number;
  remainingDays: number;
  yearsLeft: number;
  monthsLeft: number;
  daysLeft: number;
  lifeMinuteToDays: number;
  lang: string;
}

export default function LifeStats({
  lifeRatio,
  totalDays,
  remainingDays,
  yearsLeft,
  monthsLeft,
  daysLeft,
  lifeMinuteToDays,
  lang
}: LifeStatsProps) {
  const today = new Date();

  return (
    <>
      {lang === 'ko' ? (
        <p className="font-dots text-lg mb-2 mt-5 text-gray-200">
          당신은 지금 인생의
          <span className="font-semibold text-sky-300"> {(lifeRatio * 100).toFixed(1)}% </span>
          를 살아왔습니다.
        </p>
      ) : (
        <p className="text-lg mb-2 mt-5 text-gray-200">
          You have lived
          <span className="font-semibold text-sky-300"> {(lifeRatio * 100).toFixed(1)}% </span>
          of your life.
        </p>
      )}

      {lang === 'ko' ? (
        <p className="font-dots text-md text-gray-200">
          전체{" "}
          <span className="font-semibold">{totalDays.toLocaleString()}</span>일 중, 앞으로
          <span className="font-semibold text-sky-300 ml-1 ">
            {remainingDays.toLocaleString()}일 - {yearsLeft}년 {monthsLeft}개월 {daysLeft}일
          </span>
          이 남아있습니다.
        </p>
      ) : (
        <p className="text-md text-gray-200">
          You have
          <span className="font-semibold text-sky-300 ml-1 ">
            {remainingDays.toLocaleString()} days ({yearsLeft}y {monthsLeft}m {daysLeft}d)
            left </span>
          out of
          <span className="font-semibold">{totalDays.toLocaleString()} </span>
          days in your life.
        </p>
      )}

      {/* 계산식 설명 */}
      <div className="relative group mt-1 cursor-pointer w-fit mx-auto">
        <span className="text-xs text-gray-500 underline">ⓘ View calculation method</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-3 py-2 w-64 shadow-lg z-10">
          Calculated as of {format(today, 'yyyy-MM-dd')}<br />
          1 year = 365 days<br />
          ⏱ 1 minute in your life clock ≈ {lifeMinuteToDays.toFixed(2)} days
        </div>
      </div>
    </>
  );
} 