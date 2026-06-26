import zlib from 'zlib';

import type { Request, Response } from 'express';

import { config } from '../config';
import { PRESETS } from '../users';

type ParsedAuthnRequest = {
  id: string
  issuer?: string
  acsUrl?: string
}

function htmlEscape(s: string): string 
{
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function attr(xml: string, attrName: string): string | undefined 
{
    const re = new RegExp(`${attrName}\\s*=\\s*"([^"]*)"`);
    const m = xml.match(re);
    return m ? m[1] : undefined;
}

function elemText(xml: string, localName: string): string | undefined 
{
    const re = new RegExp(`<(?:[\\w]+:)?${localName}\\b[^>]*>([\\s\\S]*?)</(?:[\\w]+:)?${localName}>`);
    const m = xml.match(re);
    return m ? m[1].trim() : undefined;
}

function parseAuthnRequestXml(xml: string): ParsedAuthnRequest 
{
    const id = attr(xml, 'ID') ?? '';
    if (!id) 
    {
        throw new Error('AuthnRequest: missing ID attribute');
    }
    const acsUrl = attr(xml, 'AssertionConsumerServiceURL');
    const issuer = elemText(xml, 'Issuer');
    return { id, acsUrl, issuer };
}

function decodeSAMLRequest(raw: string, binding: 'post' | 'redirect'): string 
{
    const buf = Buffer.from(raw, 'base64');
    if (binding === 'redirect') 
    {
        return zlib.inflateRawSync(buf).toString('utf8');
    }
    return buf.toString('utf8');
}

export function ssoServiceHandler(req: Request, res: Response): void 
{
    const isPost = req.method === 'POST';
    const samlRequestB64 = (isPost ? req.body.SAMLRequest : req.query.SAMLRequest) as
    | string
    | undefined;
    const relayState = ((isPost ? req.body.RelayState : req.query.RelayState) as string | undefined) ?? '';

    if (!samlRequestB64) 
    {
        res.status(400).send('Missing SAMLRequest');
        return;
    }

    let parsed: ParsedAuthnRequest;
    try 
    {
        const xml = decodeSAMLRequest(samlRequestB64, isPost ? 'post' : 'redirect');
        parsed = parseAuthnRequestXml(xml);
    }
    catch (e) 
    {
        res.status(400).send(`Invalid SAMLRequest: ${(e as Error).message}`);
        return;
    }

    const acsUrl = parsed.acsUrl || config.spAcsUrl;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderPicker({
        requestId: parsed.id,
        issuer: parsed.issuer,
        acsUrl,
        relayState
    }));
}

function renderPicker(args: {
  requestId: string
  issuer?: string
  acsUrl: string
  relayState: string
}): string 
{
    const { requestId, issuer, acsUrl, relayState } = args;

    const presetRows = PRESETS.map((p, i) => 
    {
        const checked = i === 0 ? 'checked' : '';
        const ssoId = p.ssoId ?? '(omitted)';
        return `
      <label class="row">
        <input type="radio" name="preset" value="${htmlEscape(p.key)}" ${checked} />
        <div class="row-body">
          <div class="row-label">${htmlEscape(p.label)}</div>
          <div class="row-meta"><code>ssoId=${htmlEscape(ssoId)}</code> · <code>${htmlEscape(p.email)}</code></div>
          <div class="row-desc">${htmlEscape(p.description)}</div>
        </div>
      </label>`;
    }).join('');

    return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>Mock HSAD IdP — Login</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; color: #222; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .sub { color: #888; font-size: 13px; margin-bottom: 24px; }
  .req { background: #fafafa; border: 1px solid #eee; padding: 12px 14px; border-radius: 6px; font-size: 12px; margin-bottom: 24px; }
  .req code { background: #fff; padding: 1px 4px; border-radius: 3px; border: 1px solid #eee; }
  .row { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border: 1px solid #e5e5e5; border-radius: 6px; margin-bottom: 8px; cursor: pointer; }
  .row:hover { background: #fafafa; }
  .row input[type=radio] { margin-top: 4px; }
  .row-label { font-weight: 600; margin-bottom: 4px; }
  .row-meta { font-size: 12px; color: #555; margin-bottom: 4px; }
  .row-desc { font-size: 12px; color: #888; }
  .custom { margin-top: 16px; padding: 12px 14px; border: 1px dashed #ccc; border-radius: 6px; }
  .custom label { font-size: 13px; display: block; margin-bottom: 6px; }
  .custom input[type=text] { width: 100%; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; font-family: monospace; }
  button { margin-top: 20px; padding: 10px 16px; background: #2563eb; color: #fff; border: 0; border-radius: 6px; font-size: 14px; cursor: pointer; }
  button:hover { background: #1d4ed8; }
</style>
</head>
<body>
  <h1>Mock HSAD IdP</h1>
  <div class="sub">로컬 SAML mock — 사용자 선택 후 Login 누르면 SP ACS 로 SAMLResponse POST</div>

  <div class="req">
    <div><b>Issuer:</b> <code>${htmlEscape(issuer ?? '(none)')}</code></div>
    <div><b>AuthnRequest ID:</b> <code>${htmlEscape(requestId)}</code></div>
    <div><b>ACS URL:</b> <code>${htmlEscape(acsUrl)}</code></div>
    <div><b>RelayState:</b> <code>${htmlEscape(relayState || '(none)')}</code></div>
  </div>

  <form method="POST" action="/idp/saml/login">
    <input type="hidden" name="RelayState" value="${htmlEscape(relayState)}" />
    <input type="hidden" name="InResponseTo" value="${htmlEscape(requestId)}" />
    <input type="hidden" name="ACSUrl" value="${htmlEscape(acsUrl)}" />
    <input type="hidden" name="Issuer" value="${htmlEscape(issuer ?? '')}" />

    ${presetRows}

    <div class="custom">
      <label>임의 <code>ssoId</code> / <code>email</code> 직접 입력 (값이 채워져 있으면 위 preset 무시)</label>
      <input type="text" name="customSsoId" value="A99999" autocomplete="off" />
      <label style="margin-top:8px;">email</label>
      <input type="text" name="customEmail" value="hjj0106+10@amicuslex.net" autocomplete="off" />
    </div>

    <button type="submit">Login</button>
  </form>
</body>
</html>`;
}
