# Difference 연동 — BE 구현 스펙

> HSAD 사내 **Difference** 솔루션과의 연동. JOB(JOB) 단위로 어떤 CLM 이 사용되었는지 매핑하기 위해, CLM 에 `difference_job_no` 를 보관하고, FE 의 JOB 연결 화면에서 Difference 가 노출하는 JOB 목록을 조회·연결한다.
>
> - 브랜치: `hsad-develop`
> - 대상 고객사: **HSAD 전용**
> - 런타임: **Legacy Express** (`apps/api/entrypoint/lawform/*`)
> - 상태: **명세 수령 완료** — Difference 측 6종(1-1 / 1-2 / 3 / 4 / 5 / 6) + Lawform 측 1종(7) xlsx 보유. **본 작업 포함 범위 = 1-1 / 1-2 / 3 / 4 / 5 / 6 / 7 전부**.

---

## 1. 배경 / 목적

Difference 솔루션 측이 **JOB 별로 어떤 CLM 을 사용했는지** 통합 관리하려는 요구. CLM ↔ JOB 매핑은 1:1 (또는 1:0..1) 로 보고, 매핑 정보는 CLM 측 단일 컬럼(`clm.difference_job_no`) 에 저장.

### 운영 정책

1. FE 는 별도의 "JOB 정보" 화면을 띄우지 않음 — 연결된 경우 **JOB 번호 문자열만** 표시.
2. **JOB 연결 버튼** 클릭 → Difference 의 JOB 목록을 list API 로 받아 보여줌 → 사용자가 선택 → `clm_id + job_no` 로 update.
3. `JOB_NO === job_no` (2026-05-14 디퍼런스측 재확인. 원래 다른 개념이나 본 연동에서는 동일 식별자).

---

## 2. 데이터 모델

### 2.1 기존 테이블 수정

#### `clm.difference_job_no` 컬럼

```sql
-- 202605071100_add_columns_clm_final_approval.sql 에서 deference_job_no 로 최초 추가
ALTER TABLE clm
    ADD deference_job_no VARCHAR(100) DEFAULT NULL NULL AFTER final_approval_replacement_at;

-- 202605081550_modify_clm_difference_job_no.sql 에서 difference_job_no 로 RENAME (오타 수정)
ALTER TABLE clm
    RENAME COLUMN `deference_job_no` TO `difference_job_no`;
```

> 최종 컬럼명은 `clm.difference_job_no` (솔루션 이름 `Difference` 와 일치). 모델/직렬화 반영 완료 (`apps/api/database/models/clm.js`, `apps/api/serializers/clm.js`).

**Unique constraint 미적용**: 업무상으로는 JOB 1건 ↔ CLM 1건이나, Difference 측 데이터 오류·정책 변경 가능성을 DB constraint 로 막지 않음. 동일 `job_no` 가 여러 CLM 에 저장될 수 있음을 허용.

### 2.2 신규 테이블

없음. 매핑 정보는 `clm.difference_job_no` 단일 컬럼.

---

## 3. 외부 인터페이스 명세

### 3.1 명세서 인덱스

원본 xlsx 는 제거 — 본 SPEC §3 이 단일 진실 출처. 작성자: 김종민(디퍼런스측). 송신: Difference, 수신: 신규법무시스템(Lawform). 인터페이스 유형: Web Service / 직접연결 / Asynchronous / 수시.

| I/F ID | 번호 | 제목 | 방향 | METHOD | 버전 | 작성일 | 본 작업 범위 |
|--------|------|------|------|--------|------|--------|------------|
| IF-SM-001 | 1-1 | 계약검토완료목록 | Difference → Lawform | GET | v0.1 | 2026-04-14 | ✅ 포함 |
| IF-SM-002 | 1-2 | 계약검토완료진행현황 | Difference → Lawform | GET | v0.1 | 2026-04-14 | ✅ 포함 (2026-05-14 신규) |
| IF-SM-003 | 3 | 기존계약서검토내역조회 | Difference → Lawform | GET | v0.1 | 2026-04-14 | ✅ 포함 (단 AS-IS 기준 — TO-BE 명세 v0.2 대기) |
| IF-SM-004 | 4 | 기존계약서검토내역업데이트 | Difference → Lawform | POST | v0.1 | 2026-04-14 | ✅ 포함 (`clm.difference_job_no` 업데이트) |
| IF-SM-005 | 5 | 계약서스캔본등록여부확인 | Difference → Lawform | POST | v0.1 | 2026-04-14 | ✅ 포함 |
| IF-SM-006 | 6 | 계약검토완료건등록 | **Lawform → Difference** | POST | v0.2 | 2026-04-14 | ✅ 포함 (회계팀 수익인식 push) |
| IF-SM-007 | 7 | JOB목록조회 | **Lawform → Difference** | POST | v0.2 | 2026-04-28 | ✅ 포함 |

#### 공통 응답 패턴 (xlsx 기준 — 주로 Lawform → Difference 호출 결과)

```json
{
  "header": { "actID": "<actID>", "baRq": "IN_DATA", "baRs": "OUT_RESULT[,OUT_DATA]" },
  "body": {
    "OUT_RESULT": [{ "STATUS": "S"|"E", "CODE": "...", "MSG": "..." }],
    "OUT_DATA":   [{ ... }]
  }
}
```

- `STATUS`: `S`=성공, `E`=실패. 실패 시 우리쪽은 `DIFFERENCE_REQUEST_FAILED` throw.
- `CODE` / `MSG`: 메시지 코드 / 메시지.

Inbound (Difference → Lawform) 명세는 우리 측에서 정한 응답 포맷이라 위 패턴을 강제하지 않음 — `{ OUT_DATA: [...] }` 또는 `{ OUT_DATA: {...} }` 형태로 단순 반환.

Difference 측 BASE URL placeholder 는 `https://신규법무시스템/xxxx` — 실제는 Lawform 의 `/api/hsad/difference/*` 라우트.

### 3.2 Difference → Lawform 명세 (1-1 / 1-2 / 3 / 4 / 5)

Difference 솔루션 측이 우리에게 호출하는 API. 본 작업 범위에 **포함** — `apps/api/entrypoint/lawform/hsad/difference/route.hsad.difference.js` 에 라우트 마운트. prefix 는 `/api/hsad/difference/*`.

**인증**: 일단 무가드. 인증 적용 자리에는 `// TODO[HJJ]: ...` 주석으로 표시. 추후 사내망 토큰 / IP allowlist 등 정책 확정 시 추가.

**라우트 / 메서드 / 필수 필드 (xlsx 명세 기준)**

| API | METHOD | path | 필수 필드 | 비고 |
|-----|--------|------|----------|------|
| 1-1 계약검토완료목록 | GET | `/list/review_completed` | `JOB_NO` (query) | OUT_DATA 10 필드 |
| 1-2 계약검토완료진행현황 | GET | `/list/review_completed_progress` | `CTRT_CODE` (query) | xlsx 의 `CTRT_STEP(차수)` 는 우리 시스템 미지원 → 무시 |
| 3 기존계약서검토내역조회 | GET | `/search/review_history` | (없음) | xlsx 노트: AS-IS 기준 → **TO-BE 명세 v0.2 대기** |
| 4 기존계약서검토내역업데이트 | POST | `/update/job_no` | `CTRT_NJOB`, `CTRT_CODE` (body) | xlsx 의 `CTRT_STEP(차수)` "필요???" 표기 → 무시 |
| 5 계약서스캔본등록여부확인 | POST | `/check/scan_registration` | `CTRT_NJOB` (body) | 응답 `FILE_YN: Y/N/X` |

**응답 직렬화**: xlsx 명세대로 노출. 각 핸들러 JSDoc 에 OUT_DATA 필드 매핑 (xlsx ← CLM 필드) 명시.

**DB query / 매핑 (TODO)**: 핸들러 본문의 실제 조회 로직은 `// TODO[HJJ]: ...` 마커로 분리 — clm 필드와 xlsx 필드 매핑 (예: CTRT_TYPE_NM ← clm_category, CTRT_CGUN ← legal_user.name 등) 확정 후 채움.

#### 3.2.1 1-1. 계약검토완료목록 (IF-SM-001, GET)

**IN_DATA** (Req 1)

| Field | Type | Description |
|-------|------|-------------|
| `JOB_NO` | CHAR | JOB번호 |

**OUT_DATA** (Res 10 — 우리 응답에서 `CTRT_STEP` 은 키 자체 제외)

| Field | Type | Description |
|-------|------|-------------|
| `CTRT_NJOB` | String | JOB번호 (= `clm.difference_job_no`) |
| `CTRT_CODE` | String | 법무일련번호 (= `clm.id`) |
| `CTRT_STEP` | String | 차수 — **응답 제외** (우리 시스템 미지원) |
| `CTRT_TITL` | String | 계약명 (= `clm.name`) |
| `CTRT_TYPE_NM` | String | 계약유형 (= `clm.clm_category.name`) |
| `CTRT_RQUN` | String | 요청자명 (= `clm.user.name`) |
| `CTRT_RQDT` | String | 요청일자 yyyymmdd (= `clm.created_at`) |
| `CTRT_CGUN` | String | 검토자명 (= `clm.legal_user.name`) |
| `CTRT_STAT_NM` | String | 진행단계명 (= `CF_CLM_PROGRESS[clm.progress_status]`) |
| `FILE_YN` | String | 첨부파일유무. `clm_attachment` 중 `type !== 3 AND is_del=1` 1건 이상 → `'Y'`, 그 외 → `'N'`. `type=3` 은 그룹웨어 연동 자료라 제외 |

조회 조건: `clm.difference_job_no = JOB_NO AND progress_status >= 250 AND is_del = 1`.

#### 3.2.2 1-2. 계약검토완료진행현황 (IF-SM-002, GET)

**IN_DATA** (Req 2 — 단 `CTRT_STEP` 은 xlsx 노트 *"필요한지??"* + 우리 시스템 미지원 → 무시)

| Field | Type | Description |
|-------|------|-------------|
| `CTRT_CODE` | String | 법무일련번호 |
| ~~`CTRT_STEP`~~ | ~~String~~ | ~~차수 — 무시~~ |

**OUT_DATA** (Res 5 — 우리 응답에서 `HSTR_FRUN` 은 키 자체 제외)

| Field | Type | Description |
|-------|------|-------------|
| `CTRT_STAT_NM` | String | 진행단계명 (= `CF_CLM_PROGRESS[log.clm_progress_status]`, null 이면 빈 문자열) |
| `HSTR_FRUN` | String | 요청자명 — **응답 제외** |
| `HSTR_TOUN` | String | 검토자명 (= `log.user.name`. SYSTEM type 이면 `'시스템'`, user_id NULL 이면 `''`) |
| `HSTR_DATE` | String | 완료일자 yyyymmdd (= `log.created_at`) |
| `HSTR_DESC` | String | 의견 (= `log.content`) |

조회: `clm_log WHERE clm_id = CTRT_CODE AND is_del = 1 ORDER BY created_at ASC`. user join 시 user.is_del 체크 X.

#### 3.2.3 3. 기존계약서검토내역조회 (IF-SM-003, GET)

⚠ **xlsx 노트**: *"AS-IS 기준으로 작성됨. TO-BE 기준으로 수정 필요."* — 현 명세 v0.1 은 구 법무시스템 기준이라 실제 사용 시 v0.2 대기.

**IN_DATA** (모두 검색조건, 선택)

| Field | Type | Description |
|-------|------|-------------|
| `CTRT_TITL` | String | 계약명 |
| `CTRT_RQUN` | String | 요청자명 |
| `COMM_CODE` | String | 계약유형1 코드 |
| `COMS_CODE` | String | 계약유형2 코드 |
| `STRT_DATE` | String | 시작일자 |
| `END_DATE` | String | 종료일자 |

**OUT_DATA** (17 필드 — AS-IS)

| Field | Type | Description |
|-------|------|-------------|
| `CTRT_CODE` | String | 법무일련번호 |
| `CTRT_STEP` | String | 차수 |
| `CTRT_TITL` | String | 계약명 |
| `COMM_CODE` | String | 계약유형1 코드 |
| `COMM_KRNM` | String | 계약유형1 명 |
| `COMS_CODE` | String | 계약유형2 코드 |
| `COMS_KRNM` | String | 계약유형2 명 |
| `CTRT_TYPE_NM` | String | 계약유형1+계약유형2 |
| `CTRT_STAT` | String | 진행단계코드 |
| `CTRT_STAT_NM` | String | 진행단계명 |
| `CTRT_RQDT` | String | 요청일 |
| `CTRT_RQUC` | String | 요청자사번 |
| `CTRT_RQUN` | String | 요청자명 |
| `CTRT_RQTC` | String | 요청자조직코드 |
| `CTRT_RQTN` | String | 요청자조직명 |
| `CTRT_RQPC` | String | 직책코드 |
| `CTRT_RQPN` | String | 직책명 |
| `CTRT_NJOB` | String | JOB번호 |

#### 3.2.4 4. 기존계약서검토내역업데이트 (IF-SM-004, POST)

**IN_DATA** (Req 3 — 단 `CTRT_STEP` 은 xlsx 노트 *"필요???"* + 우리 시스템 미지원 → 무시)

| Field | Type | Description |
|-------|------|-------------|
| `CTRT_NJOB` | String | JOB번호 (필수) |
| `CTRT_CODE` | String | 법무일련번호 (필수) |
| ~~`CTRT_STEP`~~ | ~~String~~ | ~~차수 — 무시~~ |

**동작**

- Difference 가 `CTRT_NJOB`(=job_no) + `CTRT_CODE`(=clm.id) 전달 → `clm.difference_job_no` UPDATE.
- 결과적으로 내부 PUT (`/api/clm/update/difference_job_no`) 와 동일한 동작.
- **상태 가드**: §4.2.2 (`>= 250 && != 500 && != 600`) 동일 적용 — 위반 시 4xx 거절, Difference 측이 retry/skip.
- **`clm.id` 부재**: `DB_NOT_FOUND` 404.
- **권한 가드 미적용** — inbound 호출은 사용자 컨텍스트 없음.
- **`clm_log` / 알림 없음** — 내부 PUT 과 동일.

⚠ xlsx 노트: *"AS-IS 기준으로 작성됨. TO-BE 기준으로 수정 필요."* — v0.2 명세 시 IN_DATA 추가 필드 가능성.

#### 3.2.5 5. 계약서스캔본등록여부확인 (IF-SM-005, POST)

**IN_DATA** (Req 1)

| Field | Type | Description |
|-------|------|-------------|
| `CTRT_NJOB` | String | JOB번호 (필수) |

**OUT_DATA** (1 필드)

| Field | Type | Description |
|-------|------|-------------|
| `FILE_YN` | CHAR(1) | `Y`=등록 / `N`=등록안됨 / `X`=대상아님 |

**FILE_YN 판정 우선순위**

1. `clm` 매칭 없음 → throw `DB_NOT_FOUND` (404)
2. `progress_status < 300` → `'X'`
3. `cfs_esign_id` 존재 → `'X'` (전자서명 진행건은 스캔본 대상 외)
4. `esign_customer_filename` 존재 → `'Y'`
5. 그 외 → `'N'`

⚠ xlsx 노트: *"AS-IS 기준으로 작성됨. TO-BE 기준으로 수정 필요."*

### 3.3 7. JOB목록조회 (IF-SM-007, Lawform → Difference)

우리가 Difference 솔루션에 호출하는 API. **본 작업의 핵심.**

**URL (xlsx 7번 v0.2 명세)**

| 환경 | URL |
|------|-----|
| 개발 | `http://58.180.215.190:8100/cm/rest/BRS_SM_CLM_JobList` |
| 운영 | `https://difference.lgad.lg.co.kr/cm/rest/BRS_SM_CLM_JobList` |

actID: `BRS_SM_CLM_JobList`, METHOD: `POST`, baRs: `OUT_RESULT,OUT_DATA`.

**IN_DATA** (검색조건, 모두 선택 — 빈 문자열이면 전체)

| Field | Type | Description |
|-------|------|-------------|
| `JOB_NO` | String | JOB번호 |
| `JOB_NM` | String | JOB명 |

**OUT_RESULT**

| Field | Type | Description |
|-------|------|-------------|
| `STATUS` | String | `S`=성공 / `E`=실패 (E 시 `DIFFERENCE_REQUEST_FAILED` throw) |
| `CODE` | String | 메시지 코드 |
| `MSG` | String | 메시지 |
| `COUNT` | Int | 총 row 수 |
| `PAGE` | Int | 페이지 |
| `OFFSET` | Int | ROW수 |

**OUT_DATA** (배열)

| Field | Type | Description |
|-------|------|-------------|
| `JOB_NO` | String | JOB번호 |
| `JOB_NM` | String | JOB명 |

**JSON 예시 (xlsx 7번 명세 노트)**

요청:
```json
{
  "header": {
    "actID": "BRS_SM_CLM_JobList",
    "baRq": "IN_DATA",
    "baRs": "OUT_RESULT,OUT_DATA"
  },
  "body": {
    "IN_DATA": [{ "JOB_NO": "", "JOB_NM": "" }]
  }
}
```

응답:
```json
{
  "header": { /* ... */ },
  "body": {
    "OUT_RESULT": [{ "STATUS": "S", "CODE": "...", "MSG": "...", "COUNT": 300 }],
    "OUT_DATA": [
      { "JOB_NO": "PKR220001-J012", "JOB_NM": "VMD플러스 22년 2월 엘지전자 제작비 이자비용(1월분)" },
      { "JOB_NO": "PKR220001-J005", "JOB_NM": "VMD플러스 22년 1월 엘지전자 제작비 이자비용(21년12월분)" }
    ]
  }
}
```

**호출 정책 (2026-05-14 디퍼런스측 채팅 확정)**

- **권한 체크 없음** — Difference 측은 7번에서 사용자별 필터링 / 권한 검사를 하지 않음. 기존에도 검색조건 외 다른 조건은 없었음.
- **사용자 정보 동봉 없음** — email / IAM ID 등 추가 식별값 전달 불필요. xlsx 7번 명세에 정의된 필드만 보냄.
- **인증** — 일단 무가드. `Difference` 클래스의 send 헤더 자리에 `// TODO[HJJ]: ...` 주석으로 표시. 테스트 시 필요해지면 토큰 추가.
- **차수 필드** — 우리는 차수 개념 없음. 호출 시 **필드 자체를 제거** 하고 전송. 응답에 포함되어 와도 무시.

### 3.4 6. 계약검토완료건등록 (IF-SM-006, Lawform → Difference, push)

HSAD 회계팀의 **수익인식 프로세스 기반 데이터 적재용**. 우리가 계약 검토 완료된 건의 정보를 Difference 로 push → 디퍼런스 측이 적재 → 수익인식 처리.

**URL (xlsx 6번 v0.2 명세)**

| 환경 | URL |
|------|-----|
| 개발 | `http://58.180.215.190:8100/cm/rest/BRS_SM_CLM_SaveReviewed` |
| 운영 | `https://difference.lgad.lg.co.kr/cm/rest/BRS_SM_CLM_SaveReviewed` |

actID: `BRS_SM_CLM_SaveReviewed`, METHOD: `POST`, baRs: `OUT_RESULT`.

**OUT_RESULT**

| Field | Type | Description |
|-------|------|-------------|
| `STATUS` | String | `S`=성공 / `E`=실패 |
| `CODE` | String | 메시지 코드 |
| `MSG` | String | 메시지 |

(비동기 fire-and-forget 이라 응답은 무시 / `Log.error` 만 — §3.4 호출 정책 참조)

#### 트리거 위치

`apps/api/containers/clm.js:2868` `Clm_UpdateProgressStatus_FinalReviewComplete`.

**`progress_status = FINAL_APPROVAL(275) → FINAL_APPROVAL_COMPLETE(280)` 정상 전이 케이스만 push.**

- `ClmUpdateAndReturnController` + `ClmLogCreate` 직후에 호출 삽입.
- `is_termination_file_upload_enabled !== YES` 단축 분기 (해지 계약 등 `FINISHED(450)` 직행) 는 **push 대상 외**.
- `is_separately=YES` 별도체결 사후등록 건도 현재는 **push 대상 외** — 필요 시 별도체결 등록 완료 지점에 트리거 추가 TODO 만 남김.

#### IN_DATA 매핑 (xlsx 6번 v0.2 — 12 필드, 모두 String)

`serializers/difference.js` `getDifferencePushBodyJson` 가 다음 매핑으로 IN_DATA row 생성:

| Field | 의미 | 매핑 |
|-------|------|------|
| `CLM_SEQ` | 법무일련번호 | `clm.id` |
| `NEW_FLAG` | 신규/변경 구분 | `'NEW'` 또는 `'CHG'` (아래 NEW_FLAG 절 참조) |
| `ADER_CD` | 광고주코드 | `''` (TODO: MDM 연동 후 `clm_customer.mdm_index` 컬럼 추가 + 매핑) |
| `ADER_NM` | 광고주명 | `clm.clm_customers[0].business_name` |
| `CONTRACT_NM` | 계약서명 | `clm.name` |
| `STRT_DT` | 계약시작일자 | `clm.contract_start_date` → `YYYYMMDD` |
| `END_DT` | 계약종료일자 | `clm.contract_end_date` → `YYYYMMDD` |
| `CONT_DT` | 법무계약체결일자 | `clm.contract_date` → `YYYYMMDD` |
| `CONT_EMP_NO` | 법무계약체결담당자사번 | `''` (TODO: 추후 디퍼런스측 사번 요구 시 `legal_item.user.iam_usid` 매핑) |
| `CONT_EMP_NM` | 법무계약체결담당자명 | `legal_item.user.name` |
| `CONT_DEPT_CD` | 법무계약체결담당부서코드 | `legal_item.team_organization.iam_org_cd` |
| `CONT_DEPT_NM` | 법무계약체결담당부서명 | `legal_item.team_organization.name` |

`legal_item` = `clm.clm_parallel_review.clm_parallel_review_item` 중 `team_organization.is_legal === CF_PROFILE_TEAM_IS_LEGAL.YES` 인 항목들을 `sequence ASC` 정렬해 첫번째. 0개면 throw (정상 플로우 보장 위반).

#### NEW_FLAG 판정

`db.clm_log.count({ clm_id, clm_progress_status: 280, is_del: 1 })` 결과로 결정:
- count === 1 → `'NEW'` (이번이 첫 도달. push 직전에 만든 log row 1건)
- count > 1 → `'CHG'` (마스터 rollback 후 재도달)

⚠ `'CHG'` 값 자체가 디퍼런스측에서 받는 값과 일치하는지 확인 필요 (xlsx 예시엔 `"NEW"` 만 표기). 임시로 `'CHG'` + `// TODO[HJJ]: 디퍼런스측 정확한 변경 코드 확인` 주석.

#### 호출 정책

- **비동기 fire-and-forget** — Difference 호출 실패가 Lawform 최종결재 완료를 막지 않음. 실패는 `Log.error` 만, 재시도/큐 본 단계 미적용.
- **idempotency**: 별도 `pushed_at` 컬럼 추가하지 않음. 현 함수의 `progress_status !== FINAL_APPROVAL` throw 가드 (`CLM_INVALID_PROGRESS`) 에 의존해 1회만 통과되는 점을 신뢰.
- **인증**: 무가드 + `// TODO[HJJ]:` (1-1/1-2/3/4/5/7 과 동일).

---

## 4. 플로우

### 4.1 전체 흐름 (요약)

```
[FE] CLM 상세 화면에서 'JOB 연결' 버튼 클릭
   ↓
[GET /api/clm/difference/job/list?clm_id=...]
   → BE 가 Difference '7.JOB목록조회' 호출 → 결과를 Difference 클래스의 직렬화 메서드로 변환 → 응답
   ↓
[FE] 리스트에서 JOB(JOB) 1건 선택
   ↓
[PUT /api/clm/update/difference_job_no]
   body: { clm_id, job_no }
   → 권한 가드 (요청자 or 마스터) + 상태 가드 (progress_status >= 250)
   → clm.difference_job_no UPDATE
   → Difference 측 통보 없음 (그쪽에서 굳이 알 필요 없다고 함)
   ↓
[CLM 상세 화면] difference_job_no 문자열만 표시
```

### 4.2 가드 / 권한

#### 4.2.1 권한 (수정 가능 주체)

- **요청자** (`clm.user_id` = 작성자) **또는** **마스터** (`users.team_is_master = 2`) 만 가능.
- 위반 시 `NO_ACTION_USER_PERMISSION` throw.

#### 4.2.2 CLM 상태 가드

- **`progress_status >= 250 && progress_status !== 500 && progress_status !== 600`** 일 때만 JOB 연결 가능.
  - 기준: `250 (LEGAL_REVIEW_COMPLETE 법무 검토 완료)` 이상의 정상 진행건만 허용.
  - 제외: `500 (계약 중단)`, `600 (요청 취소)` — 종결·비정상 상태에서는 JOB 연결 차단.
- 별도체결(`is_separately=YES`) 의 사후 등록 케이스는 `1(DRAFT) → 400(계약 이행 중)` 이동 흐름이므로 위 조건에 자동 포함됨 (별도 분기 불필요).

#### 4.2.3 변경 / 해제

- 다른 JOB 로 **덮어쓰기 허용**.
- `job_no = NULL` (해제) **허용** — 단, 향후 명세 구체화 시 정책 변경 가능성 있어 코드상 `// TODO[HJJ]:` 주석으로 표시.
- null / empty 진입 처리는 **request validator 단계에서 통과** 시키고 **controller 분기에서 막거나 허용** (정책 변경에 유연하게 대응).

#### 4.2.4 로그 / 알림

- `clm_log` 기록 **없음**.
- 알림 발송 **없음**.

---

## 5. 엔드포인트

### 5.1 `GET /api/clm/difference/job/list` — JOB 목록 조회

```ts
Request:  { clm_id: number, keyword?: string }
Response: { items: Array<{ job_no: string, /* xlsx 7번 명세 필드 */ }> }
```

- 내부적으로 `Difference.getJobList(...)` (가칭) 호출 → 응답을 클래스 내부 직렬화 메서드로 변환.
- 권한 가드 §4.2.1 (요청자 or 마스터) 적용.

### 5.2 `PUT /api/clm/update/difference_job_no` — JOB 번호 업데이트

```ts
Request:  { clm_id: number, job_no: string | null }
Response: { clm: { id, difference_job_no } }
```

- `clm.id` 존재 검증 → 없으면 `DB_NOT_FOUND`.
- 권한 가드: §4.2.1 (요청자 or 마스터).
- 상태 가드: §4.2.2 (`progress_status >= 250`).
- null 처리: validator 통과 + controller 분기 (§4.2.3).
- `clm.difference_job_no = job_no` UPDATE.
- `clm_log` 기록 없음, 알림 없음.

### 5.3 Difference → Lawform inbound — 1-1 / 1-2 / 3 / 4 / 5

`apps/api/entrypoint/lawform/hsad/difference/` 디렉터리에 endpoint 5종 신규. `route.hsad.difference.js` 에 마운트. prefix `/api/hsad/difference/*`. 인증 무가드 + `// TODO[HJJ]:` (§3.2).

각 endpoint 의 JOB_NO validator 정책 / 응답 직렬화는 §3.2 참조. 4번 의 상태 가드·동작은 §3.2 의 "4번 추가 세부" 참조.

### 5.4 Lawform → Difference push — 6번

`Clm_UpdateProgressStatus_FinalReviewComplete` (containers/clm.js:2868) 내부에서 `Difference` 클래스의 push 메서드 호출. 트리거 조건·정책은 §3.4 참조.

---

## 6. 현재 코드 상태

### 6.1 신설 / 수정 대상 파일

| 경로 | 변경 |
|------|------|
| `apps/api/libs/hsad/connector.js` | **신규** — 외부 호출 공통 base class. send / 헤더 / Log 표준화 |
| `apps/api/libs/hsad/difference.js` | `connector` 상속, `export` 추가, JOB 목록조회 + 6번 push + 응답 직렬화 메서드 신규, `send()` 정상화 |
| `apps/api/libs/hsad/mdm.js` | `connector` 상속, `export` 추가, `send()` 정상화, `_cacheData` 제거 |
| `apps/api/entrypoint/lawform/clm/list.difference_job.clm.js` (가칭) | 신규 — `GET /api/clm/difference/job/list` |
| `apps/api/entrypoint/lawform/clm/update.difference_job_no.clm.js` (가칭) | 신규 — `PUT /api/clm/update/difference_job_no` |
| `apps/api/entrypoint/lawform/clm/route.clm.js` | 위 2개 라우트 등록 |
| `apps/api/entrypoint/lawform/hsad/difference/route.hsad.difference.js` | **신규** — 1-1 / 1-2 / 3 / 4 / 5 라우트 마운트 |
| `apps/api/entrypoint/lawform/hsad/difference/*.js` | **신규** — 1-1 / 1-2 / 3 / 4 / 5 endpoint 각각 (5종) |
| `apps/api/containers/clm.js` (`Clm_UpdateProgressStatus_FinalReviewComplete`) | 6번 push 호출 삽입 — 정상 280 전이 케이스만, 비동기 fire-and-forget |
| `apps/api/configs/error.js` (또는 위치) | `MDM_REQUEST_FAILED`, `DIFFERENCE_REQUEST_FAILED` 신규 |

이미 반영 완료:
- `apps/api/database/models/clm.js` — `difference_job_no` 컬럼 매핑
- `apps/api/serializers/clm.js` — 응답 직렬화
- `apps/api/database/migrate_sqls/202605071100_add_columns_clm_final_approval.sql`, `202605081550_modify_clm_difference_job_no.sql` — 컬럼 추가 + 오타 RENAME

### 6.2 `connector.js` 베이스 클래스 (§C-1)

`apps/api/libs/hsad/connector.js` — 외부 시스템 호출 공통 base. `Mdm`, `Difference` 등이 상속.

- 공통 `send()` — fetch wrapper (GET 은 `url.searchParams`, POST 는 `JSON.stringify` + `Content-Type: application/json`).
- Log 정책: 호출 요청 `Log.debug`, 4xx 응답 `Log.warn`, 5xx 응답 / 예외 `Log.error`.
- 모니터링·알람 (Slack 등) 없음 — 본 연동 범위 외.

### 6.3 에러 코드 (§C-2)

- `MDM_REQUEST_FAILED` — MDM 호출 실패 (모든 외부 호출 에러).
- `DIFFERENCE_REQUEST_FAILED` — Difference 호출 실패 (모든 외부 호출 에러).
- HTTP status / 메시지 매핑은 기존 `CF_ERROR_STATUS` 컨벤션 그대로.
- 더 세분화 (`*_TIMEOUT`, `*_AUTH_FAILED`) 는 본 단계 미적용 — 명세 구체화 후 재검토.
- `Log.*` 호출 (§6.2) 로 원인 추적 보조.

### 6.4 환경 변수

- `CF_DIFFERENCE_BASE_URL` — Difference 시스템 base URL (필수).
  - 이전 `CF_DIFFERENCE_BASE_URL` (오타: 2 r's) 에서 `CF_DIFFERENCE_BASE_URL` (2 f's) 로 정정. 운영 환경 env 갱신 필요.
- `CF_MDM_BASE_URL` — MDM 시스템 base URL (필수).

---

## 7. 미결 항목

[REQUEST.md](./REQUEST.md) 참조. 본 SPEC 작성 시점 기준 남은 항목:

- **A 섹션 (MDM)**: API 명세서 수령 대기 — 명세서 수령 시점에 일괄 반영.
