# M02.04 card disclosure system check

Disposition: conforms to the incumbent system; no normative design changes.

Changed: this evidence record only. [DESIGN.md](../../DESIGN.md) and [design.json](../design.json) remain unchanged: this is an ordinary local extension, with no approved new world, tokens or rules. Their existing card description and representative preview remain valid; a component-description addition is unnecessary.

System summary:

- Palette: the summary uses existing fern `accent`; disclosure text inherits `ink`, while cards retain `surface` and `line`, including Nightfall overrides.
- Type: guidance and its headings use inherited system sans at `.875rem`; short Silkscreen marks retain their separate display role.
- Spacing: disclosure bottom margin is 20px; summary block padding is 6px; heading margins are `16px 0 6px`; lists have 20px left padding.
- Structure: native `details`/`summary` retains its marker and uses the shared `3px solid var(--focus)` outline with 4px offset; no nested panel, shadow or custom disclosure control is introduced.
- Named rules: the Reading Voice Rule remains intact; the Position Rule and explicit preview/upcoming availability retain their established meaning.

Evidence checked:

- [Catalog source](../../src/components/catalog.tsx): every card maps `course.prerequisites` and `course.recommendations` to separate headed lists before its footer. The summary includes visually hidden course-language context and defaults to closed; the course-opening link remains separate.
- [Global CSS](../../app/globals.css): `.course-guide` rules at lines 138–141 reuse the existing font/color inheritance, fern token and quiet spacing. Global body, summary cursor and focus rules apply. Existing grid/card rules preserve flat bordered geometry and the mobile single-column layout.
- [PRODUCT.md](../../../../PRODUCT.md) and the [surface brief](../surfaces/apps-web-app-page-tsx.md): guidance supports beginner course comparison using ordinary controls without implying execution, accounts, saved progress or completion.
- Personally inspected [desktop](cards-desktop.png), [mobile](cards-mobile.png) and [Nightfall](cards-dark.png) captures: Python is expanded and the other four cards are collapsed; guidance remains within the cards and preserves the incumbent hierarchy in all three. [Capture state](cards-state.json) records viewport/document widths of 390/390 and an empty page-error list; these are supplied capture facts, not a new browser run.
- [Independent review](cards-review.md): `disposition: ship`, with no scoped material fixes. Its test and detector statements remain attributed to that review/coordinator; this documenter ran no tests or detector.

Not canonized or repaired: no discrepancy in this extension. The incumbent documentation already records the separate historical reading-measure difference; this scoped pass neither broadens that audit nor changes its rules. No YAML, JSON or token references were edited; the incumbent sidecar parsed successfully, and this record's local file links were checked against existing files.
