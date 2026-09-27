'use client';

import { useCallback, useEffect, useRef } from 'react';

// 전면 광고 그룹 ID. 개발 중에는 반드시 테스트 ID를 써야 함(실제 ID로 테스트하면 정책 위반).
// TODO: 출시 전에 콘솔에서 발급한 전면형 광고 그룹 ID로 교체
const AD_GROUP_ID = 'ait-ad-test-interstitial-id';

type Sdk = typeof import('@apps-in-toss/web-framework');

interface Options {
  onAdOpen?: () => void; // 광고가 뜨기 직전 (배경음악 일시정지 등)
  onAdClose?: () => void; // 광고가 닫힌 뒤 (배경음악 재개 등)
}

// 토스 앱 전면 광고: 미리 로드해두고 showAd로 띄움. 토스 앱 밖(웹)이나 광고가 준비 안 됐으면 아무것도 안 함.
export default function useInterstitialAd({ onAdOpen, onAdClose }: Options = {}) {
  const sdkRef = useRef<Sdk | null>(null);
  const loadedRef = useRef(false);
  const unregisterLoadRef = useRef<() => void>(undefined);
  const callbacksRef = useRef({ onAdOpen, onAdClose });
  callbacksRef.current = { onAdOpen, onAdClose };

  // 다음 광고 미리 로드 (load → show → load 순서)
  const load = useCallback(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;
    loadedRef.current = false;
    unregisterLoadRef.current?.();
    unregisterLoadRef.current = sdk.loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') loadedRef.current = true;
      },
      onError: (error) => console.error('광고 로드 실패:', error),
    });
  }, []);

  useEffect(() => {
    if (!('ReactNativeWebView' in window)) return;
    let cancelled = false;

    // 웹 빌드에서는 SDK를 불러오지 않도록 동적 import
    import('@apps-in-toss/web-framework')
      .then((sdk) => {
        if (cancelled || !sdk.loadFullScreenAd.isSupported()) return;
        sdkRef.current = sdk;
        load();
      })
      .catch((error) => console.error(error));

    return () => {
      cancelled = true;
      unregisterLoadRef.current?.();
    };
  }, [load]);

  // 광고를 띄우고, 닫히면 onClosed 호출. 광고를 못 띄우면 바로 호출.
  const showAd = useCallback((onClosed?: () => void) => {
    const sdk = sdkRef.current;
    if (!sdk || !loadedRef.current) {
      onClosed?.();
      return;
    }
    loadedRef.current = false;
    callbacksRef.current.onAdOpen?.();

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      callbacksRef.current.onAdClose?.();
      onClosed?.();
      load();
    };

    sdk.showFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'dismissed' || event.type === 'failedToShow') finish();
      },
      onError: (error) => {
        console.error('광고 표시 실패:', error);
        finish();
      },
    });
  }, [load]);

  return showAd;
}
