# Suno Studio — Claude Code Rules

## UI 작업 규칙

새로운 페이지, 컴포넌트, 패턴을 만들거나 기존 UI를 수정할 때는 **반드시 `DESIGN.md`를 먼저 읽고** 시작한다.

- 색상, 폰트, 간격, 컴포넌트는 `DESIGN.md`에 정의된 토큰과 패턴만 사용한다.
- 임의의 하드코딩된 색상(`#fff`, `rgba(...)` 등)이나 픽셀 값을 새로 만들지 않는다.
- 기존 글로벌 클래스(`.btn`, `.seg`, `.input`, `.label`, `.hint`, `.section` 등)를 우선 재사용한다.
- 새 컴포넌트를 만들면 `DESIGN.md` 섹션 10의 체크리스트를 확인한다.

## 프로젝트 구조

```
web/
├── src/
│   ├── app/
│   │   ├── globals.css       ← 모든 디자인 토큰 및 글로벌 컴포넌트 스타일
│   │   └── api/              ← API routes (Next.js App Router)
│   ├── components/
│   │   ├── ui/               ← 범용 UI 컴포넌트 (Seg, Select, Slider, Chip, Menu, Waveform)
│   │   ├── shell/            ← 앱 셸 (TopBar, Nav, Aside, Player, LyricsOverlay, Tweaks)
│   │   ├── create/           ← 음악 생성 패널
│   │   ├── library/          ← 라이브러리 뷰
│   │   ├── home/             ← 홈 뷰
│   │   ├── playlists/        ← 플레이리스트 뷰
│   │   └── cover/            ← 커버 이미지 컴포넌트
│   ├── hooks/                ← 커스텀 훅
│   ├── lib/                  ← 유틸리티, Supabase 클라이언트
│   └── types/                ← TypeScript 타입 정의
├── supabase/                 ← DB 스키마 및 마이그레이션 SQL
└── DESIGN.md                 ← 디자인 시스템 문서 (UI 작업 시 필수 참조)
```

## 데이터 저장 구조

- 트랙/플레이리스트 데이터는 Supabase `studio_snapshots` 테이블에 `user_id` 기준으로 저장
- 모든 API 호출에 `Authorization: Bearer <access_token>` 헤더 필요
- 클라이언트에서 `accessToken` 상태를 관리하며 fetch에 전달
