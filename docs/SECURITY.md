# Public HTTP security policy

This policy covers the implemented public discovery/reading web app and JSON API. Account/session mutation, learner execution, uploads and untrusted previews remain unavailable. [Roadmap M16.03](ROADMAP.md#m16--launch-quality-reliability-and-operating-readiness) retains those broader gates.

## Frontend document boundary

`apps/web/proxy.ts` creates a fresh 24-byte cryptographic nonce for each matched request. It replaces caller-supplied internal nonce/CSP headers before passing the request to Next.js, then returns the same enforced policy to the browser. Next.js authorizes its framework scripts from that internal CSP; the asynchronous root layout passes the nonce explicitly to the fixed preference bootstrap. A caller's `x-nonce` does not authorize anything. There is no report-only substitute.

The policy source is `apps/web/src/security-policy.ts`:

| Directive | Current permission |
| --- | --- |
| Scripts | Matching nonce and trusted dynamic descendants; same-origin fallback for older CSP support. No script `unsafe-inline`; production has no `unsafe-eval` |
| Styles | Same origin and inline CSS, to support Next.js/native style attributes. This does not authorize inline JavaScript |
| Images/fonts/connections | Same origin |
| Frames | Only `https://www.youtube-nocookie.com` and `https://player.vimeo.com`; the existing component further validates embed paths and requires explicit activation |
| Objects/base elements/workers/network media | Denied |
| Forms | Same origin |
| Embedding CodeSaga | Denied through `frame-ancestors 'none'` and `X-Frame-Options: DENY` |

Development alone permits script evaluation and WebSocket connections for the Next.js development tooling. Production checks reject those development allowances. Existing optional navigation sounds use Web Audio without fetching media; they remain off by default. No external video is authored in the current catalog, and this checkpoint does not certify provider playback.

The root layout reads request headers, so document rendering, including not-found UI, is dynamic. Matched HTML responses use `private, no-store`; do not separately cache/replay their HTML or nonce-bearing policy at an edge. Static assets retain their existing caching behavior. The proxy excludes the Next.js static/image families, `/media/`, and exact health/robots/sitemap/favicon paths. Those responses receive a restrictive, nonce-free baseline CSP from `next.config.ts`, alongside the common headers below. Similar-looking public paths remain matched; the HTTP test includes `/robotsXtxt-extra`.

Next.js may retain HTTP 200 when a not-found result arrives after streaming starts. The unavailable UI and `noindex` marker are tested independently of that transport status; API missing-resource responses remain HTTP 404. This follows the installed framework's [not-found behavior](https://nextjs.org/docs/app/api-reference/file-conventions/not-found), rather than a blanket promise that every streamed unavailable page has status 404.

Implementation follows the installed Next.js 16.4.2 [CSP guide](https://nextjs.org/docs/app/guides/content-security-policy) and [Proxy convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy). This policy does not support static export, ISR or a cached HTML shell. Runtime/editor workers, identity-provider scripts, preview origins and other third-party connections need their own implemented boundary and policy changes before enablement.

## Backend JSON boundary

`apps/api/src/security-headers.ts` runs before CORS/body parsing and applies the common headers plus `default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`. The API serves JSON, not executable documents or learner previews. Parser failures, denied origins, unavailable adapters and preflight retain the same policy; headers do not change validation, authorization or the existing origin allowlist.

Both applications set:

| Header | Value |
| --- | --- |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `no-referrer` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

Permissions Policy enforcement depends on browser support; header presence is not a physical-device permission certification. Clipboard controls, local storage and user-activated audio remain available. TLS/HSTS, production domains/CDN/proxy configuration and reporting collection remain deployment gates. No CSP reporting endpoint is configured, and no nonce is treated as an identity/session credential.

## Verification and limits

- API HTTP checks cover successful JSON, missing routes, unavailable session lookup, denied CORS, malformed/oversized JSON and OPTIONS preflight.
- Cross-process HTTP acceptance verifies fresh caller-independent nonces, authorized HTML scripts, no-store responses, unavailable UI/noindex and nonce-free static/metadata/health policies.
- Each browser engine parses a test-modified real response containing two unauthorized scripts: one without a nonce and one with a caller-forged nonce. Both must be blocked with observed policy violations, while the actual preference bootstrap, controlled React inputs and filtering continue to work. Chromium development testing grants only the fixture origin local-network access so a replayed response can open its HMR socket; this changes no CSP permission and does not apply in production runs.
- Existing discovery, reload/preference, media, clipboard, responsive and accessibility cases run under the enforced policy. [Acceptance matrix](../tests/README.md) owns commands and counts; the roadmap owns verified outcomes and diagnostics.

These checks establish the declared public boundaries, not complete XSS protection, security certification, account/tenant isolation or sandbox containment. React escaping, validated content models, provider admission and future domain authorization remain separate responsibilities.
