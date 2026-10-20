disposition: fix

Missing inputs: no separate QUALITY BAR card or decision-comp critique reference was supplied; ceiling is judged against the task's explicit M02 quality bar. This is code-led; no approved comp or comp-fidelity claim applies. Review sampled the primary source files and inspected every required PNG through view_image; no browser, server, tests, or detector rerun was used.

## persistence

Pass. `PRODUCT.md` and `apps/web/.impeccable/surfaces/apps-web-app-page-tsx.md` exist and agree on beginners, original adventure imagery, Operate discovery, Read lessons, and unavailable execution/accounts/progress. This is a new world whose DESIGN.md is assigned to the subsequent documenter; its absence from this packet is not a finding. Comp-build state and diff artifacts are inapplicable.

Evidence check passed before quality judgment. All paths below are relative to `apps/web/.impeccable/review/`; the original fourteen are exactly those recorded in `capture-state.json`. The coordinator subsequently required `api-outage-mobile.png`, which was also opened and judged directly; that supplemental path has not yet been added to the manifest. Every image was opened, rather than inferred from its filename or dimensions.

| Capture | Visible validity evidence |
| --- | --- |
| `desktop.png` | Home begins at masthead, contains complete camp art, filters, five course entries, resources and footer. |
| `mobile.png` | Home begins at masthead; introduction precedes complete art; catalog and footer reflow into one column. |
| `reading-desktop.png` | Loaded Python lesson includes breadcrumb, chapter trail, complete explanation, examples, pager and footer. |
| `reading-mobile.png` | Same loaded Python lesson, collapsed chapter disclosure, readable sections and complete pager. |
| `html-reading-mobile.png` | Loaded HTML lesson includes document and CSS samples and footer; long code is contained inside its sample surface. |
| `course-desktop.png` | Python overview has prerequisites, preview scope, three ordered lessons and future-scope disclosure. |
| `dark-desktop.png` | Dark catalog has five loaded entries, selected filter and visible amber keyboard focus on preferences. |
| `menu-mobile.png` | Expanded navigation is visible at document top with its close control; the underlying home remains loaded. |
| `empty-mobile.png` | Query Python plus Web development yields zero courses and a visible Show all courses recovery action. |
| `preferences-mobile.png` | Open preferences show selected Nightfall and Reduce motion, plus optional unchecked sound. |
| `image-desktop.png` | Expanded camp image and caption are contained in a native dialog with a visible Close image control. |
| `image-fallback-desktop.png` | Article remains readable; failed image is replaced by meaningful alternative text and caption. |
| `storage-failure-mobile.png` | Preferences remain usable and explicitly state that choices work for this session when storage is unavailable. |
| `sharing-failure-mobile.png` | Clipboard failure message exposes a labelled canonical-link field; loaded lesson continues below. |
| `api-outage-mobile.png` | Supplemental required capture begins at the masthead and shows the complete explicit unavailable state, Retry content, help link and footer, with no blank or skeleton regions. |

No required capture is blank, a skeleton, an unrelated route, or missing required content. Modal/menu occlusion matches the requested open state. The manifest records `errors: []`, `focusRestored: true`, and HTML document width 390 at viewport 390. These are supplied capture-run results, not independently re-executed interaction tests. Sampled current CSS/components predate the captures and agree with their rendered content and layout.

`detector.json` contains an empty findings array. No separate detector narrative is present; no finding was invented from repeated CSS literals. The concept-seed check exited 0 and recognized `seed:31f7d600409b4040` as rolled on this machine. The public camp PNG retains RGBA data, a caBX provenance chunk and embedded `impeccable:prompt` text; its development prompt sidecar exists. The local Silkscreen import and shipped OFL text are present.

## fidelity

| Element / promise | State | Evidence and authority |
| --- | --- | --- |
| TYPE | match | Silkscreen supplies wordmark and short discovery display titles; system body and monospace code follow OWN-WORLD. Reading titles use restrained system type, consistent with the brief's Read mode and comprehension priority. |
| MATERIAL | match | The complete raster camp supplies the focal adventure scene in home and expansion captures. CSS provides ordinary controls and surfaces; no fake bevels, embossed materials or vector substitute for the illustration. |
| GROUND | match | Rendered light ground is pale blue-white, consistent with `--page: #f1f6f8`; ink is blue-green and masthead evergreen. The supplied dark variant preserves legibility and fern/amber semantics. No approved-comp pixel comparison is claimed. |
| THESIS | match | Home and catalog let beginners choose a subject, inspect real availability and open reading previews. |
| OWN-WORLD | match | Woodland art, evergreen masthead, fern selection, amber position/notes and limited pixel lettering form one visual system across discovery and reading. |
| STORY | match | Search, category controls, prerequisites and ordered lessons are present. Upcoming entries explicitly say lessons are unpublished; course scope explains unavailable later features. |
| FIRST VIEWPORT | match | Desktop uses compact two-column introduction/art beneath the masthead, followed by catalog controls and first rows. Mobile places the art after the introduction. The memorable element is the camp/observatory beside a direct invitation to begin. |
| Reading measure | adaptation | The source uses a 68ch rich-content maximum within a 72ch article rather than literal 66ch. This remains inside the supplied craft floor's 65–75ch range and supports Read-mode comprehension; mobile measures shrink with the viewport. |
| FORM / chapter trail | match | Recognized seed reference is persisted. Amber indicates current reading position, with You are reading and explicit absence of recorded progress; there is no completion claim. |
| Catalog structure | match | Two available entries precede three upcoming entries on desktop; mobile uses one readable column. Familiar cards serve subject comparison in Operate mode, while resource entries use simpler divided rows. |
| Focus and recovery | match | Visible amber focus appears in dark/preferences captures. Source provides focus-visible outlines, keyboard-focusable horizontal code samples, Escape recovery for disclosures/menu, native dialog closure and trigger-focus restoration. Fallback captures expose usable alternatives. |
| Content-service recovery | contradicted | `api-outage-mobile.png` visibly promises Retry content. The coordinator's concrete outage/restoration run reports no restored course heading within 30 seconds after API health returned 200 and Retry content was clicked. `apps/web/app/error.tsx` binds the button only to `reset`; source supplies no explicit fresh-page request. The failure result is attributed to that supplied run, not independently reproduced in this browserless review. |
| Truth and scope | match | Preview notices label code/output as static; no fake run, submit, account, XP, progress or purchase controls appear. Membership source explicitly states that plans and purchases are unpublished. Sampled resource rendering omits authoring metadata. |

## ceiling

Visual ceiling reached against the supplied Operate/Read quality bar; operational finish is blocked by content-service retry recovery. The world uses a single focal illustration, limited display lettering and an amber chapter trail while ordinary controls and uninterrupted reading carry the task. More ornament, game chrome, depth or entrance motion is not required by this brief. Brief color feedback and reduced-motion overrides agree with the stated motion policy; a standalone world's card was not available for a separate comparison.

The sampled source contains the corrected early-image-failure hydration check, an explicit public-section allowlist before object lookup, and a shrinking reading grid/article with independently scrollable code. Captures corroborate loaded lessons, the image fallback, absence of leaked authoring metadata and contained mobile HTML width. These observations do not certify backend behavior or later milestones.

Availability and content-kind labels communicate actual state/type; they are not decorative marketing kickers. No material craft-floor violation was found in the reviewed renders: controls use consistent drawn SVG icons, the display face is locally served, surfaces avoid hard block shadows and fake physicality, and body/code content remains readable.

## material_fixes

1. **Failure recovery / ordinary working controls:** make Retry content initiate a fresh server request, for example a full `window.location.reload()` or a framework refresh/reset sequence proven to recover, rather than relying on the currently failing reset-only action in `apps/web/app/error.tsx`. Verify the exact production sequence: stop API with web running, open `/courses`, see the explicit error, restore API to health 200, click Retry content, and recover the loaded catalog without manually editing the URL; preserve the explicit error while the service remains unavailable. Evidence: `api-outage-mobile.png`, the coordinator's supplied outage/restoration result, and the sampled handler. Add the supplemental outage path and a loaded post-retry capture to `capture-state.json`, then return the updated evidence for the verdict pass.

## keep

Preserve the complete original camp silhouette, calm ink-on-pale reading surfaces, ordinary task controls, explicit preview/upcoming boundaries and amber reading-position semantics without implying saved completion.
