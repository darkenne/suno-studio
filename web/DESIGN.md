# Suno Studio — Design System

새로운 페이지, 컴포넌트, 패턴을 만들 때 이 문서를 반드시 참조한다.
기존 토큰·클래스·패턴을 재사용하고, 임의의 하드코딩된 값을 쓰지 않는다.

---

## 1. Design Tokens

모든 토큰은 `src/app/globals.css` `:root`에 정의되어 있다.

### Colors — OkLCH 기반

```css
/* Backgrounds (어두울수록 낮은 레이어) */
--bg:          oklch(0.14 0.008 260)   /* 페이지 베이스 */
--bg-1:        oklch(0.17 0.010 260)   /* Nav, TopBar, Aside, 카드 */
--bg-2:        oklch(0.205 0.012 260)  /* Input, hover 상태, Dialog */
--bg-3:        oklch(0.245 0.013 260)  /* 최고 elevation, Slider 트랙 */

/* Borders */
--line:        oklch(0.30 0.012 260)   /* 기본 구분선 */
--line-2:      oklch(0.38 0.015 260)   /* hover 시 밝아지는 보더 */

/* Text (밝을수록 강조) */
--fg:          oklch(0.96 0.005 260)   /* 주요 텍스트 */
--fg-1:        oklch(0.78 0.008 260)   /* 보조 텍스트 */
--fg-2:        oklch(0.58 0.010 260)   /* 3차 텍스트, 레이블 */
--fg-3:        oklch(0.42 0.010 260)   /* 힌트, 비활성, 플레이스홀더 */

/* Accent */
--accent:      oklch(0.88 0.22 130)    /* 주 액션, 활성 상태 (밝은 초록) */
--accent-soft: oklch(0.88 0.22 130 / 0.14)  /* 선택된 배경 */
--accent-line: oklch(0.88 0.22 130 / 0.45)  /* 포커스 보더 */

/* Semantic */
--warn:        oklch(0.80 0.17 55)     /* 경고, 진행 중 (노랑) */
--err:         oklch(0.72 0.22 25)     /* 오류, Danger (빨강) */
```

### Color Usage 규칙

| 상황 | Background | Text | Border |
|------|-----------|------|--------|
| 기본 상태 | `--bg-1` / `--bg-2` | `--fg-2` / `--fg-1` | `--line` |
| Hover | `--bg-2` / `--bg-3` | `--fg` | `--line-2` |
| Active / Selected | `--accent-soft` | `--accent` | `--accent-line` |
| Focused input | `--bg-2` | `--fg` | `--accent-line` |
| Disabled | 변경 없음 + `opacity: 0.4` | — | — |
| Error / Danger | `oklch(0.68 0.19 28)` | `#140808` | `--err` |
| Muted / 힌트 | — | `--fg-3` | `--line` |

### Typography

```css
--sans: var(--font-inter-tight), "Inter Tight", system-ui, sans-serif
--mono: var(--font-jetbrains), "JetBrains Mono", ui-monospace, monospace
```

**Mono 사용**: 버튼, 레이블, 배지, 숫자, 상태 표시, 입력 필드, 타임스탬프, 힌트  
**Sans 사용**: Dialog 제목, 섹션 h-display, 트랙 타이틀, 설명 텍스트, 메뉴 아이템

### Sizing Tokens

```css
--ctrl-h: 32px   /* 버튼, Seg, Input, Select 통일 높이 */
```

---

## 2. Typography Scale

| 클래스 / 용도 | Font | Size | Weight | Letter-spacing | Color |
|--------------|------|------|--------|----------------|-------|
| `.h-display` | sans | 28px | 500 | -0.02em | `--fg` |
| `.h-eyebrow` | mono | 10px | — | 0.18em (uppercase) | `--fg-3` |
| Section head `h2` | sans | 16px | 500 | -0.01em | `--fg` |
| `.label` | mono | 10px | — | 0.12em (uppercase) | `--fg-2` |
| `.hint` | mono | 10px | — | 0.04em | `--fg-3` |
| Track title | sans | 14px | — | — | `--fg` |
| Track sub/tag | mono | 10px | — | 0.04em | `--fg-3` |
| Button (`.btn`) | mono | 11px | — | 0.1em (uppercase) | `--fg` |
| Button (`.btn.sm`) | mono | 10px | — | 0.1em (uppercase) | `--fg` |
| Seg button | mono | 11px | — | 0.08em (uppercase) | `--fg-2` |
| Menu item | sans | 12.5px | — | — | `--fg-1` |
| Menu heading | mono | 9px | — | 0.18em (uppercase) | `--fg-3` |
| Dialog title | sans | 18px | 500 | -0.01em | `--fg` |
| Stat value `.v` | mono | 20px | — | -0.01em | `--fg` |
| Stat key `.k` | mono | 9px | — | 0.14em (uppercase) | `--fg-3` |
| Lyrics active | sans | 32px | 500 | -0.012em | white |

**유틸리티 클래스**

```css
.mono  /* 모노 폰트 + font-feature-settings "zero" "ss02" */
.uc    /* uppercase + letter-spacing 0.08em */
.tnum  /* font-variant-numeric: tabular-nums — 숫자 정렬 시 항상 사용 */
```

---

## 3. Spacing & Layout

### 공통 패딩 패턴

| 영역 | Padding |
|------|---------|
| `.section` | `28px 32px` |
| Toolbar | `16px 32px` |
| Nav item | `9px 20px` |
| TopBar | `0 16px 0 20px` |
| Player | `0 20px` |
| Aside head | `18px 20px` |
| Aside body | `16px 20px` |
| Dialog head | `20px 22px` |
| Dialog body | `18px 22px` |
| Dialog footer | `14px 22px 18px` |
| Track row | `10px 20px` |
| Chip | `5px 10px` |

### Border Radius

| 용도 | Radius |
|------|--------|
| 버튼, 입력, Seg, 배지, 트랙 커버 | `2px` |
| Dialog, 메뉴, 플레이리스트 카드 | `3px` |
| Avatar | `50%` |
| Waveform bar | `1px` |

### Z-index 계층

| 레이어 | z-index |
|--------|---------|
| Sticky track header | 2 |
| Toolbar (sticky) | 3 |
| Multi-select action bar | 40 |
| Menu / Popover | 100 |
| Dialog / Modal | 200 |
| Toast | 200 |

### App Shell Grid

```
┌─────────────────── TopBar (48px) ────────────────────┐
│ Nav (256px) │       Main (1fr)      │  Aside (380px) │
│             │                       │                │
│             │                       │                │
├─────────────────── Player (64px) ────────────────────┤
```

- `grid-template-columns: 256px 1fr 380px`
- `grid-template-rows: 48px 1fr 64px`
- `.noAside` → `256px 1fr 0` (Aside 숨김)

---

## 4. Global Components

### Buttons

```tsx
// 기본
<button className="btn">Label</button>

// 사이즈 변형 — height: --ctrl-h (32px)
<button className="btn sm">Small</button>

// 의미 변형
<button className="btn primary">Primary Action</button>
<button className="btn ghost">Ghost</button>
<button className="btn danger">Delete</button>
<button className="btn icon"><Icon size={14} /></button>
```

| 변형 | padding | font-size | bg | text |
|------|---------|-----------|-----|------|
| `.btn` | `10px 16px` | 11px | `--bg-2` | `--fg` |
| `.btn.sm` | `0 10px` (h: 32px) | 10px | `--bg-2` | `--fg` |
| `.btn.primary` | 동일 | — | `--accent` | `#0a0d09` |
| `.btn.ghost` | 동일 | — | transparent | `--fg` |
| `.btn.danger` | 동일 | — | oklch(0.68 0.19 28) | `#140808` |
| `.btn.icon` | `8px` | — | `--bg-2` | `--fg` |

### Inputs & Textarea

```tsx
// 기본 Input — height는 --ctrl-h로 맞출 것
<input className="input" />
<input className="input mono" />   // 모노 폰트, 12px

// Textarea
<textarea className="textarea" />
<textarea className="textarea lyrics" />  // 가사 전용
```

- `padding: 10px 12px`, `font-size: 14px`, `border-radius: 2px`
- Focus: `border-color: --accent-line`, `bg: --bg-2`
- 모노 변형: `font-size: 12px`

### Labels & Hints

```tsx
<div className="label">Field Name</div>
<div className="label">Field Name <span className="count">0 / 100</span></div>

<div className="hint">보조 설명 텍스트</div>
<div className="hint" style={{ maxWidth: 430 }}>긴 설명은 maxWidth 지정</div>
```

### Segmented Control — `<Seg>`

```tsx
import { Seg } from '@/components/ui/Seg';

<Seg
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ]}
  value={val}
  onChange={setVal}
/>

// Accent 활성화 (선택 시 --accent 배경)
<Seg accent options={...} value={val} onChange={setVal} />
```

- height: `--ctrl-h` (32px), outer padding: `2px`, gap: `2px`
- 활성 버튼: `.btn.on` → `bg: --bg-3, color: --fg`
- accent 모드: `bg: --accent, color: #0a0d09`

### Select — `<Select>`

```tsx
import { Select } from '@/components/ui/Select';

<Select
  value={val}
  onChange={setVal}
  options={[{ value: 'x', label: 'Option X' }]}
  placeholder="선택..."
  mono  // 모노 폰트 옵션
/>
```

- Trigger height: `--ctrl-h`에 맞게 padding 조정
- Menu: `bg: --bg-2`, max-height `280px`, padding `4px`
- 옵션: `mono 12.5px`, hover `--bg-3`, 선택 시 `--accent`

### Chip — `<Chip>`

```tsx
import { Chip } from '@/components/ui/Chip';

<Chip>Tag</Chip>
<Chip on>Active Tag</Chip>
<Chip on onClick={() => ...}>Removable</Chip>
```

- 기본: `bg: --bg-2`, `border: --line`, `color: --fg-1`
- `.on`: `border: --accent-line`, `color: --accent`, `bg: --accent-soft`

### Slider — `<Slider>`

```tsx
import { Slider } from '@/components/ui/Slider';

<Slider
  label="Style Influence"
  value={val}
  onChange={setVal}
  min={0}
  max={100}
  step={1}
  unit="%"
  hintLeft="Loose"
  hintRight="Strict"
/>
```

### Menu — `<Menu>`

```tsx
import { Menu, MenuItem, MenuSep, MenuHeading } from '@/components/ui/Menu';

<Menu open={open} onClose={() => setOpen(false)} anchorRect={rect} width={200}>
  <MenuHeading>Section</MenuHeading>
  <MenuItem icon={<Play size={13} />} onClick={...}>Play</MenuItem>
  <MenuSep />
  <MenuItem danger icon={<Trash2 size={13} />} onClick={...}>Delete</MenuItem>
</Menu>
```

- 트리거: `MoreHorizontal` 아이콘 버튼 (size 14)
- 위치: anchorRect 기반 자동 포지셔닝
- 애니메이션: `menuPop` 120ms ease-out

### Waveform — `<Waveform>`

```tsx
import { Waveform } from '@/components/ui/Waveform';

<Waveform state="idle" seed={42} bars={20} height={36} />
// state: 'idle' | 'pending' | 'active'
```

---

## 5. Layout Patterns

### Section 레이아웃

```tsx
// 표준 섹션
<div className="section">
  <div className="section-head">
    <h2>Section Title</h2>
    <span className="muted">부가 정보</span>
  </div>
  {/* content */}
</div>

// 하단 구분선 없음
<div className="section no-underline">...</div>
```

### 페이지 헤더 패턴

```tsx
<div className="section no-underline" style={{ paddingBottom: 16 }}>
  <div className="h-eyebrow" style={{ marginBottom: 10 }}>Category</div>
  <h1 className="h-display">Page Title</h1>
</div>
```

### Stat Row

```tsx
<div className="stat-row">
  <div className="stat">
    <div className="k">Total Tracks</div>
    <div className="v tnum">42</div>
  </div>
  <div className="stat">
    <div className="k">Runtime</div>
    <div className="v tnum">3<span className="unit">h</span></div>
  </div>
</div>
```

- 4컬럼 그리드, 구분선 `--line`, 각 셀 `bg: --bg-1`

### Toolbar 패턴 (Filter bar)

```tsx
<div className={s.toolbar}>  {/* padding 16px 32px, sticky top 0, z-index 3 */}
  {/* 검색 input */}
  <div className={s.search}>
    <span className={s.searchIcon}><Search size={14} /></span>
    <input className={s.searchInput} placeholder="..." />
  </div>

  {/* Seg 필터 */}
  <Seg options={...} value={mode} onChange={setMode} />

  {/* 토글 버튼 */}
  <button className={`btn sm${active ? ' primary' : ''}`}>
    <Star size={13} /> Label
  </button>

  <div style={{ flex: 1 }} />  {/* 오른쪽 정렬 구분 */}

  {/* 정렬 Seg */}
  <Seg options={...} value={order} onChange={setOrder} />
</div>
```

모든 컨트롤 높이 = `--ctrl-h: 32px`

### Track List 패턴

```tsx
{/* Sticky 헤더 */}
<div className={s.trackHeader}>
  <span>#</span><span>Cover</span><span>Title</span>...
</div>

{/* 트랙 rows */}
{tracks.map(t => (
  <div key={t.id} className={s.track}>
    {/* 커버, 제목, 메타, 액션 */}
  </div>
))}
```

- 트랙 그리드: `36px 48px 56px 1fr 140px 110px 90px 36px 36px`
- Hover: `bg: --bg-1`, Playing: `bg: --bg-2`

### Empty State

```tsx
<div className="empty">
  <p>No tracks yet.</p>
  <button className="btn sm primary" style={{ marginTop: 16 }}>
    Create your first track
  </button>
</div>
```

### 모달 / Dialog

```tsx
// dlg- 접두사 클래스 사용
<div className="dlg-backdrop">
  <div className="dlg-panel" style={{ width: 480 }}>
    <div className="dlg-head">
      <h2 className="dlg-title">Title</h2>
      <button className="dlg-x">✕</button>
    </div>
    <div className="dlg-body">
      <p>Body content</p>
    </div>
    <div className="dlg-foot">
      <button className="btn ghost" onClick={onCancel}>Cancel</button>
      <button className="btn primary" onClick={onConfirm}>Confirm</button>
    </div>
  </div>
</div>
```

- 배경: `rgba(6,8,6,0.72)` + `backdrop-filter: blur(6px) saturate(140%)`
- 패널 애니메이션: `dlgPop` 160ms cubic-bezier(0.2, 0.8, 0.2, 1)

---

## 6. Animations & Transitions

### 표준 Transition

```css
/* 빠른 피드백 */
transition: background .12s, border-color .12s, color .12s;

/* 선택자 회전 등 */
transition: transform .15s, color .15s;
```

### 공통 Keyframes (globals.css에 정의됨)

| 이름 | 용도 | Duration |
|------|------|----------|
| `dlgPop` | Dialog 열기 | 160ms |
| `menuPop` | 메뉴 열기 | 120ms |
| `selMenuIn` | Select 드롭다운 | 120ms |
| `wpend` | Waveform 로딩 | 1.4s infinite |
| `pulse` | 실행 중 상태 점 | 1.2s infinite |
| `skeletonShimmer` | 스켈레톤 로더 | 1.2s infinite |
| `livepulse` | 라이브 인디케이터 | 1.2s infinite |
| `freshCard` | 새 결과 카드 flash | 1.2s |
| `toastin` | Toast 등장 | 300ms |

---

## 7. Icons

라이브러리: `lucide-react`

### 아이콘 × 컨텍스트

| 아이콘 | 용도 |
|--------|------|
| `Play`, `Pause` | 재생/일시정지 |
| `SkipBack`, `SkipForward` | 이전/다음 트랙 |
| `Shuffle`, `Repeat`, `Repeat1` | 플레이백 모드 |
| `Plus` | 추가, 생성 |
| `X` | 닫기, 제거 |
| `Check` | 확인, 완료 |
| `Trash2` | 삭제 |
| `Search` | 검색 인풋 아이콘 |
| `Star` | 즐겨찾기 |
| `MoreHorizontal` | 컨텍스트 메뉴 트리거 |
| `ChevronDown` | 아코디언, 드롭다운 |
| `ChevronRight` | 서브메뉴, 이동 |
| `ArrowLeft`, `ArrowRight` | 뒤로/더 보기 |
| `Download` | 다운로드 |
| `GripVertical` | 드래그 핸들 |
| `ListChecks` | 다중 선택 |
| `CircleDot` | 상태 표시 |

### 아이콘 크기 규칙

| 용도 | Size |
|------|------|
| 버튼 내 아이콘 | `13–14px` |
| 인풋 아이콘 (search) | `14px` |
| 메뉴 아이템 아이콘 | `13px` |
| 대형 빈 상태 | `24–28px` |
| 플레이어 주요 버튼 | `18–20px` |

- 색상은 기본 `currentColor` 상속
- Muted: `color: var(--fg-3)`
- Active: `color: var(--accent)`

---

## 8. Shell Components

### TopBar
```tsx
<TopBar
  batchJobs={jobs}
  batchTotal={batchTotal}
  savedCount={savedCount}
  remainingCredits={credits.remaining}
  totalCredits={credits.total}
  isCreditsLoading={creditsLoading}
/>
```

### Nav
```tsx
<Nav
  view={view}
  onNav={setView}
  onOpenPlaylist={openPlaylist}
  onNewPlaylist={handleNewPlaylist}
  activePlaylistId={activePlaylistId}
  playlists={playlists}
  trackCount={tracks.length}
  favCount={favCount}
  runningCount={runningCount}
/>
```

### Player
```tsx
<Player
  track={currentTrack}
  isPlaying={isPlaying}
  onPlayPause={...}
  playhead={playhead}
  onSeek={...}
  onPrev={handlePrev}
  onNext={handleNext}
  repeat={repeat}
  onRepeatToggle={...}
  shuffle={shuffle}
  onShuffleToggle={...}
  volume={volume}
  onVolumeChange={...}
  lyricsOpen={lyricsOpen}
  onToggleLyrics={...}
/>
```

---

## 9. CSS 모듈 규칙

- **Shell 컴포넌트**: `*.module.css` 사용 (`.toolbar`, `.track`, `.player` 등)
- **Global utilities**: `globals.css` 클래스 직접 사용 (`.btn`, `.seg`, `.input`, `.label`, `.hint` 등)
- **혼용**: `className={s.localClass + ' global-class'}` 형태 허용

### CSS Module 네이밍 컨벤션
- camelCase: `.trackHeader`, `.searchInput`, `.asideHead`
- 상태 클래스: `.playing`, `.on`, `.active` (전역 클래스에서 직접 사용)

---

## 10. 새 컴포넌트/페이지 체크리스트

새로운 UI를 만들 때 반드시 확인:

- [ ] 색상은 `--bg-*`, `--fg-*`, `--accent*`, `--line*` 토큰만 사용했는가?
- [ ] 컨트롤 높이는 `--ctrl-h: 32px`로 맞췄는가?
- [ ] 버튼은 `.btn`, `.btn.sm`, `.btn.primary`, `.btn.ghost`, `.btn.danger` 중 하나인가?
- [ ] 레이블은 `.label` 클래스를 사용했는가?
- [ ] 힌트 텍스트는 `.hint` 클래스를 사용했는가?
- [ ] 섹션은 `.section` / `.section no-underline` 패턴인가?
- [ ] 페이지 타이틀은 `.h-eyebrow` + `.h-display` 패턴인가?
- [ ] 숫자 값은 `.tnum` 클래스를 붙였는가?
- [ ] 아이콘은 `lucide-react`를 사용했는가?
- [ ] 모노 텍스트가 필요한 곳에 `--mono` / `.mono`를 사용했는가?
- [ ] 임의의 색상 하드코딩(`#fff`, `rgba(...)` 등)이 없는가?
- [ ] `border-radius`는 컨트롤 2px / 패널 3px 규칙을 따르는가?
- [ ] 트랜지션은 `.12s` 또는 `.15s` 기준을 따르는가?
- [ ] z-index는 레이어 규칙(2 → 3 → 40 → 100 → 200)을 따르는가?
