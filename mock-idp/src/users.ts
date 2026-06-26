export type Preset = {
  key: string
  label: string
  ssoId: string | null
  email: string
  description: string
}

export const PRESETS: Preset[] = [
  {
    key: 'active',
    label: '✅ 정상 활성 사용자',
    ssoId: 'A12345',
    email: 'user@hsad.co.kr',
    description: "SP 측 users.iam_usid='A12345' 매칭 가정",
  },
  {
    key: 'unprovisioned',
    label: '⚠️ 미동기화 사용자',
    ssoId: 'Z99999',
    email: 'ghost@hsad.co.kr',
    description: 'SP 측 users 에 없는 케이스 → HSAD_USER_NOT_PROVISIONED 검증',
  },
  {
    key: 'inactive',
    label: '⛔ 비활성(삭제) 사용자',
    ssoId: 'D00001',
    email: 'deleted@hsad.co.kr',
    description: 'SP 측 users.is_del=0 (활성 조건 미충족) 검증',
  },
  {
    key: 'missing-ssoid',
    label: '🧪 ssoId 누락',
    ssoId: null,
    email: 'noid@hsad.co.kr',
    description: 'AttributeStatement 에서 ssoId 자체 제외 → SAML_MISSING_SSO_ID 검증',
  },
]

export function findPreset(key: string): Preset | undefined {
  return PRESETS.find((p) => p.key === key)
}
