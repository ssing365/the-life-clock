'use client';

import { useEffect, useRef, useState } from 'react';

// 배너 광고 그룹 ID (콘솔 광고 지면 '결과 화면 배너광고', 문구 강조형).
// 실제 ID로 테스트 번들에서 광고를 반복 노출·클릭하면 정책 위반이므로, 개발 중에는 테스트 ID('ait-ad-test-banner-id')로 바꿔서 확인할 것
const AD_GROUP_ID = 'ait.v2.live.6ac747300f8f4126';

type Sdk = typeof import('@apps-in-toss/web-framework');

// TossAds.initialize는 앱 전체에서 한 번만 호출해야 해서 모듈 단위로 공유
let initPromise: Promise<Sdk | null> | null = null;

function initTossAds(): Promise<Sdk | null> {
  if (!initPromise) {
    // 웹 빌드에서는 SDK를 불러오지 않도록 동적 import
    initPromise = import('@apps-in-toss/web-framework')
      .then(
        (sdk) =>
          new Promise<Sdk | null>((resolve) => {
            // 토스 앱 5.241.0 미만 등 배너를 지원하지 않는 환경이면 아무것도 안 함
            if (!sdk.TossAds.initialize.isSupported() || !sdk.TossAds.attachBanner.isSupported()) {
              resolve(null);
              return;
            }
            sdk.TossAds.initialize({
              callbacks: {
                onInitialized: () => resolve(sdk),
                onInitializationFailed: (error) => {
                  console.error('배너 광고 초기화 실패:', error);
                  resolve(null);
                },
              },
            });
          }),
      )
      .catch((error) => {
        console.error(error);
        return null;
      });
  }
  return initPromise;
}

// 토스 앱 배너 광고. 토스 앱 밖(웹)이거나 광고가 없으면 자리를 차지하지 않음
export default function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!('ReactNativeWebView' in window)) return;
    let cancelled = false;
    let destroy: (() => void) | undefined;

    setVisible(true);
    initTossAds().then((sdk) => {
      if (cancelled) return;
      if (!sdk || !containerRef.current) {
        setVisible(false);
        return;
      }
      destroy = sdk.TossAds.attachBanner(AD_GROUP_ID, containerRef.current, {
        theme: 'dark',
        variant: 'card',
        callbacks: {
          onNoFill: () => setVisible(false),
          onAdFailedToRender: (payload) => {
            console.error('배너 광고 렌더링 실패:', payload.error.message);
            setVisible(false);
          },
        },
      }).destroy;
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  // 광고 컨테이너는 비워두고 너비는 화면 전체, 높이는 96px (가이드 권장).
  // 버튼 바로 옆에 붙으면 잘못 누르기 쉬워 정책 위반이므로 위쪽에 간격을 둠
  return <div ref={containerRef} className={visible ? 'w-full h-24 mt-6' : 'hidden'} />;
}
