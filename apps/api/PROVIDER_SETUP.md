# Identity and execution setup requirements

Both integrations are explicitly unavailable. The user has no identity or execution provider; this slice installs only provider-neutral internal ports and rejecting adapters. No credentials, tenant, billable account or provider-specific environment variables were created. `GET /api/v1/capabilities` reports both integrations as `false/not_configured`, with no available runtimes. Existing database/Redis/object fixtures cannot substitute for either provider.

The architecture owns the boundaries and unresolved decisions: [D02/D03 and isolation](../../docs/ARCHITECTURE.md). The roadmap owns release gates. This checklist records concrete setup inputs for a future adapter; secret values belong in server-only secret storage, never in chat, public contracts or frontend environment.

## Identity/session provider

1. Select an established provider and create owned, separate development/staging/production tenants. Approve supported sign-in methods, duplicate identity/account-linking behavior, verification/recovery, revocation/logout and guest migration policy. Google/GitHub/email remain proposals.
2. Configure issuer/discovery URL, expected audience, public client ID, approved scopes and any server client secret/private key required by the chosen protocol. Implement signature verification, key rotation/JWKS caching and safe failure behavior; an unverified token/header is never an account.
3. Register exact callback and sign-out URLs for the chosen web/API origins in each environment. Implement safe relative return destinations, state/PKCE/nonce as required, rate limits and session command origin/CSRF checks. Exchange/logout transport cannot be specified honestly before the provider/flow is chosen.
4. Select the session transport/store and supply signing/encryption keys where applicable. Approve lifetime/refresh/revocation/rotation and cookie name/domain/path/Secure/HttpOnly/SameSite policy. Define account mapping and cross-session account switching before enabling a principal response.
5. If email sign-in/recovery is selected, configure an owned verified sender/domain, transactional email service, templates, callback URLs, expiry and abuse controls.
6. Provide owned test identities in isolated provider environments. Verify new/duplicate/invalid/cancelled flows, expiry/revocation, recovery, two independent sessions, account changes, redaction and private-cache separation before changing capability contracts.

Exact provider environment setting names and callback paths remain unset until selection. A provider-specific SDK must be added only with its implemented adapter. `GET /api/v1/session` currently returns sanitized HTTP 503 even with forged cookies or authorization headers; it never returns a fake guest or account.

## Isolated execution provider

1. Select a remote sandbox service with an owned account/environment, region, server-only endpoint and credential. Approve billing owner, budget and emergency disable. Ordinary containers or local API subprocesses do not establish learner-code isolation.
2. Select the first pinned Python runtime/version/image and prove its provenance/patching. Define entry-file rules, files/dependencies/stdin and unsupported capabilities. Isolated web preview needs its own origin and browser sandbox/CSP decision.
3. Set wall/CPU timeout, memory, processes, disk/file/input/output/artifact size limits; cleanup TTL and cancellation guarantees. Approve authenticated/guest admission, concurrency, rate/quota and spend limits before any dispatch implementation.
4. Prove default-off egress, cloud metadata denial, no application database credentials or host mounts, safe paths/artifact MIME, lifecycle teardown and image update policy. Provider testing must cover actual isolation, not only successful program output.
5. Define job submission/status, monotonically ordered output/events, stdin/cancel and terminal-result protocol. Implement job ownership on every read/write/stream, signature verification for callbacks or authenticated polling, deduplication, disconnect cleanup and outage recovery. Transport acceptance or compiler output is not a final successful run.
6. Approve source/artifact/log retention and deletion, redacted telemetry and support ownership. Exercise owned fixtures for output/stdin, syntax/runtime errors, timeout, cancel, output caps, reconnect, provider outage, cleanup and isolation before enabling capabilities.
7. Implement grading/progress as separate authority: versioned checks, immutable source binding and durable transactional awards. Execution acceptance/result alone never grants completion or XP.

The current `POST /api/v1/executions` is a bounded unavailable command surface. It returns HTTP 503 after validation, creates no job and produces no output/result/reward. No local execution fallback exists. Real provider integration, trusted admission/quotas, live execution, grading and durable progress remain requirements blockers.
