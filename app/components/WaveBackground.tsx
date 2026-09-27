interface WaveBackgroundProps {
  level: number; // 수위 (0~1, 화면 높이 대비)
  theme?: 'night' | 'sunset';
}

// 파도 한 겹: 폭 200%에 파형 2주기를 그려두고 -50%만큼 이동시키면 끊김 없이 반복됨
const WAVE_PATH = 'M0 60 Q360 0 720 60 T1440 60 T2160 60 T2880 60 V120 H0 Z';

interface WaveLayer {
  id: string;
  color: string;
  opacity: number;
  duration: string;
  reverse: boolean;
  offset: string;
  fade: boolean; // 아래로 갈수록 투명해지게 (뒤쪽 겹과 물 본체의 이음새 방지)
}

interface Palette {
  skies: string[]; // 하늘 그라데이션. 2개면 천천히 교차 페이드
  blobs: [string, string]; // 떠다니는 글로우 색 (Tailwind 클래스)
  waves: WaveLayer[];
  body: string; // 물 본체. 맨 위 색은 맨 앞 파도와 같은 hex여야 이음새가 안 생김
  sun: boolean;
}

const PALETTES: Record<'night' | 'sunset', Palette> = {
  // 밤바다: slate-900 + sky/indigo
  night: {
    skies: [],
    blobs: ['bg-sky-500/10', 'bg-indigo-500/10'],
    waves: [
      { id: 'night-back', color: '#818cf8', opacity: 0.25, duration: '19s', reverse: true, offset: '-1.5rem', fade: true },
      { id: 'night-mid', color: '#7dd3fc', opacity: 0.2, duration: '13s', reverse: false, offset: '-0.75rem', fade: true },
      { id: 'night-front', color: '#38bdf8', opacity: 0.18, duration: '8s', reverse: true, offset: '0rem', fade: false },
    ],
    body: 'linear-gradient(to bottom, rgba(56,189,248,0.18), rgba(79,70,229,0.3))',
    sun: false,
  },
  // 노을: 위는 어두운 남색, 수평선 쪽으로 보라→분홍→주황. 해가 수면에 걸쳐 있음
  sunset: {
    skies: [
      'linear-gradient(to bottom, #0b1026 0%, #1e1b4b 30%, #4c1d95 55%, #be185d 78%, #f97316 100%)',
      'linear-gradient(to bottom, #0f172a 0%, #312e81 32%, #7e22ce 58%, #db2777 80%, #fbbf24 100%)',
    ],
    blobs: ['bg-fuchsia-500/20', 'bg-amber-400/15'],
    waves: [
      { id: 'sunset-back', color: '#f472b6', opacity: 0.4, duration: '19s', reverse: true, offset: '-1.5rem', fade: true },
      { id: 'sunset-mid', color: '#a855f7', opacity: 0.45, duration: '13s', reverse: false, offset: '-0.75rem', fade: true },
      { id: 'sunset-front', color: '#312e81', opacity: 1, duration: '8s', reverse: true, offset: '0rem', fade: false },
    ],
    body: 'linear-gradient(to bottom, #312e81, #0b1026)', // 불투명: 물에 잠긴 해가 비치지 않게
    sun: true,
  },
};

// 해 아래 수면에 반짝이는 빛줄기(윤슬): [top(px), 폭(%), 지연(s)]
const SHIMMERS: [number, number, number][] = [
  [8, 24, 0], [20, 32, 0.8], [34, 20, 1.6], [50, 14, 0.4],
];

export default function WaveBackground({ level, theme = 'sunset' }: WaveBackgroundProps) {
  const clamped = Math.min(Math.max(level, 0), 1);
  const palette = PALETTES[theme];

  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 하늘: 두 번째 그라데이션이 천천히 나타났다 사라지며 색이 변함 */}
      {palette.skies.map((sky, i) => (
        <div
          key={i}
          className={`absolute inset-0 ${i > 0 ? 'opacity-0 motion-safe:animate-sky-shift' : ''}`}
          style={{ background: sky }}
        />
      ))}

      {/* 배경 글로우: 천천히 떠다니는 흐릿한 빛 */}
      <div className={`absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full blur-3xl motion-safe:animate-drift ${palette.blobs[0]}`} />
      <div
        className={`absolute top-1/4 -right-48 w-[32rem] h-[32rem] rounded-full blur-3xl motion-safe:animate-drift ${palette.blobs[1]}`}
        style={{ animationDelay: '-12s', animationDuration: '32s' }}
      />

      {/* 물: 높이 = 살아온 비율 */}
      <div
        className="absolute inset-x-0 bottom-0 transition-[height] duration-[2500ms] ease-out motion-reduce:transition-none"
        style={{ height: `${clamped * 100}%` }}
      >
        {/* 해: 수면에 반쯤 걸쳐서 수위와 함께 올라감 */}
        {palette.sun && (
          <div
            className="absolute left-1/2 bottom-full w-40 h-40 sm:w-60 sm:h-60 -translate-x-1/2 translate-y-1/2 rounded-full motion-safe:animate-glow"
            style={{
              background: 'radial-gradient(circle, #fef3c7 0%, #fde68a 25%, #fb923c 55%, rgba(244,63,94,0) 72%)',
              boxShadow: '0 0 140px 60px rgba(251,146,60,0.25)',
            }}
          />
        )}

        {/* 수면 위 파도 */}
        {palette.waves.map((layer) => (
          <div
            key={layer.id}
            className="absolute inset-x-0 bottom-full h-16 sm:h-24 overflow-hidden"
            style={{ transform: `translateY(${layer.offset})` }}
          >
            <svg
              className={`h-full w-[200%] ${layer.reverse ? 'motion-safe:animate-wave-reverse' : 'motion-safe:animate-wave'}`}
              style={{ animationDuration: layer.duration }}
              viewBox="0 0 2880 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={layer.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={layer.color} stopOpacity={layer.opacity} />
                  <stop offset="100%" stopColor={layer.color} stopOpacity={layer.fade ? 0 : layer.opacity} />
                </linearGradient>
              </defs>
              <path d={WAVE_PATH} fill={`url(#${layer.id})`} />
            </svg>
          </div>
        ))}

        {/* 물 본체 (Tailwind v4 색상은 oklch라 SVG hex와 달라 이음새가 생김 → hex로 직접 지정)
            위로 2px 늘려 맨 앞 파도와 겹치게 함: 딱 맞붙이면 서브픽셀 반올림으로 가는 틈이 보임 */}
        <div className="absolute inset-x-0 bottom-0 -top-0.5" style={{ background: palette.body }} />

        {/* 윤슬 */}
        {palette.sun &&
          SHIMMERS.map(([top, width, delay]) => (
            <div
              key={top}
              className="absolute left-1/2 -translate-x-1/2 h-[2px] rounded-full blur-[1px] bg-gradient-to-r from-transparent via-amber-200/70 to-transparent motion-safe:animate-shimmer"
              style={{ top, width: `${width}%`, maxWidth: '18rem', animationDelay: `${delay}s` }}
            />
          ))}
      </div>
    </div>
  );
}
