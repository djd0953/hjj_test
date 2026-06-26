import type { Request, Response } from 'express'
import { findPreset, PRESETS, type Preset } from '../users'
import { createLoginResponseFromPicker } from '../idp'

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function resolvePreset(req: Request): Preset {
  const customSsoId = ((req.body.customSsoId as string | undefined) ?? '').trim()
  const customEmail = ((req.body.customEmail as string | undefined) ?? '').trim()

  if (customSsoId) {
    return {
      key: 'custom',
      label: 'custom',
      ssoId: customSsoId,
      email: customEmail || `${customSsoId}@hsad.co.kr`,
      description: 'custom input',
    }
  }

  const presetKey = (req.body.preset as string | undefined) ?? PRESETS[0].key
  const found = findPreset(presetKey)
  if (!found) {
    throw new Error(`Unknown preset: ${presetKey}`)
  }
  return found
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const requestId = (req.body.InResponseTo as string | undefined) ?? ''
  const acsUrl = (req.body.ACSUrl as string | undefined) ?? ''
  const issuer = (req.body.Issuer as string | undefined) || undefined
  const relayState = (req.body.RelayState as string | undefined) ?? ''

  if (!requestId || !acsUrl) {
    res.status(400).send('Missing InResponseTo or ACSUrl')
    return
  }

  let preset: Preset
  try {
    preset = resolvePreset(req)
  } catch (e) {
    res.status(400).send((e as Error).message)
    return
  }

  let resp: Awaited<ReturnType<typeof createLoginResponseFromPicker>>
  try {
    resp = await createLoginResponseFromPicker({
      preset,
      request: { id: requestId, acsUrl, issuer },
      relayState,
    })
  } catch (e) {
    console.error('[login] createLoginResponse failed', e)
    res.status(500).send(`SAMLResponse build failed: ${(e as Error).message}`)
    return
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(renderAutoSubmit({
    acsUrl: resp.acsUrl,
    samlResponseB64: resp.samlResponseB64,
    relayState: resp.relayState ?? '',
  }))
}

function renderAutoSubmit(args: {
  acsUrl: string
  samlResponseB64: string
  relayState: string
}): string {
  const { acsUrl, samlResponseB64, relayState } = args
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Posting…</title></head>
<body onload="document.forms[0].submit()">
  <noscript><p>JavaScript 비활성. "Continue" 버튼을 눌러주세요.</p></noscript>
  <form method="POST" action="${htmlEscape(acsUrl)}">
    <input type="hidden" name="SAMLResponse" value="${htmlEscape(samlResponseB64)}" />
    <input type="hidden" name="RelayState" value="${htmlEscape(relayState)}" />
    <noscript><button type="submit">Continue</button></noscript>
  </form>
</body></html>`
}
