import 'dotenv/config'
import fs from 'fs'
import path from 'path'

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback
  if (v === undefined || v === '') {
    throw new Error(`Missing env: ${name}`)
  }
  return v
}

function resolveFromCwd(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p)
}

const rawPrivateKey = required('MOCK_IDP_PRIVATE_KEY_PATH', './certs/idp-private.pem')
const rawCert = required('MOCK_IDP_CERT_PATH', './certs/idp-cert.pem')

export const config = {
  port: Number(required('MOCK_IDP_PORT', '7000')),
  baseUrl: required('MOCK_IDP_BASE_URL', 'http://localhost:7000').replace(/\/$/, ''),
  idpEntityId: required('MOCK_IDP_ENTITY_ID', 'sso.hsad.co.kr'),
  spEntityId: required('MOCK_IDP_AUDIENCE', 'https://legal-api-dev.hsad.co.kr'),
  spAcsUrl: required(
    'MOCK_IDP_SP_ACS_URL',
    'https://legal-api-dev.hsad.co.kr/api/login/saml/callback',
  ),
  signResponse: (process.env.MOCK_IDP_SIGN_RESPONSE ?? 'false').toLowerCase() === 'true',
  privateKeyPath: resolveFromCwd(rawPrivateKey),
  certPath: resolveFromCwd(rawCert),
} as const

export function readPem(p: string): string {
  if (!fs.existsSync(p)) {
    throw new Error(
      `PEM file not found: ${p}\n` +
        `Run 'npm run gen-cert' to generate a self-signed cert.`,
    )
  }
  return fs.readFileSync(p, 'utf8')
}

export function certBodyForMetadata(pem: string): string {
  return pem
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s+/g, '')
}
