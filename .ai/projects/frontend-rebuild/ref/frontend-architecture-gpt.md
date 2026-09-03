# Frontend Architecture

> 사용자와 GPT가 논의한 장기 구조 초안. 현재 프로젝트는 Pages Router에서 App Router로 전환하는 이번 작업을 통해 이 원칙을 도입한다.

## 1. 기본 구조

프로젝트는 **기능(Feature) 중심 구조**를 기본으로 한다.

라우팅과 프레임워크 영역은 실제 비즈니스 로직과 분리하고, 특정 도메인에 종속되는 코드는 해당 `features` 내부에 배치한다.

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   ├── (service)/
│   └── (admin)/
├── features/
├── components/
│   ├── ui/
│   └── layout/
├── lib/
│   ├── api/
│   ├── auth/
│   └── realtime/
├── hooks/
├── utils/
├── constants/
└── types/
```

## 2. `app`

`app`은 URL routing, layout, page, loading, error, not-found처럼 Next.js 프레임워크 책임만 맡는다. 복잡한 업무 UI와 로직은 feature에서 가져온다.

```tsx
import { DocumentListPage } from "@/features/document/components/DocumentListPage";

export default function Page() {
    return <DocumentListPage />;
}
```

## 3. `features`

특정 업무 도메인에 종속되는 코드를 한 기능 폴더에 모은다.

```text
features/document/
├── api/
├── components/
├── hooks/
├── types/
├── utils/
└── constants/
```

기능만 아는 컴포넌트·hook·타입·상수는 공통 영역으로 올리지 않는다. 필요한 하위 폴더만 만들고, 처음부터 빈 폴더를 전부 만들지 않는다.

## 4. `components`

도메인을 모르는 재사용 UI를 둔다.

```text
components/
├── ui/       # Button, Input, Modal, Select, Table
└── layout/   # Header, Sidebar, Footer
```

`DocumentCard`처럼 도메인을 알아야 하는 컴포넌트는 `features/document/components`에 둔다. 여러 곳에서 쓴다는 사실보다 **도메인 지식 없이 쓸 수 있는가**를 판단 기준으로 삼는다.

## 5. API와 Hook

API 통신 함수는 해당 feature의 `api/`에, 그 통신의 React lifecycle·캐시 관리는 feature의 `hooks/`에 둔다.

```text
getDocument()  → API 통신
useDocument()  → React 상태 및 query lifecycle
```

공통 HTTP client, 인증 기반, query client는 `lib/`가 소유한다. React Query 같은 라이브러리는 실제 도입을 결정한 뒤 사용한다.

## 6. 실시간 통신

공통 연결 기술은 `lib/realtime`, React mount/unmount 연결은 공통 `hooks`, 업무 이벤트 처리는 `features/*/hooks`에 둔다. 단 하나의 feature에서만 쓰면 처음부터 공통화하지 않는다.

## 7. 공통 코드

- `lib`: HTTP client, 인증 기반, query client, SSE/WebSocket client처럼 외부 시스템·라이브러리 기반 코드
- `hooks`: 도메인을 모르는 React hook
- `utils`: React·feature에 의존하지 않는 순수 함수
- `types`: 페이지네이션 등 전역 공통 타입
- `constants`: 전역 공통 상수

도메인 타입·상수·hook은 해당 feature에 남긴다.

## 8. 의존성 원칙

```text
app
 ↓
features
 ↓
components / hooks / lib / utils
```

공통 영역이 feature를 참조하는 역방향 의존성과 feature 사이의 직접 참조를 피한다. 페이지가 여러 feature를 조합한다.

## 9. 최종 구조 예시

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/login/page.tsx
│   ├── (service)/documents/page.tsx
│   └── (admin)/users/page.tsx
├── features/
│   ├── auth/
│   ├── document/
│   ├── writing/
│   └── user/
├── components/
│   ├── ui/
│   └── layout/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── query/
│   └── realtime/
├── hooks/
├── utils/
├── constants/
└── types/
```

핵심 기준은 다음과 같다.

```text
라우팅인가?                 → app
특정 업무 기능인가?          → features
도메인과 무관한 공통 UI인가? → components
외부 시스템/라이브러리 기반? → lib
도메인과 무관한 React Hook?  → hooks
순수 함수인가?               → utils
공통 타입인가?               → types
공통 상수인가?               → constants
```
