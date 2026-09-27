interface LifeStatsProps {
  lifeRatio: number;
  totalDays: number;
  remainingDays: number;
  yearsLeft: number;
  monthsLeft: number;
  daysLeft: number;
  lang: string;
}

export default function LifeStats({
  lifeRatio,
  totalDays,
  remainingDays,
  yearsLeft,
  monthsLeft,
  daysLeft,
  lang
}: LifeStatsProps) {
  return (
    <>
      {lang === 'ko' ? (
        <p className="font-dots text-lg mb-2 mt-5 text-gray-50 drop-shadow-[0_1px_6px_rgba(15,23,42,0.7)]">
          당신은 지금 인생의
          <span className="font-semibold text-amber-200"> {(lifeRatio * 100).toFixed(1)}% </span>
          를 살아왔습니다.
        </p>
      ) : (
        <p className="text-lg mb-2 mt-5 text-gray-50 drop-shadow-[0_1px_6px_rgba(15,23,42,0.7)]">
          You have lived
          <span className="font-semibold text-amber-200"> {(lifeRatio * 100).toFixed(1)}% </span>
          of your life.
        </p>
      )}

      {lang === 'ko' ? (
        <p className="font-dots text-md leading-relaxed text-gray-50 drop-shadow-[0_1px_6px_rgba(15,23,42,0.7)]">
          전체 <span className="font-semibold">{totalDays.toLocaleString()}</span>일 중,
          <br />
          앞으로
          <span className="font-semibold text-amber-200 ml-1">
            {remainingDays.toLocaleString()}일 ({yearsLeft}년 {monthsLeft}개월 {daysLeft}일)
          </span>
          이 남아있습니다.
        </p>
      ) : (
        <p className="text-md leading-relaxed text-gray-50 drop-shadow-[0_1px_6px_rgba(15,23,42,0.7)]">
          Out of <span className="font-semibold">{totalDays.toLocaleString()}</span> days in your life,
          <br />
          you have
          <span className="font-semibold text-amber-200 mx-1">
            {remainingDays.toLocaleString()} days ({yearsLeft}y {monthsLeft}m {daysLeft}d)
          </span>
          left.
        </p>
      )}
    </>
  );
}
