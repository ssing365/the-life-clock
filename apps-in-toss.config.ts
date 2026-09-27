import { defineConfig } from '@apps-in-toss/web-framework/config';

// 앱인토스 미니앱 설정 (SDK 3.x). appName은 콘솔에 등록한 값과 같아야 합니다.
export default defineConfig({
  appName: 'life-clock',
  brand: {
    primaryColor: '#F59E0B',
  },
  // 배경이 어두운 노을 테마라 내비게이션 바도 어두운 테마로 맞춤
  navigationBar: {
    theme: 'dark',
  },
  webView: {},
  // 공유하기: 클립보드에 공유 문구 복사
  permissions: [{ name: 'clipboard', access: 'write' }],
  // next.config.ts의 output: 'export' 결과물
  webBundleDir: 'out',
});
