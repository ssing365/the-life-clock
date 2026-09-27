'use client';

import { useEffect, useRef, useState } from 'react';

type BgmToggleProps = {
  lang: string;
  suspended?: boolean; // true인 동안 잠시 멈춤 (전면 광고 재생 중). 끝나면 켜져 있던 경우에만 다시 재생
};

// 배경음악 on/off 버튼 (화면 우측 상단 고정)
// 접속 즉시 재생을 시도하고, 브라우저 자동재생 정책으로 막히면 첫 사용자 입력(클릭/터치/키) 때 재생합니다.
export default function BgmToggle({ lang, suspended = false }: BgmToggleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 아이콘은 실제 재생 상태를 따름
  const [isPlaying, setIsPlaying] = useState(false);
  // 사용자가 직접 끄면 false → 자동 재생 시도 중단
  const wantsPlayRef = useRef(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    const removeUnlock = () => events.forEach((e) => window.removeEventListener(e, unlock));

    // 자동재생이 막혔을 때 첫 사용자 입력에서 재생 (버튼 클릭은 toggle에서 처리)
    function unlock(e: Event) {
      if (buttonRef.current?.contains(e.target as Node)) return;
      removeUnlock();
      if (wantsPlayRef.current) audio!.play().catch(() => {});
    }

    audio.play().catch(() => {
      events.forEach((e) => window.addEventListener(e, unlock));
    });

    return () => {
      removeUnlock();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  // 광고 재생 중 일시정지 → 광고가 닫히면 재개
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (suspended) audio.pause();
    else if (wantsPlayRef.current && audio.paused && audio.played.length > 0) audio.play().catch(() => {});
  }, [suspended]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      wantsPlayRef.current = false;
      audio.pause();
    } else {
      wantsPlayRef.current = true;
      // 재생 실패(파일 없음 등) 시 꺼진 상태 유지
      audio.play().catch(() => {});
    }
  };

  const label = isPlaying
    ? (lang === 'ko' ? '배경음악 끄기' : 'Mute music')
    : (lang === 'ko' ? '배경음악 켜기' : 'Play music');

  return (
    <>
      <audio ref={audioRef} src="/audio/main-bgm.mp3" loop preload="auto" />
      <button
        ref={buttonRef}
        onClick={toggle}
        aria-label={label}
        title={label}
        className="fixed top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isPlaying ? '/icons/volume.svg' : '/icons/volume-xmark.svg'}
          alt=""
          className="w-5 h-5 invert"
        />
      </button>
    </>
  );
}
