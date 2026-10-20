# Request telemetry

The current NestJS API writes one JSON `http_request` event to stdout when an HTTP response finishes or its connection closes early. Middleware is installed before CORS and body parsing, so their rejected requests are included. Operational startup messages may also use stdout; consumers must select JSON records with the expected event and schema version.

## Fields and correlation

| Field | Meaning |
| --- | --- |
| `schemaVersion` / `event` | `1` / `http_request` |
| `timestamp` | UTC completion/abort timestamp |
| `traceId` | Independent server-generated UUID, also returned as `X-Trace-ID` |
| `method` | GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS; otherwise `OTHER` |
| `route` | Explicitly approved registered route template; otherwise `unresolved` |
| `outcome` | `finished` or `aborted` |
| `statusCode` | Completed response status; `null` on abort |
| `durationMs` | Monotonic elapsed time from middleware entry to finish/abort, rounded to microseconds |

`X-Trace-ID` is exposed to allowed browser origins. Incoming trace IDs are ignored. Existing `X-Request-ID` acceptance and error-envelope correlation remain compatible, but caller request IDs are excluded from telemetry: valid ASCII text can still contain personal information. Use the **response's `X-Trace-ID`** to find its server event. Neither identifier is authentication, a principal reference or a cross-service trace protocol.

For example, a missing course has route `/api/v1/content/courses/:course`, not the requested slug. Unknown URLs, CORS preflights, CORS rejection and parser failures have route `unresolved` because no approved controller route has been selected. Add future registered templates to the explicit allowlist in `src/telemetry.ts`; never substitute raw URLs when a template is unavailable.

Finish records indicate that the response was handed to the operating system, **not** that a browser received it. Abort records do not infer a successful status from Node's default `200`. A finish followed by close records once. Event listeners are removed after either outcome. These semantics follow the [Node 24 ServerResponse lifecycle](https://nodejs.org/docs/latest-v24.x/api/http.html#event-finish_2); registered templates come from [Express's matched route](https://expressjs.com/en/5x/api/request/#req.route).

## Privacy boundary

Events are constructed from an explicit field allowlist. They contain no request/response bodies, source files, query strings, raw paths/parameters, IP addresses, user agents, referrers, cookies, authorization/origin headers, caller IDs, principal data, exception messages/stacks or provider payloads. The sink receives a frozen record, not a request/response/error object. Do not add automatic HTTP/error serializers when connecting a collector.

The API's existing sanitized error responses and disabled Nest framework logger remain in effect. This document describes this API's own event writer; it does not configure or establish privacy guarantees for future reverse-proxy, hosting, database or provider logs.

## Verification and operating limits

Run from the repository root:

```powershell
pnpm --filter @codesaga/api exec tsx --test test/telemetry.test.ts
```

Real HTTP tests place a canary in credentials, caller IDs, user agent, referrer, origin, raw URLs, dynamic route values, query, malformed/oversized JSON, valid submitted code and a database exception. They assert exact event keys, no canary, preserved public request IDs, independent matching trace IDs, approved route templates, correct completed statuses and one event per response. Separate tests destroy a real pending connection and exercise a synchronously failing sink.

The default sink synchronously writes JSON using `console.info`. `createApp` accepts a synchronous sink for verification/integration; synchronous sink exceptions are swallowed without logging the exception or failing a response. There is no queue, persistence, retry, remote collector, backpressure policy or delivery guarantee. No source/payload is buffered for telemetry, and no sampling is configured. Traffic volume, stdout handling, restricted log access, retention/deletion, delivery-failure monitoring and collector budgets must be selected and exercised before production. A process crash or connection rejected before middleware entry may have no event.

This is request telemetry for the implemented public API only. Attempt/job/revision/provider/outbox correlations, metrics/alerts, business audit trails, analytics consent and production operating policies remain roadmap gates. Health/readiness duration is not a provider or execution latency measurement, and these events establish no SLA.
