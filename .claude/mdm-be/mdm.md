# MDM Mock 서버 구현 가이드

> Lawform BE 가 HSAD MDM 실제 시스템 연동 전 통합 테스트용으로 호출할 mock 서버 규격.
> 실제 MDM 명세서 수령 전이라 schema 는 **Lawform 측에서 임의 결정**한 안. 명세 수령 시 schema 가 다르면 mock 만 갱신하거나 Lawform 측 어댑터 (`Mdm` 클래스 메서드 본문) 만 교체.
>
> - Mock 서버 호스트: `http://localhost:9090`
> - 응답 형식: JSON
> - 인코딩: UTF-8
> - 인증: 없음 (Lawform 측에서도 무가드, 추후 정책 확정 시 추가)

---

## 공통

### 성공 응답

- HTTP `200 OK`
- body 는 각 endpoint 의 응답 schema 참조

### 실패 응답

- HTTP `4xx` / `5xx`
- body 는 자유 (예: `{ "message": "..." }`)
- Lawform 측은 status code 만 보고 `MDM_REQUEST_FAILED` (id 80007) 으로 throw

### 응답 헤더

- `Content-Type: application/json; charset=utf-8`

---

## 1. 거래처 목록 조회 (`getList`)

거래처 검색 모달에서 사용자가 입력한 검색어로 MDM 거래처 마스터 조회.

### Endpoint

| 항목 | 값 |
|------|-----|
| METHOD | `GET` |
| PATH | `/mdm/list` |
| 호출 빈도 | 사용자 검색 액션마다 (낮음) |

### Request Query

| 키 | 타입 | 필수 | 설명 |
|----|------|------|------|
| `name` | string | 선택 (둘 중 하나는 필수) | 법인/개인사업자명 OR 개인 이름. 부분 일치 검색 가정 |
| `business_number` | string | 선택 | 법인/개인사업자번호 OR 개인 생년월일 (`YYYYMMDD`). 정확 일치 검색 가정 |

> mock 서버에서는 `name` / `business_number` 값 무시하고 고정 결과 반환해도 OK. 검색 동작 모킹하려면 두 조건 모두 일치하는 row 필터 권장.

### Response 200 — 성공

```json
{
    "items": [
        {
            "business_name": "주식회사 가나다",
            "business_number": "123-45-67890",
            "business_owner": "홍길동",
            "address": "서울특별시 강남구 테헤란로 123",
            "business_type": "도소매업",
            "industry": "전자제품"
        },
        {
            "business_name": "라마바 컴퍼니",
            "business_number": "234-56-78901",
            "business_owner": "이순신",
            "address": "서울특별시 서초구 반포대로 45",
            "business_type": "서비스업",
            "industry": "법률서비스"
        }
    ]
}
```

### Response 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `items` | array | 매칭 거래처 리스트. 0건이면 `[]` |
| `items[].business_name` | string | 법인/개인사업자명 또는 개인 이름 |
| `items[].business_number` | string | 사업자번호 (법인/개인사업자) 또는 생년월일 (개인) |
| `items[].business_owner` | string | 대표자명 (개인은 본인 이름과 동일 가능) |
| `items[].address` | string | 주소 (있으면 채움) |
| `items[].business_type` | string | 업태 |
| `items[].industry` | string | 업종 |

> 페이징 없음. 결과 건수 제한이 필요하면 mock 서버가 최대 50건 정도로 끊는 것 권장.
> 필드값 누락 시 빈 문자열 권장 (null 보다 안전).

### Curl 예시

```bash
curl -X GET 'http://localhost:9090/mdm/list?name=가나다&business_number=123-45-67890' \
     -H 'Accept: application/json'
```

---

## 2. 블랙리스트 여부 확인 (`checkBlacklist`)

CLM 임시 저장 단계에서 거래처가 HSAD 블랙리스트에 등재돼 있는지 확인.

### Endpoint

| 항목 | 값 |
|------|-----|
| METHOD | `POST` |
| PATH | `/mdm/check` |
| 호출 빈도 | CLM draft 저장 / 거래처 변경 시 (낮음) |

### Request Body (JSON)

| 키 | 타입 | 필수 | 설명 |
|----|------|------|------|
| `business_number` | string | 필수 | 법인/개인사업자번호 OR 개인 생년월일 |
| `name` | string | 필수 | 법인/개인사업자명 OR 개인 성명 |
| `birth` | string | 개인일 때만 | 개인의 생년월일 (`YYYYMMDD`). 법인이면 빈 문자열 또는 미전송 |

#### Request 예시

```json
{
    "business_number": "123-45-67890",
    "name": "주식회사 가나다",
    "birth": ""
}
```

### Response 200 — 성공

```json
{ "is_blacklist": "Y" }
```

또는

```json
{ "is_blacklist": "N" }
```

### Response 필드

| 필드 | 타입 | 값 | 설명 |
|------|------|-----|------|
| `is_blacklist` | string | `'Y'` / `'N'` | `'Y'` = 블랙리스트 등재됨 / `'N'` = 미등재 |

> 사유 / 등재일자 등 추가 메타 **없음** (디퍼런스측 확정 — `Y/N` 만 줌).
> Lawform 측은 `'Y'` → `is_blacklist: true` 로 매핑.

### Mock 동작 권장 시나리오

테스트 시 결과 분기 컨트롤 위해 다음 룰 권장:

| `business_number` 값 | 응답 |
|---------------------|------|
| `'000-00-00000'` (특정 매직값) | `{ "is_blacklist": "Y" }` |
| 그 외 | `{ "is_blacklist": "N" }` |

또는 `name === '블랙'` 등 단순 룰로 분기 가능.

### Curl 예시

```bash
curl -X POST 'http://localhost:9090/mdm/check' \
     -H 'Content-Type: application/json' \
     -H 'Accept: application/json' \
     -d '{ "business_number": "000-00-00000", "name": "테스트법인", "birth": "" }'
```

---

## 운영 명세 수령 시 변경 예상 지점

mock 으로 정한 schema 와 실제 MDM 명세가 다를 가능성이 있는 부분 — 명세 수령 시 mock 또는 Lawform `Mdm` 클래스만 갱신하면 됨.

| 영역 | mock 가정 | 실제 가능성 |
|------|----------|------------|
| Path | `/mdm/list` / `/mdm/check` | MDM 측 actID 컨벤션 (예: `/api/customer/search`) |
| Request 필드명 | snake_case (`business_number`) | camelCase 또는 ALL_CAPS 가능 |
| 사업자번호 포맷 | 하이픈 포함 (`123-45-67890`) | 미포함 (`1234567890`) 가능 |
| 생년월일 포맷 | `YYYYMMDD` | `YYYY-MM-DD` 가능 |
| getList 응답 envelope | `{ items: [...] }` | 디퍼런스측처럼 `{ header, body: { OUT_DATA } }` 가능 |
| checkBlacklist 응답 envelope | `{ is_blacklist: 'Y'\|'N' }` | `{ Y_N: ... }` / `{ result: ... }` 가능 |
| 페이징 | 없음 | `count` / `page` / `offset` 추가 가능 |
| 에러 응답 | 자유 | 표준 에러 코드 / 메시지 포맷 가능 |

Lawform `Mdm` 클래스의 메서드 본문 (`route` / `method` / body 구성 / 응답 파싱) 만 교체하면 entrypoint / serializer 영향 없음.

---

## Lawform 측 호출 코드 참조

- 클래스: `apps/api/libs/hsad/mdm.js`
- 베이스: `apps/api/libs/hsad/connector.js` (fetch wrapper)
- env: `CF_MDM_BASE_URL=http://localhost:9090` 설정 시 mock 서버로 호출
- 에러 코드: `MDM_REQUEST_FAILED` (id `80007`, HTTP `502`) — 4xx/5xx 응답 또는 네트워크 에러 시 throw

---

## 미결 항목 (실제 MDM 명세서 수령 대기)

> 본 mock 은 위 임의 schema 로 동작 확인용. 아래는 **실제 명세 수령 후 확정 필요**. 명세 도착 시 mock + Lawform `Mdm` 클래스 모두 갱신해서 통합 테스트 진행 예정.

### 🔴 A-1. API 명세서 수령 일정

명세서를 준다고 했으나 미수령 상태. 수령 ETA 및 담당자 확인 필요.

### 🔴 A-2. Route / Method 확정

| 메서드 | 현재 (임시) | 확정 필요 |
|--------|-------------|----------|
| 거래처 목록 조회 | `GET /mdm/list` | 실제 경로 / HTTP method |
| 블랙리스트 여부 확인 | `POST /mdm/check` | 실제 경로 / HTTP method |

### 🔴 A-3. 입력 schema 상세

구두 합의:
- 거래처 목록: `(법인/개인사업자명 OR 개인 이름) AND (법인/개인사업자 번호 OR 개인 생년월일)`
  - 개인/법인 구분자가 별도 enum 으로 존재하는지, 아니면 필드 조합으로 자동 판별인지?
  - 생년월일 포맷 (`YYYYMMDD` / `YYYY-MM-DD` / 기타)?
  - 사업자번호 포맷 (하이픈 포함 / 미포함)?
- 블랙리스트 확인: `법인/개인사업자 번호 AND (개인 성명 OR 법인/개인사업자명) AND (개인) 생년월일`
  - 개인 여부 판단 자동인지, 별도 type 필드 필요한지?

### 🔴 A-4. 응답 schema

- 거래처 목록의 각 항목이 어떤 필드를 포함하는가? (대표자명 / 주소 / 업종 외 추가?)
- 페이징이 있는가? 최대 응답 건수 제한이 있는가?
- 블랙리스트 응답이 단순 `Y/N` 인가, 추가 메타가 함께 오는가? — **확인된 부분**: 사유 / 등재일자는 안 줌, `Y/N` 만.

### 🔴 A-5. 인증 / 네트워크

- API 인증 방식 (API key / OAuth / mTLS / IP allowlist)?
- 운영/스테이징/로컬 환경별 base URL 분리?
- **확인된 부분**: 사내망에서 접근 가능한 형태.

### 🔴 A-6. 에러 / 운영

- 에러 응답 포맷 / 코드 표?
- Timeout / Retry 정책?
- 호출 빈도 제한 (rate limit)?

### 🟡 A-7. `getList` endpoint 세부 (Lawform entrypoint 단계)

호출 지점은 Lawform 측 신규 endpoint (`entrypoint/lawform/clm_customer/` 거래처 검색 모달). 다음은 entrypoint 작성 시 결정 필요:

1. 두 query (`name`, `business_number`) 모두 **필수**? 하나만 받아도 호출 허용 (그 경우 missing 쪽은 빈 문자열로 MDM 에 전달)? **[완전구현]**
2. MDM 응답 schema 가 미수령이라, Lawform BE 는 일단 응답을 **그대로 pass-through** 로 내려주면 되는지? 또는 우리 `clm_customer` 직렬화 포맷으로 가공? **[완전구현 + 명세대기]**
3. 모달에서 사용자가 결과 1건을 **선택**한 뒤의 후속 동작 — 거래처 등록 폼 자동 채우기 / 곧바로 `clm_customer` INSERT / CLM 에 연결 중 어느 쪽? **[완전구현]**

---

명세 수령 시점 처리:
1. 위 A-1 ~ A-7 답변 확정
2. 본 md 의 §1 / §2 schema 갱신 (실제 명세 기준)
3. mock 서버 응답 갱신
4. Lawform `Mdm` 클래스 본문 (route / body / 응답 파싱) 교체
5. 통합 테스트 — 거래처 검색 모달 + blacklist_check 임시 룰 교체 동작 확인
