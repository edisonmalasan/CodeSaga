---
name: CodeSaga
description: An original woodland field guide for beginner coding discovery and reading.
colors:
  page: "#f1f6f8"
  surface: "#ffffff"
  surface-soft: "#e6eff0"
  ink: "#15343f"
  muted: "#52676f"
  line: "#c9d8dc"
  accent: "#17654c"
  accent-hover: "#104b39"
  on-accent: "#ffffff"
  selected: "#dceee3"
  header: "#123c35"
  header-ink: "#f1f8f4"
  note: "#fff2d4"
  note-ink: "#705015"
  focus: "#a85b08"
  code: "#132f39"
  code-ink: "#edf5f6"
  dark-page: "#11272e"
  dark-surface: "#19343d"
  dark-surface-soft: "#213e45"
  dark-ink: "#e9f3f4"
  dark-muted: "#b4c9cd"
  dark-line: "#41606a"
  dark-accent: "#a4ddbf"
  dark-accent-hover: "#c4edd5"
  dark-on-accent: "#10362a"
  dark-selected: "#244d3e"
  dark-header: "#0b201f"
  dark-header-ink: "#eef9f2"
  dark-note: "#3e361f"
  dark-note-ink: "#f1d89a"
  dark-focus: "#f4bd67"
  dark-code: "#0b2028"
typography:
  display:
    fontFamily: "'Silkscreen', system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-.02em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.5rem"
    lineHeight: 1.25
    letterSpacing: "-.025em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.125rem"
    lineHeight: 1.25
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    lineHeight: 1.65
  reading-body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    lineHeight: 1.8
  reading-title:
    fontFamily: "system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-.03em"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: ".75rem"
    fontWeight: 600
    lineHeight: 1.5
  mono:
    fontFamily: "ui-monospace, 'Cascadia Code', 'SFMono-Regular', Consolas, monospace"
    fontSize: ".875rem"
    lineHeight: 1.8
rounded:
  inline-code: "3px"
  availability: "4px"
  trail-position: "5px"
  field: "6px"
  action: "7px"
  notice: "8px"
  code: "9px"
  panel: "12px"
spacing:
  '8': "8px"
  '12': "12px"
  '16': "16px"
  '20': "20px"
  '24': "24px"
  '28': "28px"
  '32': "32px"
  '36': "36px"
  '48': "48px"
  '64': "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.action}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    padding: "8px 4px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.action}"
  navigation:
    backgroundColor: "{colors.header}"
    textColor: "{colors.header-ink}"
  filter:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.field}"
    padding: "8px 16px"
  filter-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  availability-preview:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.availability}"
    padding: "4px 9px"
  availability-upcoming:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
  course-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "26px 28px 20px"
  preview-notice:
    backgroundColor: "{colors.note}"
    textColor: "{colors.note-ink}"
    rounded: "{rounded.notice}"
    padding: "16px 20px"
  trail-position:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
    rounded: "{rounded.trail-position}"
    width: "28px"
    height: "28px"
  trail-position-current:
    backgroundColor: "{colors.note}"
    textColor: "{colors.note-ink}"
  code-example:
    backgroundColor: "{colors.code}"
    textColor: "{colors.code-ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.code}"
  preference-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.24}"
    width: "320px"
---

# Design System: CodeSaga

## Overview

**Creative North Star: "Original pixel trailhead field guide"**

CodeSaga's confirmed original pixel-adventure world feels like a woodland place to begin. Evergreen navigation, pale blue-white ground, fern actions and amber notes connect the illustrated camp to quiet, readable web surfaces. Short pixel lettering supplies identity while ordinary controls make subject discovery familiar.

Reading pages carry the same palette with restrained system typography, generous line height and contained code samples. This records the implemented public discovery and static reading previews; identity, execution, saved progress, XP and Builds remain unavailable. Page composition and the code-led direction contract belong in the [surface brief](.impeccable/surfaces/apps-web-app-page-tsx.md), not in a global build-path rule.

**Key Characteristics:**

- Original woodland artwork with a complete transparent silhouette.
- Pixel display accents, ordinary sans reading and distinct monospace code.
- Flat bordered surfaces, fern actions and amber preview/current-position semantics.
- Familiar responsive controls and explicit availability labels.

Evidence: [global CSS](app/globals.css), [components](src/components), [local font import](app/layout.tsx), [asset record](ASSETS.md), and the [final finish verdict](.impeccable/review/finish-verdict.md). Frontmatter holds extracted primitives; the [sidecar](.impeccable/design.json) adds theme metadata, depth, motion, breakpoints and component previews. No synthetic tonal scale is asserted.

## Colors

The palette joins cool reading grounds to forest greens and warm amber wayfinding. Frontmatter names follow the source custom properties; `dark-` names record their actual Nightfall overrides.

### Primary

- **Fern action** (`accent`, `accent-hover`, `on-accent`): links, primary actions and selected category filters. Hover deepens the light action surface; Nightfall uses a lighter fern with dark action text.
- **Fern wash** (`selected`): reading-preview badges, course-arrow hover and the supporting path panel.
- **Evergreen masthead** (`header`, `header-ink`): navigation and footer anchor the world in both themes.

### Secondary

- **Amber preview** (`note`, `note-ink`): preview disclosures, warning callouts and the current chapter position.
- **Amber focus** (`focus`): visible keyboard focus, distinct from selected category styling.

### Neutral

- **Pale ground and paper** (`page`, `surface`, `surface-soft`): page canvas, cards/fields and quiet inset areas.
- **Blue-green ink** (`ink`, `muted`): primary reading text and subordinate summaries/metadata.
- **Quiet divider** (`line`): card/field boundaries, rows and trail connectors.
- **Night code** (`code`, `code-ink`): static examples and output, including on light pages. Code ink is unchanged in Nightfall.

**The Position Rule.** Amber chapter markers identify the current reading location, never completed work or earned progress.

Daylight sets `data-theme='light'`; Nightfall sets `data-theme='dark'`. The device setting follows `prefers-color-scheme` when neither explicit theme is selected. These are implemented variants, not a generated dark palette.

## Typography

**Display Font:** locally served Silkscreen regular, with system-ui and sans-serif fallbacks. The pinned font package and SIL Open Font License are recorded in [ASSETS.md](ASSETS.md); the license ships at `public/media/Silkscreen-OFL.txt`.

**Body Font:** system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif. **Code Font:** ui-monospace, Cascadia Code, SFMono-Regular, Consolas, monospace. These remain separate roles from the local display face.

### Hierarchy

- **Display:** frontmatter records the base h1. Observed home titles use a larger short display (2.75rem), course/catalog titles use 2.125rem, the wordmark uses 1.5rem with line height 1, and language marks use 1.75rem with line height 1. All use Silkscreen weight 400.
- **Headline / title:** system sans headings use the frontmatter roles; course-card titles increase to 1.5rem. No fixed modular ratio is established.
- **Reading title:** a separate system-sans role keeps lesson/article headings readable, with a maximum measure of 24ch.
- **Body / reading body:** ordinary interface prose and more open long-form prose use their separate frontmatter line heights. Catalog summaries use .9375rem; article summaries use 1.125rem.
- **Label:** the compact semibold role is the actual availability badge. Other metadata remains ordinary sans, commonly .75rem or .8125rem; labels are not forced uppercase.
- **Mono:** block samples use the code stack; inline code uses .875em relative sizing.

**The Reading Voice Rule.** Preserve the separation between short pixel display lettering, system-sans explanation and monospace code.

## Layout

The shared page container is centered at `min(1184px, calc(100% - 80px))`. The header uses `min(1280px, calc(100% - 64px))`, with minimum height 72px. Repeated spacing values in frontmatter are observed steps, not an inferred universal scale.

Catalog cards sit on a six-column grid with a 20px gap: preview cards span three columns and upcoming cards span two. Resource lists use divided rows. Reading uses a 240px sidebar, a shrinking article column and a 64px gap; the article is at most 72ch and rich content at most 68ch. This implemented measure supersedes the surface brief's approximate 66ch description for extraction purposes.

At the actual max-width breakpoint of 1000px, the page/header widths become `calc(100% - 48px)`, upcoming cards span three columns, and the reading sidebar/gap reduce to 210px/36px. At 720px, page width becomes `calc(100% - 40px)`, the header minimum height becomes 68px, cards become one column with a 16px gap and 24px padding, and chapter navigation becomes a native disclosure above the article. Mobile article headings reduce to 1.875rem; code samples use .8125rem and 16px padding. Code scrolls horizontally inside its own surface.

## Elevation & Depth

Cards and reading surfaces are flat: background changes, fine borders and spacing provide separation. Diffuse shadows identify overlays rather than decorate every container. Exact observed shadows live in the sidecar: the shared preference-panel shadow and the mobile navigation shadow. The native image dialog uses a dark translucent backdrop rather than an invented elevation ladder.

Brief filter feedback uses the actual background-color transition (160ms ease-out). Smooth anchor scrolling is enabled; device or local reduced-motion choices switch scrolling to auto and reduce animation/transition durations to .01ms. No entrance or looping animation vocabulary is established.

## Shapes

Soft rectangular geometry surrounds ordinary controls and content. Frontmatter records the actual corner values by use: small inline-code and availability corners, compact chapter squares, fields/actions, notices, code panels and larger containers. Cards and chapter outlines have fine solid borders (1px); the empty state uses a dashed border. There is no pill-shaped or bevelled component family in this build.

The camp illustration supplies the irregular island silhouette. Preserve the original RGBA PNG at `public/media/camp-observatory.png` byte-for-byte, including embedded `impeccable:prompt` provenance. Its exact generation prompt is retained outside the public tree at `.impeccable/assets/camp-observatory.prompt.txt`. [ASSETS.md](ASSETS.md) owns provenance details; small geometric SVG controls come from `src/components/icons.tsx`.

## Components

### Buttons

Primary actions are compact, legible fern rectangles with the frontmatter colors, padding and corners, a minimum height of 48px, semibold .9375rem type and 1.5 line height. Hover changes only the action background. Underlined text buttons use a minimum height of 44px. Disabled buttons use opacity .5 and the default cursor, as seen on Reset filters when no filter is active.

The shared keyboard treatment is an outline (3px solid `focus`) offset by 4px. No additional pressed animation is documented.

### Inputs / Fields

The labelled catalog search is a paper surface with a fine divider border and an inline drawn search icon. Its input has transparent background and padding `12px 12px 12px 0`; the wrapper supplies 14px left padding. Focus within uses a fern outline (2px, offset 1px), with ink text and muted placeholders. Public search and share fallback fields are separate implemented field variants with 6px corners. Preference selects have height 44px and use the paper/divider treatment. Only observed focus and recovery states are recorded.

### Chips

Subject filters are ordinary buttons with 6px corners, a divider border and muted text. Hover uses the soft surface and ink; `aria-pressed='true'` selects fern/on-accent colors and fern border. Mobile filters use minimum height 40px and padding `8px 11px` instead of the desktop minimum 42px and `8px 16px`.

Reading-preview and upcoming badges are noninteractive availability labels: fern on fern wash versus muted on soft surface. They describe publication scope, not achievement or completion.

### Cards / Containers

Course cards use the frontmatter paper, panel corners and asymmetric padding, with a divider border and no shadow. A short pixel language mark and availability badge lead into an ordinary sans title/summary. The bottom row is divided by a fine rule; its separate course link is a 40px minimum square with 6px corners and fern-wash hover. Title-link hover underlines the title; there is no whole-card lift state.

Preview notices use amber with an inline book SVG and explicit static-example wording. Chapter outlines share panel corners; ordinary callouts use soft surfaces and warning callouts use amber.

### Navigation

The evergreen masthead pairs the pixel wordmark with ordinary sans links (.9375rem). Desktop current/hover links use the source's pale green bottom rule (3px); current location is also exposed through `aria-current`. At 720px, a menu button reveals a vertical navigation panel, and the current link uses an underline. Escape closes the menu and returns focus to its trigger.

Preferences use a native disclosure and a 320px paper panel with 24px padding, panel corners and the shared diffuse shadow. Mobile placement is fixed below the header, with width `min(320px, calc(100vw - 32px))`. Appearance and reduced motion choices are browser preferences; blocked storage exposes a session-only notice. Escape closes the disclosure and restores summary focus.

### Chapter trail and reading samples

The chapter trail connects numbered 28px squares with a fine vertical divider. Current position uses amber and the linked lesson uses fern, `aria-current='page'` and “You are reading.” Other lessons say “Reading preview”; the accompanying note states that reading progress is not recorded. Its mobile disclosure preserves chapter navigation without a permanent sidebar.

Static code figures use the dark code surface, 9px corners, a small sans caption and keyboard-focusable preformatted content. Sample text retains whitespace and can scroll horizontally. Focus moves inside the sample with outline offset -4px. Code and expected output are labelled static; these surfaces are not editors.

## Do's and Don'ts

### Do:

- **Do** preserve the complete original transparent camp artwork and its provenance paths.
- **Do** keep short Silkscreen display text, system-sans reading and monospace code distinct.
- **Do** use the existing theme variables, keyboard focus and reduced-motion behavior.
- **Do** retain explicit preview/upcoming labels and current-reading-position semantics.

### Don't:

- **Don't** present amber chapter position as completed progress or XP.
- **Don't** imply identity, code execution, saved progress or Builds are available.
- **Don't** substitute captured reference-product imagery for CodeSaga's original assets.
- **Don't** turn the home composition or scoped code-led build path into a global visual requirement.

Not canonized or repaired: the brief's approximate 66ch reading measure differs from the implemented 68ch rich-content maximum; this extraction records source reality, as accepted by the finish review. No material visual defect remains in the supplied final verdict; this documentation pass did not independently rerun its interaction checks.
