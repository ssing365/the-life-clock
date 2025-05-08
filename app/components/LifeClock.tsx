interface LifeClockProps {
  lifeClock: {
    hour: number;
    min: number;
    sec: number;
    ms: number;
    us: number;
  };
}

export default function LifeClock({ lifeClock }: LifeClockProps) {
  return (
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
  );
} 