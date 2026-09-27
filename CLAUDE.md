# CLAUDE.md

This file gives Claude Code guidance for working in this repository.

## 프로젝트 개요

**Life Clock**: 사용자의 인생을 24시간으로 환산해 보여주는 단일 페이지 웹앱입니다. 생년월일과 예상 수명(기본 100살)을 입력하면 현재 "인생 시각"(시:분:초.밀리초.마이크로초), 살아온 비율, 남은 일수를 실시간으로 표시합니다.

- 브라우저 언어(`navigator.language`)가 `ko`로 시작하면 한국어로, 그 외에는 영어로 표시합니다.
- Google Analytics(`G-0RBX1TWD8N`)는 production 빌드에서만 로드됩니다.

## 명령어

```bash
npm run dev     # 개발 서버 (Turbopack), http://localhost:3000
npm run build   # 정적 export → out/ 디렉터리에 생성됨
npm run lint    # next lint (ESLint 설정/의존성은 아직 없음)
```

- 테스트 프레임워크는 없습니다.
- `next.config.ts`의 `output: 'export'` 설정 때문에 `npm run build`만으로 `out/`이 생성됩니다(`next export` 명령은 Next 15에서 제거됨).

## 기술 스택

- Next.js 15 (App Router, `output: 'export'` 정적 사이트), React 19, TypeScript (strict)
- Tailwind CSS v4 (`@tailwindcss/postcss`, `app/globals.css`의 `@theme inline`)
- `date-fns`: 남은 년/월/일 계산
- `sweetalert2`: 입력 검증 경고창
- `@next/third-parties/google`: GA
- 폰트: `next/font/google`의 Geist, Geist Mono, Noto Sans. Noto Sans는 `--font-dots` 변수로 매핑되어 `font-dots` 클래스로 사용합니다.
- `react-datepicker`는 설치되어 있지만 현재 사용하지 않습니다(네이티브 `<input type="date">` 사용).

## 구조

```
app/
  layout.tsx            # 루트 레이아웃: 폰트, 메타데이터, GA
  page.tsx              # 'use client'. 상태 전부 + 인생시계/통계 계산 로직
  globals.css           # Tailwind import, 테마 변수
  components/
    InputForm.tsx       # 생년월일/수명 입력과 검증 (수명 1~500, 미래 생일 불가, 수명 초과 불가)
    LifeClock.tsx       # HH:MM:SS.mmm.uuu 표시
    LifeStats.tsx       # 살아온 %, 남은 일수, 계산식 툴팁
    Quote.tsx           # 결과 화면 하단의 랜덤 명언
    Footer.tsx          # 입력 화면 하단 저작권 표시
    WaveBackground.tsx  # 움직이는 파도 배경. 수위 = 살아온 비율
public/timer.svg        # 파비콘
```

### 핵심 로직 (`app/page.tsx`)

- 상태는 모두 `page.tsx`에 있고 props로 하위 컴포넌트에 내려줍니다. 컴포넌트는 표시만 담당합니다.
- `lang`, `birthDate`(`yyyy-MM-dd` 문자열), `lifeExpectancy`(문자열)는 상태이고, `showResult`로 입력 화면과 결과 화면을 전환합니다.
- 인생 시각 = `(현재 - 출생) / (사망예정 - 출생)` × 24시간. `requestAnimationFrame` 루프로 매 프레임 갱신합니다.
- 사망 예정일 = 출생일 + `lifeExpectancy`년 (`setFullYear`).
- 명언 목록은 `page.tsx`에 하드코딩되어 있고, `showResult`가 바뀔 때마다 새로 뽑힙니다.

## 컨벤션

- UI 문자열 i18n은 라이브러리 없이 `lang === 'ko' ? '...' : '...'` 삼항으로 처리합니다. 새 문구를 추가할 때는 두 언어를 모두 넣으세요.
- 코드 주석은 한국어로 씁니다.
- 스타일은 Tailwind 유틸리티 클래스만 사용합니다. 배경은 `WaveBackground`의 노을 테마(`theme="sunset"`, 기본값)이고 `theme="night"`로 기존 밤바다 톤(slate-900 + sky/indigo)으로 되돌릴 수 있습니다. 제목과 주 버튼은 amber→pink 그라데이션, 결과 문구 강조색은 `amber-200`입니다.
- 애니메이션(`fade-in`, `wave`, `wave-reverse`, `drift`)은 `app/globals.css`의 `@theme` 블록에 정의합니다. Tailwind v4라 `tailwind.config.js`는 읽히지 않으니 만들지 마세요.
- 정적 export이므로 서버 전용 기능(API Routes, SSR, `next/image` 최적화 등)은 사용할 수 없습니다.
- 커밋 메시지는 한국어로 씁니다. 재배포 커밋에는 `[N차 재배포]` 접두어를 붙입니다.

## 배포

- `npm run build`로 생성한 `out/`을 AWS S3 버킷 `life-clock-hosung`에 업로드하고 CloudFront(OAC)로 서빙합니다. S3 버킷 정책은 로컬 `bucket-policy.json`에 있습니다(gitignore 대상).
- `out/`, `.next/`는 gitignore 대상입니다.

## 주의사항

- 쿠키 동의 배너는 두지 않습니다(의도적). GA는 동의 여부와 무관하게 production에서 항상 로드됩니다.
