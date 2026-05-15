# MDM 연동 — BE 구현 스펙

> HSAD 측 MDM(Master Data Management) 시스템과의 연동. 거래처(법인/개인사업자/개인) 마스터 목록 조회 + 블랙리스트 여부 판정 두 가지를 제공한다고 함.
>
> - 브랜치: `hsad-develop`
> - 대상 고객사: **HSAD 전용**
> - 런타임: **Legacy Express** (`apps/api/entrypoint/lawform/*`)
> - 상태: **API 명세서 미수령 — 구두 합의만 존재, 골격 코드만 선반영**

---

## 1. 구두 합의 (현 시점 확정 사항)

### 1.1 MDM 이 제공한다고 한 두 가지 API

| # | 용도 | 입력 (AND 조건) | 출력 |
|---|------|----------------|------|
| 1 | **거래처 목록 조회** | (법인/개인사업자명 OR 개인 이름) **AND** (법인/개인사업자 번호 OR 개인 생년월일) | 매칭 거래처 리스트 |
| 2 | **블랙리스트 여부 확인** | 법인/개인사업자 번호 **AND** (개인 성명 OR 법인/개인사업자명) **AND** (개인의 경우) 생년월일 | `Y` / `N` |

### 1.2 운영 제약

- 거래처 목록 전체 조회는 부하 문제로 **불가** — 위 입력 조건 충족 시에만 호출 가능.
- 입력은 법인/개인사업자/개인을 한 필드 쌍으로 묶어 받음 (개인이면 이름 + 생년월일, 법인이면 사업자명 + 사업자번호).

### 1.3 미정 사항 (전부 명세서 수령 후 확정 예정)

- **route 경로** — 현재 `mdm/list`, `mdm/check` 는 임시 placeholder
- **HTTP method** — 현재 list=GET, check=POST 가정 (확정 X)
- **요청/응답 schema** (필드명, 타입, 인증 방식, 에러 코드 등)
- **인증** (API key / mTLS / 사내망 IP allowlist 등)

---

## 2. 현재 코드 상태

### 2.1 파일

`apps/api/libs/hsad/mdm.js` — 골격 단계 `class Mdm`. 본 작업에서 공통 base class `apps/api/libs/hsad/connector.js` (→ [`../difference/SPEC.md#62-connectorjs-베이스-클래스-c-1`](../difference/SPEC.md)) 를 상속하도록 정리.

```js
// 정리 후 골격 (예정)
class Mdm extends Connector {
    constructor()  // env: CF_MDM_BASE_URL (필수)

    async getList({ name, business_number })              // 거래처 목록 조회 (route/method 미정)
    async checkBlacklist({ business_number, name, birth })// 블랙리스트 여부 (route/method 미정)
}
```

### 2.2 정리 사항

| 항목 | 처리 |
|------|------|
| `export` | 추가 |
| `_cacheData` | **제거** (사용처 없음 — 단순 끄적임이었음, 사용자 확인) |
| `send()` query/body | base class (`Connector`) 로 이관 + 정상화 (GET `url.searchParams`, POST `JSON.stringify` + `Content-Type`) |
| 에러 코드 | `MDM_REQUEST_FAILED` 로 통일 |

### 2.3 환경 변수

- `CF_MDM_BASE_URL` — MDM 시스템 base URL (필수)

---

## 3. 호출 지점

### 3.1 블랙리스트 판정 (`checkBlacklist`)

기존 블랙리스트 특별승인 플로우 ([`../blacklist-be/SPEC.md`](../blacklist-be/SPEC.md)) 의 `POST /api/clm_customer/blacklist/check` 가 현재 `business_name === 'bad'` 임시 룰로 동작 중.

→ MDM 명세 수령 시 본 endpoint 내부에서 `Mdm.checkBlacklist` 호출로 교체 예정. 응답 스펙(`{ is_blacklist, clm_customer? }`) 은 유지하므로 FE 영향 없음.

### 3.2 거래처 검색 (`getList`) — 신규 endpoint

FE 의 "**거래처 검색** 버튼" 클릭 → 모달 → text input 2개 (이름, 사업자번호) → "검색" 버튼 → 본 API 호출.

- **위치**: `apps/api/entrypoint/lawform/clm_customer/` 에 신규 endpoint, `route.clm_customer.js` 에 라우트 등록.
- **Method / Path**: `GET /api/clm_customer/...` (구체 경로 미정).
- **Query**: `name`, `business_number` — FE 가 그대로 전달, BE 가 MDM 으로 forward.
- **응답·필수 여부·선택 후 동작** 등 세부는 명세서 수령 후 entrypoint 단계에서 확정 (REQUEST `A-7` 참조).

---

## 4. 미결 항목

질문은 [`../difference/REQUEST.md`](../difference/REQUEST.md) 의 **MDM 섹션** 참조.
