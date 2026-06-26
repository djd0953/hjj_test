import crypto from 'crypto';

import * as samlify from 'samlify';

import { config, readPem, certBodyForMetadata } from './config';
import type { Preset } from './users';

samlify.setSchemaValidator({
    validate: () => Promise.resolve('skipped')
});

const cert = readPem(config.certPath);
const privateKey = readPem(config.privateKeyPath);
const certB64 = certBodyForMetadata(cert);

const SSO_URL = `${config.baseUrl}/idp/saml/ssoservice.do`;
const SLO_URL = `${config.baseUrl}/idp/saml/ssoservice.do`;

const POST_BINDING = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST';
const REDIRECT_BINDING = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect';
const NAMEID_UNSPECIFIED = 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified';

const loginResponseTemplate = {
    context: [
        '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"',
        ' xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"',
        ' ID="{RESPONSE_ID}" Version="2.0" IssueInstant="{ISSUE_INSTANT}"',
        ' Destination="{DESTINATION}" InResponseTo="{IN_RESPONSE_TO}">',
        '<saml:Issuer>{ISSUER}</saml:Issuer>',
        '<samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status>',
        '<saml:Assertion ID="{ASSERTION_ID}" Version="2.0" IssueInstant="{ISSUE_INSTANT}">',
        '<saml:Issuer>{ISSUER}</saml:Issuer>',
        '<saml:Subject>',
        `<saml:NameID Format="${NAMEID_UNSPECIFIED}">{NAME_ID}</saml:NameID>`,
        '<saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">',
        '<saml:SubjectConfirmationData NotOnOrAfter="{NOT_ON_OR_AFTER}" Recipient="{RECIPIENT}" InResponseTo="{IN_RESPONSE_TO}"/>',
        '</saml:SubjectConfirmation>',
        '</saml:Subject>',
        '<saml:Conditions NotBefore="{NOT_BEFORE}" NotOnOrAfter="{NOT_ON_OR_AFTER}">',
        '<saml:AudienceRestriction><saml:Audience>{AUDIENCE}</saml:Audience></saml:AudienceRestriction>',
        '</saml:Conditions>',
        '<saml:AuthnStatement AuthnInstant="{ISSUE_INSTANT}" SessionIndex="{SESSION_INDEX}">',
        '<saml:AuthnContext><saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef></saml:AuthnContext>',
        '</saml:AuthnStatement>',
        '{ATTRIBUTE_STATEMENT}',
        '</saml:Assertion>',
        '</samlp:Response>'
    ].join(''),
    attributes: [] as never[]
};

export const idp = samlify.IdentityProvider({
    entityID: config.idpEntityId,
    privateKey,
    signingCert: cert,
    isAssertionEncrypted: false,
    wantAuthnRequestsSigned: false,
    singleSignOnService: [
        { Binding: POST_BINDING, Location: SSO_URL },
        { Binding: REDIRECT_BINDING, Location: SSO_URL }
    ],
    singleLogoutService: [{ Binding: POST_BINDING, Location: SLO_URL }],
    nameIDFormat: [NAMEID_UNSPECIFIED],
    loginResponseTemplate: loginResponseTemplate as never
});

export const sp = samlify.ServiceProvider({
    entityID: config.spEntityId,
    authnRequestsSigned: false,
    wantAssertionsSigned: true,
    wantMessageSigned: config.signResponse,
    isAssertionEncrypted: false,
    assertionConsumerService: [{ Binding: POST_BINDING, Location: config.spAcsUrl }]
});

function isoNow(offsetSec = 0): string 
{
    const d = new Date(Date.now() + offsetSec * 1000);
    return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function randomId(): string 
{
    return `_${crypto.randomBytes(20).toString('hex')}`;
}

function xmlEscape(s: string): string 
{
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function buildAttributeStatement(preset: Preset): string 
{
    const items: Array<{ name: string; value: string }> = [];
    if (preset.ssoId !== null) items.push({ name: 'ssoId', value: preset.ssoId });
    items.push({ name: 'email', value: preset.email });
    items.push({ name: 'pwdlastset', value: isoNow() });

    if (items.length === 0) return '';

    const parts = items.map(
        ({ name, value }) =>
            `<saml:Attribute Name="${xmlEscape(name)}" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">` +
      `<saml:AttributeValue xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">${xmlEscape(value)}</saml:AttributeValue>` +
      `</saml:Attribute>`
    );

    return `<saml:AttributeStatement>${parts.join('')}</saml:AttributeStatement>`;
}

export type RequestInfo = {
  id: string
  acsUrl: string
  issuer?: string
}

export async function createLoginResponseFromPicker(args: {
  preset: Preset
  request: RequestInfo
  relayState?: string
}): Promise<{ samlResponseB64: string; acsUrl: string; relayState?: string }> 
{
    const { preset, request, relayState } = args;

    const requestInfo = { extract: { request: { id: request.id }, issuer: request.issuer } };

    const ctx = await idp.createLoginResponse(
        sp,
    requestInfo as never,
    'post',
    {} as never,
    (template: string) => 
    {
        const responseId = randomId();
        const assertionId = randomId();
        const sessionIndex = randomId();
        const now = isoNow();
        const notBefore = isoNow(-60);
        const notOnOrAfter = isoNow(300);
        const nameId = preset.ssoId ?? 'unknown';
        const attributeStatement = buildAttributeStatement(preset);

        const filled = template
            .replace(/{RESPONSE_ID}/g, responseId)
            .replace(/{ASSERTION_ID}/g, assertionId)
            .replace(/{ISSUE_INSTANT}/g, now)
            .replace(/{DESTINATION}/g, xmlEscape(request.acsUrl))
            .replace(/{RECIPIENT}/g, xmlEscape(request.acsUrl))
            .replace(/{IN_RESPONSE_TO}/g, xmlEscape(request.id))
            .replace(/{ISSUER}/g, xmlEscape(config.idpEntityId))
            .replace(/{NAME_ID}/g, xmlEscape(nameId))
            .replace(/{AUDIENCE}/g, xmlEscape(config.spEntityId))
            .replace(/{NOT_BEFORE}/g, notBefore)
            .replace(/{NOT_ON_OR_AFTER}/g, notOnOrAfter)
            .replace(/{SESSION_INDEX}/g, sessionIndex)
            .replace(/{ATTRIBUTE_STATEMENT}/g, attributeStatement);

        return { id: responseId, context: filled };
    },
    false,
    relayState
    );

    return {
        samlResponseB64: ctx.context,
        acsUrl: request.acsUrl,
        relayState
    };
}

export function buildIdpMetadataXml(): string 
{
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${xmlEscape(config.idpEntityId)}">`,
        `<md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">`,
        '<md:KeyDescriptor use="signing">',
        '<ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data>',
        `<ds:X509Certificate>${certB64}</ds:X509Certificate>`,
        '</ds:X509Data></ds:KeyInfo>',
        '</md:KeyDescriptor>',
        `<md:SingleLogoutService Binding="${POST_BINDING}" Location="${xmlEscape(SLO_URL)}"/>`,
        `<md:NameIDFormat>${NAMEID_UNSPECIFIED}</md:NameIDFormat>`,
        `<md:SingleSignOnService Binding="${POST_BINDING}" Location="${xmlEscape(SSO_URL)}"/>`,
        `<md:SingleSignOnService Binding="${REDIRECT_BINDING}" Location="${xmlEscape(SSO_URL)}"/>`,
        '<saml:Attribute xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Name="email"/>',
        '<saml:Attribute xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Name="ssoId"/>',
        '<saml:Attribute xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Name="pwdlastset"/>',
        '</md:IDPSSODescriptor>',
        '</md:EntityDescriptor>'
    ].join('');
}
