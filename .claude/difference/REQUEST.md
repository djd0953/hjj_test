# MDM / Difference 연동 — 미결 질문 모음

> 확정 답변은 본 파일에서 제거되고 [SPEC.md](./SPEC.md) (또는 [`../mdm-be/SPEC.md`](../mdm-be/SPEC.md)) 에 반영됨. 본 파일에는 **아직 답이 안 나온 항목만** 남김.
>
> 답변이 들어오면 → 해당 항목을 SPEC.md 로 옮기고 본 파일에서 제거.

---

## 2026-05-14 디퍼런스측 채팅 결과 (참고용)

> 본 채팅으로 B 섹션 대부분이 확정 — 상세는 [SPEC.md](./SPEC.md) 참조.

- **6번 (계약검토완료건등록) 목적·방향**: HSAD 회계팀 수익인식 프로세스 기반 데이터 적재용 / 방향은 **Lawform → Difference**.
- **7번 (JOB목록조회)**: 전체 JOB 반환, 권한 체크 / 사용자 필터링 / 헤더 사용자 정보 모두 불필요.
- **JOB_NO ↔ job_no**: "원래는 다른 의미인데 저희 연동시에는 같은거" → 동일 식별자 취급.
- **1-1 / 1-2 / 4 / 5**: `JOB_NO` 필수 (validator 로 막아도 OK).
- **3**: 검색조건, `JOB_NO` 필수 아님.
- **신규 명세 `1-2.계약검토완료진행현황`**: 본 작업 범위 포함, 1-1 과 동일 처리.
- **일정**: 디퍼런스측 서버 가상환경 재구축 중 → 늦어도 차주(~2026-05-22) 테스트 가능, 디퍼런스측은 2026-06-초 까지 개발 완료 필요 (월말/월초 영업 3일 마감 회피).

---

## A. MDM (`hsad-features/mdm-be/`)

> A-1 ~ A-6 은 **모두 명세서 수령 후 확정** — 사용자가 자리에 그대로 둬달라고 요청. 명세서 도착 시 일괄 갱신.

### 🔴 A-1. API 명세서 수령 일정

명세서를 준다고 했으나 미수령 상태. 수령 ETA 및 담당자 확인 필요.

### 🔴 A-2. Route / Method 확정

| 메서드 | 현재 (임시) | 확정 필요 |
|--------|-------------|----------|
| 거래처 목록 조회 | `GET mdm/list` | 실제 경로 / HTTP method |
| 블랙리스트 여부 확인 | `POST mdm/check` | 실제 경로 / HTTP method |

### 🔴 A-3. 입력 schema 상세

구두 합의는 다음과 같으나, 필드명 / 타입 / 필수 여부의 정확한 정의 필요.

- 거래처 목록: `(법인/개인사업자명 OR 개인 이름) AND (법인/개인사업자 번호 OR 개인 생년월일)`
  - 개인/법인 구분자가 별도 enum 으로 존재하는지, 아니면 필드 조합으로 자동 판별인지?
  - 생년월일 포맷 (`YYYYMMDD` / `YYYY-MM-DD` / 기타)?
  - 사업자번호 포맷 (하이픈 포함 / 미포함)?
- 블랙리스트 확인: `법인/개인사업자 번호 AND (개인 성명 OR 법인/개인사업자명) AND (개인) 생년월일`
  - 개인 여부 판단 자동인지, 별도 type 필드 필요한지?

### 🔴 A-4. 응답 schema

- 거래처 목록의 각 항목이 어떤 필드를 포함하는가? (대표자명 / 주소 / 업종 등)
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

### 🟡 A-7. `getList` endpoint 세부 (entrypoint 단계)

호출 지점·signature 는 [`../mdm-be/SPEC.md` §3.2](../mdm-be/SPEC.md) 에 정리됨. 다음은 entrypoint 작성 시 결정 필요:

1. 두 query (`name`, `business_number`) 모두 **필수**? 하나만 받아도 호출 허용 (그 경우 missing 쪽은 빈 문자열로 MDM 에 전달)? **[완전구현]**
2. MDM 응답 schema 가 미수령이라, BE 는 일단 응답을 **그대로 pass-through** 로 내려주면 되는지? 또는 우리 `clm_customer` 직렬화 포맷으로 가공? **[완전구현 + 명세대기]**
3. 모달에서 사용자가 결과 1건을 **선택**한 뒤의 후속 동작 — 거래처 등록 폼 자동 채우기 / 곧바로 `clm_customer` INSERT / CLM 에 연결 중 어느 쪽? **[완전구현]**

---

## B. Difference (`hsad-features/difference/`)

B-1 ~ B-14: 모두 확정 → [SPEC.md](./SPEC.md) 반영 완료.

> **2026-05-14 갱신**: 4번 / 6번도 본 작업 범위 포함으로 확정 (기존 제외 → 포함). 상세는 SPEC §3.2 (4번) / §3.4 (6번) / §5.3 / §5.4 / §6.1 참조.

### 🟢 B-15. xlsx 필드 ↔ CLM 도메인 매핑 (1-1 / 1-2 / 5 / 6) — 완료

전 항목 답변 완료 + 코드 반영 완료 (각 endpoint stub 실제 query/serialize 채움 + Difference.buildContractCompletionBody 갱신 + Clm_UpdateProgressStatus_FinalReviewComplete 의 NEW_FLAG 분기 추가).

남은 외부 확인 항목 (작업 보류, 디퍼런스측 답변 받으면 1줄 교체):
- `'CHG'` 코드값 — xlsx 예시엔 `"NEW"` 만 명시. 디퍼런스측 정확한 변경 코드 확인 필요 (e.g. 'CHG' / 'UPD' / 'MOD'). 현재 `'CHG'` 로 구현 + TODO 마커.

아래는 답변 이력 (참고용 — 본 파일 정리 시 같이 삭제 가능):

xlsx 명세 (필드명·메서드·URL) 는 모두 SPEC 에 반영 완료. 남은 건 **xlsx OUT 필드 → 우리 CLM DB 칼럼 매핑** 결정. 추측 진행 시 잘못된 데이터를 보낼 위험 큼.

#### B-15-1. 1-1 응답 매핑 (OUT_DATA 10 필드)

`apps/api/entrypoint/lawform/hsad/difference/list.review_completed.difference.js`

| xlsx 필드 | 의미 | 매핑 후보 | 확정? |
|----------|------|----------|------|
| CTRT_NJOB | JOB번호 | `clm.difference_job_no` | ✅ |
| CTRT_CODE | 법무일련번호 | `clm.id` | ✅ |
| CTRT_STEP | 차수 | `''` (우리 시스템 미지원) | ✅ |
| CTRT_TITL | 계약명 | `clm.name` | ✅ |
| CTRT_TYPE_NM | 계약유형 | `clm_category.name` / `clm.type` / 결합? | ❓ |
| CTRT_RQUN | 요청자명 | `clm.user.name` | ✅ |
| CTRT_RQDT | 요청일자(yyyymmdd) | `clm.created_at` 포맷팅 | ✅ |
| CTRT_CGUN | 검토자명 | `clm.legal_user.name` | ✅ |
| CTRT_STAT_NM | 진행단계명 | `CF_CLM_PROGRESS_KEY[clm.progress_status]` | ✅ |
| FILE_YN | 첨부파일유무 | `clm_attachment` 존재 여부 (어떤 type?) | ❓ |

조회 조건: `difference_job_no = JOB_NO AND progress_status >= 250 AND is_del = 1` 로 OK?

A:  
- 차수는 그냥 없애버려 보내지도 마.
- 계약 유형은 clm.clm_category.name
- 첨부 파일 유무는 clm_attachment가 1개 이상 있는지 유무 ('Y'|'N')

Q-followup (B-15-1):
1. `CTRT_STEP` "보내지도 마" → 응답 객체에서 **key 자체 제외** vs `CTRT_STEP: ''` **빈 문자열 송신** 중 어느쪽? xlsx 호환성 측면에선 빈 문자열 권장.
A: CTRT_STEP: undefined. 이거 안보낸다고 얘기 다 된거니까 보내지 마 key 자체 제외
2. 조회 조건 — `clm.difference_job_no = JOB_NO AND is_del = 1` 만? 또는 `progress_status >= 250` 도 함께? 본 API 가 "계약검토완료목록" 이므로 후자가 자연스러움.
A: 후자
3. `clm_attachment` 카운트 기준 — `is_del = 1` 인 row 가 1개 이상이면 Y, 그 외 N. 특정 type 만 봐야 한다면 알려주세요.
A: type != 3 AND is_del = 1 (3은 그룹웨어 연동 자료가 될거라서 뺌)

#### B-15-2. 1-2 응답 매핑 (OUT_DATA 5 필드)

`apps/api/entrypoint/lawform/hsad/difference/list.review_completed_progress.difference.js`

| xlsx 필드 | 의미 | 매핑 후보 |
|----------|------|----------|
| CTRT_STAT_NM | 진행단계명 | `CF_CLM_PROGRESS_KEY[log.clm_progress_status]` |
| HSTR_FRUN | 요청자명/이전단계 | ? log 작성자 / 이전 단계 결재자 |
| HSTR_TOUN | 검토자명/다음단계 | ? 다음 단계 결재자 |
| HSTR_DATE | 완료일자 | `log.created_at` |
| HSTR_DESC | 의견 | `log.content` |

진행 이력 source: `clm_log` 중 어떤 type/log_key 만? `SYSTEM(2)` 만? `APPROVAL_LINE(3)` 포함? log_key 화이트리스트?

A:
- 이거 자체를 clm_log로 보낼거야. clm_log.type 신경쓰지 말고 is_del = 1인건 모두 보내버려
- HSTR_FRUN은 보내지말고 HSTR_TOUN만 보내기로 했음. clm_log.user.name이 될거임

Q-followup (B-15-2):
1. `HSTR_FRUN` "보내지마" → 응답 key 제외 vs `HSTR_FRUN: ''` 빈 문자열? xlsx 호환성 측면에선 빈 문자열 권장.
A: key 제외
2. 정렬 순서 — `created_at ASC` (오래된 → 최신, 단계 진행 순) 권장. OK?
A: OK
3. `CTRT_STAT_NM` — `log.clm_progress_status` 가 `null` 인 log (단계 전이 X, 단순 코멘트 등) 도 포함되는데, 그 경우 `CTRT_STAT_NM` 은 빈 문자열로?
A: 빈 문자열로
4. `HSTR_DESC = log.content` — `log_placeholders` 합쳐서 보낼지, 그냥 `content` 만? `content` 만 권장 (단순).
A: content만

Q-followup-2 (B-15-2):
5. `clm_log.user` 가 부재 (soft-deleted / user_id NULL 등) — `HSTR_TOUN` 빈 문자열로 폴백? 또는 해당 log 자체 제외?
A: user join 조회 할 때 is_del 체크하지 말고 넣어줘. type이 SYSTEM이면 HSTR_TOUN에 '시스템'으로 넣어주고 그 외 user_id NULL의 경우 빈 문자열로 폴백

#### B-15-3. 5 응답 — FILE_YN 매핑

`apps/api/entrypoint/lawform/hsad/difference/check.scan_registration.difference.js`

- 'Y' (등록): 어떤 `clm_attachment.type` 이 존재하면?
- 'N' (등록안됨): clm 존재 + 위 첨부 없음
- 'X' (대상아님): ? clm 존재 X / progress_status 가 특정 값?

A: 일단 clm.progress_status는  >= 300 기준으로 하며 아닌 경우 'X' 대상아님으로 함
- clm.esign_id가 null이면서 clm.esign_customer_filename이 있으면 'Y'
- clm.esign_id가 null이면서 clm.esign_customer_filename이 없으면 'N'
- clm.esign_id가 있으면 'X' 대상 아님

Q-followup (B-15-3):
1. `clm.esign_id` — clm 모델에는 `esign_id` 컬럼이 보이지 않습니다. **`clm.cfs_esign_id`** 의 오타 / 다른 표현 인지 확인 부탁드립니다. (`cfs_esign_id` 가 우리 시스템의 전자서명 sequence FK)
A: clm.cfs_esign_id 오타
2. 조회 결과 `clm` 자체가 없을 때 (`difference_job_no = CTRT_NJOB` 매칭 없음) — 응답 어떻게? `FILE_YN: 'X'` (대상 아님) / 404 `DB_NOT_FOUND` / 다른 처리? 권장: `X` (대상 아님) 로 통일해 호출자 단순화.
A: clm 자체가 없을땐 throw 404 DB_NOT_FOUND
3. 우선순위 확인 — 다음 순서로 평가하면 됩니까?
   1. `progress_status < 300` → `X`
   2. `cfs_esign_id` 존재 → `X`
   3. `esign_customer_filename` 존재 → `Y`
   4. 그 외 → `N`
A:  이렇게 하면 됨

#### B-15-4. 6 push body — 미정 필드 3종

`apps/api/libs/hsad/difference.js` `Difference.buildContractCompletionBody`

| xlsx 필드 | 의미 | 매핑 후보 |
|----------|------|----------|
| ADER_CD | 광고주코드 | `clm_customer.business_number` / 별도 코드? |
| CONT_EMP_NO | 법무계약체결담당자사번 | `legal_user.iam_usid` / `legal_user.email`? |
| CONT_DEPT_CD | 법무계약체결담당부서코드 | `legal_user.team_organization.iam_org_cd`? |

`NEW_FLAG` 도 현재 `'NEW'` 고정 — 변경 케이스 (재신청 등) 분기 필요한가?

A: 
- MDM과 연동시 MDM에서 사용하는 거래처 코드 (인덱스)가 있을걸로 예상함. MDM에서 거래처 선택시 clm_customer에 해당 내용으로 거래처 추가 후 mdm index를 저장하는 컬럼을 만들고 그걸 광고주 코드로 함
- CONT_EMP_NO: 일단 null
- CONT_DEPT_CD: clm.clm_parallel_review.clm_parallel_review_item.map(item => item.type === 'LEGAL')[0].user.team_organization.iam_org_cd

Q-followup (B-15-4):
1. **NEW_FLAG** 분기 정의? 현재 `'NEW'` 고정으로 두면 됩니까? 변경 케이스 (재신청 / 정정 push 등) 가 발생하면 그때 분기 추가하는 식으로 OK?
2. **ADER_CD** 처리 — MDM 연동 전이라 매핑할 컬럼이 아직 없음. 다음 중 어느 쪽?
   - (a) 빈 문자열 `''` 로 보내고 `// TODO[HJJ]: MDM 연동 후 clm_customer.mdm_index 컬럼 추가 + 매핑` 주석
   - (b) `clm_customer.business_number` 등 임시 대체값 사용 후 명세 확정 시 교체
   - 권장: (a) — 잘못된 코드를 보내는 게 빈 문자열보다 위험.
A: 빈 문자열로 보내고 주석 달아줘
3. **CONT_EMP_NO `null`** — xlsx 명세상 모든 필드가 String 타입입니다. 실제 송신은 `null` 보다 **빈 문자열 `''`** 이 안전. OK?
A: 빈 문자열로 보내. 대신 주석 달아줘
4. **CONT_DEPT_CD 식 정정 필요** — 적어주신 `.map(item => item.type === 'LEGAL')[0]` 은 boolean 배열을 만들고 첫 항목을 가져옴 (의도와 다름). 의도하신 게 다음 둘 중 어느쪽?
   - (a) `clm.clm_parallel_review.clm_parallel_review_item.find(item => item.type === 'LEGAL').user.team_organization.iam_org_cd`
   - (b) `.filter(item => item.type === 'LEGAL')[0]....` 와 동등
   - 또한 `item.type` 의 enum 값은 string `'LEGAL'` 인지 / 정수 enum (e.g. `CF_CLM_PARALLEL_REVIEW_ITEM_TYPE.LEGAL`) 인지 확인 필요.
A: clm의 법무 검토 담당자 중 첫번째 사람의 team_organization 코드 가져와줘. 아까 답변 적을때는 user.team_organization으로 적었는데 지금 다시 생각해보니 clm_parallel_review_item.team_oraganization_id가 있던걸로 기억함
5. **CONT_EMP_NM / CONT_DEPT_NM 도 동일 source 로 변경?** 현재 코드는 `clm.legal_user.*` 기준 — CONT_DEPT_CD 만 `clm_parallel_review_item LEGAL` 로 가면 부서/담당자 source 가 어긋남.
   - (a) 모두 `clm_parallel_review_item LEGAL` 의 user 로 통일
   - (b) `clm.legal_user` 로 통일 (단, `team_organization.iam_org_cd` 가 부재 가능 → null 허용?)
   - 어느 쪽?
A: 동시 검토 로직 만들어서 지금은 legal_user 컬럼을 사용 안하게 됨. clm_parallel_review_item으로 가야 함
6. `clm.clm_parallel_review` / `clm_parallel_review_item` 이 부재하거나 LEGAL type 멤버가 없는 케이스에는 어떻게? 빈 문자열로 폴백? 아예 push 스킵?
A: clm_parallel_review_item에서 LEGAL type 멤버가 없는 경우 throw. 앞에서 논리적으로 필수 값이 빠진채로 진행된거라서 이미 이러면 안되는 케이스임

Q-followup-2 (B-15-4) — 모델 구조 확인 결과 추가 확정 필요:

7. **`clm_parallel_review_item.type` 컬럼은 존재하지 않습니다.** 모델 (`apps/api/database/models/clm_parallel_review_item.js`) 의 컬럼은 `clm_parallel_review_id / user_id / assigner_user_id / team_organization_id / sequence / status / current_action_owner_type / requested_at / ...` 뿐. JSDoc 코멘트에 명시: *"부서 식별은 `team_organization.is_legal` 로 LEGAL/비-LEGAL 구분"*.
   - → LEGAL 판별식은 `item.team_organization.is_legal === CF_PROFILE_TEAM_IS_LEGAL.YES (2)` 가 맞습니다.
   - → 사용자 답변의 `item.type === 'LEGAL'` 은 존재하지 않는 컬럼 참조. **이 식으로 진행 OK인지 확정** 부탁드립니다.
A: → LEGAL 판별식은 `item.team_organization.is_legal === CF_PROFILE_TEAM_IS_LEGAL.YES (2)` 가 맞습니다. -> 이 방법으로 해줘
8. **LEGAL 멤버 중 "첫번째" 정렬 기준?** 후보:
   - (a) `sequence ASC` — 결재 순서 (가장 자연스러움 / 권장)
   - (b) `created_at ASC`
   - (c) `id ASC`
A: a
9. **`team_organization` source 확정** — `item.team_organization` vs `item.user.team_organization` 어느쪽?
   - 적으신 두 표현 (`user.team_organization` / `item.team_organization_id`) 이 가리키는 곳이 다를 수 있음 (소속 부서 vs 검토 담당 부서).
   - 디퍼런스측 `CONT_DEPT_CD` 의 의도 (담당자의 소속 부서 vs 검토를 맡은 부서) 에 따라 갈림. 권장: **`item.team_organization`** (검토 담당 부서). OK?
A: item.team_organization으로 확정 -> 그냥 법무 검토 담당자의 부서 코드를 적는거야!!!!!!!!!!!!!!!
10. **CONT_EMP_NM / CONT_DEPT_NM 도 동일 LEGAL item 으로 변경**:
    - CONT_EMP_NM ← `legal_item.user.name`
    - CONT_DEPT_NM ← `legal_item.team_organization.name` (Q9 와 동일 source)
    - 동의?
A: 동의. CONT_EMP_NM / CONT_DEPT_CD / CONT_DEPT_NM 모두 동일 `legal_item` source 로 통일.

> 정리 (Q7~Q10 통합):
> 정상 플로우에서는 `clm_parallel_review_item` 중 `team_organization.is_legal === YES (2)` 인 항목이 **반드시 1개 이상** 존재함 (앞 단계에서 강제). 따라서 0개인 케이스는 버그 상황 — `throw` 로 명시적 예외 처리.
> 2개 이상인 경우 디퍼런스 측은 1명만 받으므로 **`sequence ASC` 첫번째 1명** 을 골라 다음 필드에 채움:
> - `CONT_EMP_NM` ← `legal_item.user.name`
> - `CONT_DEPT_CD` ← `legal_item.team_organization.iam_org_cd`
> - `CONT_DEPT_NM` ← `legal_item.team_organization.name`

11. **NEW_FLAG** 분기 — 마스터 rollback (`Clm_ProgressStatusRollback_Hsad`) 으로 280 미만으로 회귀 후 재진행 → 다시 280 도달하는 케이스 존재. 어떻게 NEW/CHG 구분?
A: **방안 B (clm_log 카운트) 채택.**
- `db.clm_log.count({ clm_id, clm_progress_status: FINAL_APPROVAL_COMPLETE(280), is_del: 1 })` 조회
- count === 1 → `'NEW'` (이번이 첫 도달, push 직전에 만든 log row 1건)
- count > 1 → `'CHG'` (rollback 후 재도달)
- 호출 시점: `ClmUpdate(...280)` + `ClmLogCreate(...280)` 직후, Difference push 직전.

⚠ 추가 확인 필요: `'CHG'` 값 자체가 디퍼런스측에서 받는 값과 일치하는지 (xlsx 예시엔 `"NEW"` 만 표기). 정확한 변경 코드 (e.g. `'CHG'` / `'UPD'` / `'MOD'`) 디퍼런스측에 확인 필요. → 임시로 `'CHG'` 로 구현 + `// TODO[HJJ]: 디퍼런스측 정확한 변경 코드 확인` 주석.

12. **CONT_EMP_NO 향후 매핑 — `users.iam_usid` (사번) 가능성**: 지금은 빈 문자열로 가지만, 추후 디퍼런스측이 사번 요구하면 `legal_item.user.iam_usid` 로 매핑 예상. 주석에 이 후보 명시해도 될까요?
A: 빈 문자열로 가고 주석처리만 해줘

---

답변 주시면 각 stub 의 `TODO[HJJ]: ... 매핑 확정 필요` 부분만 채우는 작은 단위로 마무리 가능합니다.