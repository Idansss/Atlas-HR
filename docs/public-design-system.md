# Atlas HR — Public Pages Design Language Spec

> **Status:** Source of truth for all 7 public page redesigns.  
> **Scope:** Knowledge Hub · Tools · Community · Customers · Pricing · Sign In · Sign Up  
> **Sequence:** Prompt 1 of 3 in the public redesign sequence. No code was changed to produce this file.  
> **Last updated:** 2026-05-14

---

## Quick reference — token cheatsheet

All tokens live in `src/app/globals.css` (`:root` = light, `[data-theme="dark"]` = dark).  
Use CSS variable syntax everywhere: `bg-[--accent]`, `text-[--text-secondary]`, etc.

| Token | Light value | Dark value | Purpose |
|---|---|---|---|
| `--background` | `#fafafa` | `#0a0a0a` | Page canvas fallback |
| `--foreground` | `#0f172a` | `#f1f5f9` | Primary text (Tailwind `@theme` alias) |
| `--bg-app` | `#fafafa` | `#0a0a0a` | Page-level background |
| `--bg-card` | `#ffffff` | `#111827` | Cards, panels, surface containers |
| `--bg-hover` | `#f1f5f9` | `#1f2937` | Hover states, alternating section bg |
| `--bg-input` | `#ffffff` | `#111827` | Form inputs |
| `--text-primary` | `#0f172a` | `#f1f5f9` | High-contrast body text |
| `--text-secondary` | `#475569` | `#94a3b8` | Supporting text, descriptions |
| `--text-tertiary` | `#64748b` | `#64748b` | Captions, meta, fine print |
| `--accent` | `#3525cd` | `#818cf8` | Brand color — CTAs, icons, links |
| `--accent-hover` | `#2b1da8` | `#6366f1` | Accent hover state |
| `--accent-soft` | `accent @ 14% opacity` | `accent @ 18% opacity` | Subtle accent backgrounds |
| `--primary-foreground` | `#ffffff` | `#0f172a` | Text on accent-colored backgrounds |
| `--border` | `#e2e8f0` | `#1f2937` | Default borders |
| `--border-strong` | `#cbd5e1` | `#334155` | Emphasis borders |
| `--success` | `#059669` | `#34d399` | Positive states |
| `--warning` | `#d97706` | `#fbbf24` | Warning states |
| `--danger` | `#dc2626` | `#f87171` | Error / destructive states |
| `--shadow-dropdown` | `rgba(15,23,42,0.12)` | `rgba(0,0,0,0.45)` | Dropdown / floating shadows |

---

## 1. Design Principles

These five statements are the appellate court of every design decision. When an implementation choice conflicts with one of these principles, the principle wins.

### 1.1 Warmth on arrival, depth on inspection

The first 300 pixels a visitor sees should feel open, welcoming, and human. Rounded corners, generous whitespace, a friendly headline. As they scroll, the page earns trust by revealing enterprise-grade depth: comparison tables, country-specific callouts, real product screenshots. Neither dimension cancels the other — both must coexist on every page.

### 1.2 Mobile-first, always

Our primary users in Nigeria, India, Kenya, and the Philippines browse on 3G/4G mobile devices. Every layout is designed for a 390px viewport first. Desktop is an enhancement, not the default. Touch targets never shrink below 44×44px. Scroll-stacked content on mobile becomes side-by-side on `md:` and above.

### 1.3 Every page answers one question before introducing the next

The hero answers: "Is this product for me?" The next section answers: "What can it do?" Then: "Does it work where I work?" Then: "What does it cost?" Each scroll step earns the next. No page introduces a feature before it has established relevance for the visitor.

### 1.4 Performance is a design constraint, not an afterthought

No video backgrounds. No autoplay animations. No hero images over 200 KB. Illustrations are SVG when simple, WebP when photographic. The Next.js `<Image>` component with `sizes` and `priority` props is mandatory for above-fold imagery. If a design choice would hurt a user on a 4G connection, it is the wrong choice.

### 1.5 Illustration supports content, never replaces it

Real product screenshots build more credibility than abstract illustrations. Illustrations are reserved for empty states, onboarding moments, and "no results" states. When a hero section needs a visual, reach for a real screenshot of the Atlas HR UI first. Abstract or decorative illustration is a last resort.

---

## 2. Color Usage on Public Pages

### 2.1 Hero sections

```
Background:       bg-[--bg-app]
Headline:         text-[--text-primary]
Subheadline:      text-[--text-secondary]
CTA primary:      bg-[--accent] text-[--primary-foreground]
                  hover:bg-[--accent-hover]
CTA secondary:    border border-[--border] bg-[--bg-card] text-[--text-primary]
                  hover:bg-[--bg-hover]
Hero badge/pill:  bg-[--bg-card]/90 border border-[--border] text-[--accent]
                  (backdrop-blur for glass effect)
Top tint option:  bg-[--accent-soft] as a subtle section background
```

### 2.2 Feature sections

```
Section bg:       bg-[--bg-app] (default) or bg-[--bg-input] (alternating)
Card backgrounds: bg-[--bg-card] border border-[--border]
Card hover:       hover:border-[--accent] hover:-translate-y-0.5 hover:shadow-lg
Feature icons:    text-[--accent] inside size-12 rounded-xl bg-[--accent-soft]
Icon hover:       group-hover:bg-[--accent] group-hover:text-[--primary-foreground]
Section dividers: border-[--border]
```

### 2.3 Pricing tables

```
All tiers bg:     bg-[--bg-card] border border-[--border]
Recommended tier: bg-[--accent-soft] border border-[--accent]/30
Recommended badge:bg-[--accent] text-[--primary-foreground]
Price number:     text-[--text-primary] font-bold
Price period:     text-[--text-tertiary]
Feature check:    text-[--success] (CheckCircle2 from lucide-react)
Feature cross:    text-[--text-tertiary] (Minus from lucide-react)
```

### 2.4 Testimonial / Customer sections

```
Section bg:       bg-[--bg-hover] (subtle muted background)
Quote text:       text-[--text-primary] font-medium
Attribution name: text-[--text-primary] font-semibold text-sm
Attribution role: text-[--text-secondary] text-sm
Avatar ring:      ring-2 ring-[--border]
```

### 2.5 Footer

```
Background:       bg-[--bg-card] border-t border-[--border]
Brand text:       text-[--text-primary]
Tagline:          text-[--text-secondary]
Link columns:
  Heading:        text-[--text-tertiary] uppercase tracking-wider text-xs
  Links at rest:  text-[--text-secondary]
  Links on hover: text-[--accent]
Copyright row:    text-[--text-tertiary] text-xs
Social icons:     text-[--text-tertiary] hover:text-[--accent]
```

### 2.6 Final CTA banners

These get the full accent treatment — this is the highest-emphasis surface on the page:

```
Background:       bg-[--accent]
Text:             text-[--primary-foreground]
Supporting text:  text-[--primary-foreground]/75 (75% opacity)
CTA primary:      bg-[--primary-foreground] text-[--accent]
                  hover:bg-[--bg-input]
CTA secondary:    border border-[--primary-foreground]/30
                  bg-[--primary-foreground]/10
                  text-[--primary-foreground]
                  hover:bg-[--primary-foreground]/20
```

### 2.7 Color anti-patterns

These are banned. If you find them in existing code, replace them.

- **Never use hex values directly** — every color must reference a `--token`
- **Never use Tailwind palette classes** (`bg-blue-600`, `text-slate-400`, `bg-white`, `bg-gray-50`) — they break dark mode and theme switching
- **Never use `--sf-*` tokens** on new code — those are legacy Stitch surface tokens from `surface-tokens.css` and should not appear in redesigned pages
- **Never use Material Design token names** (`--primary-container`, `--on-surface-variant`, etc.) on new code
- **Never hardcode opacity on a color** without using the `/` Tailwind opacity modifier or `color-mix`

---

## 3. Typography Scale

The codebase loads **Geist** via `--font-geist-sans` (see `globals.css` `@theme inline`). The `body` tag currently falls back to Arial — redesigned public pages should use `font-[--font-geist-sans]` or rely on the `@theme` alias `font-sans`.

| Element | Tailwind classes | Use case |
|---|---|---|
| Display headline | `text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight` | Hero headline only. One per page maximum. |
| Page headline (h1) | `text-4xl sm:text-5xl font-semibold leading-tight tracking-normal` | Auth pages (Sign In, Sign Up) where there is no display hero |
| Section heading (h2) | `text-3xl md:text-4xl font-semibold leading-snug tracking-normal` | Major section breaks. Max 5 per page. |
| Subsection (h3) | `text-xl md:text-2xl font-semibold leading-snug` | Card titles, feature block headings |
| Card title | `text-lg font-semibold` | Pricing tier names, tool card names, article card titles |
| Body large | `text-lg leading-relaxed font-normal` | Hero subheadlines, section intro paragraphs |
| Body | `text-base leading-7 font-normal` | General page prose |
| Body small | `text-sm leading-6 font-normal` | Card descriptions, testimonial quotes, secondary info |
| Label / Eyebrow | `text-xs font-semibold uppercase tracking-wider` | Section pre-headers ("Why Atlas HR"), badge text, footer column headings |
| Caption | `text-xs font-normal` | Image captions, fine print, timestamps |

### 3.1 Specific usage rules

- Display size is reserved exclusively for the hero headline on content-heavy pages (Knowledge Hub, Tools, Customers, Community, Pricing). Auth pages (Sign In, Sign Up) use h1 sizing.
- Section headings (h2) break the page into scannable chunks. Aim for 3–5 per page — more than that and the page loses hierarchy.
- Body large (`text-lg`) is the hero subheadline and section intro paragraph style. Avoid using it for card descriptions or list items.
- Never set a heading in `font-normal` — headings always carry `font-semibold` or `font-bold`.
- Eyebrow labels appear above section headings to provide context before the heading lands (e.g., "For growing teams" above "Built for every HR team"). They are always `uppercase tracking-wider text-[--text-tertiary]` or `text-[--accent]` depending on emphasis.

---

## 4. Spacing & Rhythm

Consistent vertical spacing is what makes pages feel "designed" vs. assembled. Use these values and don't deviate unless there is a strong reason.

### 4.1 Section padding

| Context | Padding classes |
|---|---|
| Hero section | `py-20 md:py-32 lg:py-40` |
| Standard content section | `py-16 md:py-24` |
| Compact section (between closely related blocks) | `py-12 md:py-16` |
| Country/trust strip | `py-6` |
| Footer | `py-12 md:py-16` |

### 4.2 Container widths

```
Default content:   max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8
Narrow (prose):    max-w-3xl mx-auto px-4 sm:px-6
Centered auth:     max-w-md mx-auto px-4 sm:px-6
Wide (showcase):   max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8
```

The homepage uses `max-w-[1280px]` — all redesigned pages should match this cap to feel like the same product.

### 4.3 Grid gaps

| Context | Gap classes |
|---|---|
| Tight (text + inline elements) | `gap-3` |
| Card grids (feature blocks) | `gap-5 md:gap-6` |
| Larger card grids (3-col feature) | `gap-6 md:gap-8` |
| Spacious (testimonials, case studies) | `gap-8 md:gap-12` |

### 4.4 Internal card spacing

Cards use `p-6` padding. The featured/highlighted card uses `p-6 md:p-8`. Auth form containers use `p-6 sm:p-8`.

### 4.5 Stack gaps within a component

```
Icon → heading:            mb-4 / mb-5
Heading → paragraph:       mt-3 / mt-4
Paragraph → CTA:           mt-6 / mt-8
Between stacked items:     space-y-4 (lists) or gap-4 (grids)
```

---

## 5. Component Patterns

The UI primitive library lives in `src/components/ui/`. These components are built on **Base UI** (`@base-ui/react`) with CVA variants — they behave identically to shadcn/ui components. Always reach for these over raw HTML elements.

**Available primitives:**

| Category | Components |
|---|---|
| Layout | Separator |
| Forms | Input, Label, Button, Select, Checkbox, RadioGroup, Textarea |
| Overlays | Dialog, AlertDialog, Popover, Tooltip |
| Data | Badge, Avatar |
| Composite | MultiSelect, Combobox |

### 5.1 Hero patterns

**Centered hero** — used on Sign In, Sign Up:
Single column, content capped at `max-w-md mx-auto`. The heading addresses the visitor personally ("Welcome back", "Start for free"). One primary CTA only. Background is plain `bg-[--bg-app]`.

**Split hero** — used on Knowledge Hub, Tools:
`grid md:grid-cols-2 gap-12 items-center`. Text column left, visual column right on desktop. Stacked on mobile. Text column holds the heading, subheadline, and CTAs. Visual column holds a real product screenshot or a live demo snippet.

**Wide hero with stat strip** — used on Pricing, Customers, Community:
Full-width heading centered, supporting subheadline centered, then a `grid sm:grid-cols-2 lg:grid-cols-4` stat block below. Background can use a subtle `bg-[--accent-soft]` top-of-page tint.

### 5.2 Feature blocks

**3-column feature grid** — the workhorse:
```
grid md:grid-cols-3 gap-6 md:gap-8
Each card: rounded-xl border border-[--border] bg-[--bg-card] p-6
Icon container: size-12 rounded-xl bg-[--accent-soft] text-[--accent]
```

**Alternating image-text rows** — for deeper feature explanations:
```
Odd rows: grid md:grid-cols-2 — text left, image right
Even rows: grid md:grid-cols-2 — image left, text right
On mobile: always stacked, image below text
```

**Stat blocks** — for credibility:
Bold number (`text-3xl font-bold text-[--accent]`) + label (`text-xs uppercase tracking-wider text-[--text-tertiary]`) + optional short description (`text-sm text-[--text-secondary]`). Arranged in a `grid grid-cols-2 sm:grid-cols-4 gap-6` strip.

### 5.3 Card variants

**Article card (Knowledge Hub):**
```
rounded-xl border border-[--border] bg-[--bg-card] overflow-hidden
  Image: aspect-video object-cover (Next.js Image component)
  Body: p-5
    Category chip: rounded-full bg-[--accent-soft] text-[--accent] text-xs px-3 py-1
    Title: text-lg font-semibold text-[--text-primary] mt-2
    Excerpt: text-sm text-[--text-secondary] mt-2 line-clamp-2
    Meta: text-xs text-[--text-tertiary] mt-4 (date, read time)
```

**Tool card (Tools):**
```
rounded-xl border border-[--border] bg-[--bg-card] p-6
  Icon: size-10 rounded-lg bg-[--accent-soft] text-[--accent]
  Name: text-lg font-semibold text-[--text-primary] mt-4
  Description: text-sm text-[--text-secondary] mt-2 (1-2 lines)
  CTA link: text-[--accent] text-sm font-medium mt-4 inline-flex items-center gap-1
```

**Pricing tier card:**
```
rounded-xl border border-[--border] bg-[--bg-card] p-6
Recommended variant: bg-[--accent-soft] border-[--accent]/30 + "Recommended" badge
  Tier name: text-lg font-semibold text-[--text-primary]
  Price: text-3xl font-bold text-[--text-primary]
  Period: text-sm text-[--text-tertiary]
  Feature list: space-y-3 mt-6, each item flex items-start gap-3
    CheckCircle2 (size 16, text-[--success]) for included
    Minus (size 16, text-[--text-tertiary]) for excluded
  CTA: full-width Button, primary for recommended, outline for others
```

**Testimonial / quote card:**
```
rounded-xl border border-[--border] bg-[--bg-card] p-6
  Stars (optional): flex gap-1 text-[--warning] (Star icon filled)
  Quote: text-sm text-[--text-primary] leading-6 mt-3
  Attribution: flex items-center gap-3 mt-5
    Avatar: size-10 rounded-full ring-2 ring-[--border]
    Name: text-sm font-semibold text-[--text-primary]
    Role + Company: text-xs text-[--text-secondary]
```

### 5.4 CTA variants

**Primary CTA:**
```
inline-flex h-12 items-center justify-center gap-2 rounded-xl
bg-[--accent] px-6 text-sm font-semibold text-[--primary-foreground]
shadow-lg hover:bg-[--accent-hover]
transition-[background-color,border-color,box-shadow,color,transform] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]
```
Copy: action-oriented, first-person, time-bound ("Get started free", "Try Atlas Copilot", "See pricing")

**Secondary CTA (outline):**
```
inline-flex h-12 items-center justify-center rounded-xl
border border-[--border] bg-[--bg-card]/90 px-6
text-sm font-semibold text-[--text-primary]
backdrop-blur hover:bg-[--bg-hover]
```
Copy: exploratory, lower commitment ("Book a demo", "See how it works", "Learn more")

**Tertiary CTA (text link):**
```
inline-flex items-center gap-1.5 text-sm font-medium text-[--accent]
hover:underline underline-offset-4
```
Append `<ArrowRight size={14} />` from lucide-react. Copy: ("See all articles →", "View all tools →")

### 5.5 Social proof patterns

**Logo strip:**
A `flex flex-wrap items-center justify-center gap-8` row of grayscale customer logos. Apply `opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all` to each logo image. No logos taller than 32px.

**Stat banner:**
A `grid grid-cols-2 sm:grid-cols-4 gap-8` strip. Each stat: bold number in `text-3xl font-bold text-[--accent]` + label in `text-xs uppercase tracking-wider text-[--text-tertiary]`. Use rounded-xl border bg-[--bg-card] p-6 as the container, or sit it directly on the page background.

**Testimonial wall:**
A `grid md:grid-cols-3 gap-6` of quote cards (see §5.3). On mobile, a single-column scroll. Consider `md:col-span-2` for a featured/long quote.

---

## 6. Iconography Rules

**All icons come from `lucide-react`. No exceptions.**

- Never use Material Symbols spans (`<span class="material-symbols-outlined">`)
- Never use icon fonts
- Never paste raw SVG markup into JSX

### 6.1 Standard sizes

| Usage | Size prop | Pixel size |
|---|---|---|
| Inline in text | `size={14}` | 14px |
| Small UI (button icons, inline) | `size={16}` | 16px |
| Standard UI (nav, badges) | `size={18}` or `size={20}` | 18–20px |
| Card / feature icons (standalone) | `size={24}` | 24px |
| Section accent icons | `size={24}` | 24px inside `size-12 rounded-xl` container |
| Large / decorative | `size={32}` to `size={48}` | Use sparingly |

### 6.2 Icon color rules

- Default: inherit from surrounding text (`currentColor`) — do not set an explicit color unless needed
- Feature icons in `bg-[--accent-soft]` containers: `text-[--accent]`
- Icon on hover inside group: `group-hover:text-[--primary-foreground]`
- Status icons: `text-[--success]`, `text-[--warning]`, `text-[--danger]`

### 6.3 Icon container pattern (feature blocks)

```tsx
<span className="flex size-12 items-center justify-center rounded-xl bg-[--accent-soft] text-[--accent] group-hover:bg-[--accent] group-hover:text-[--primary-foreground] transition-colors">
  <SomeIcon size={24} aria-hidden="true" />
</span>
```

Always add `aria-hidden="true"` to decorative icons.

### 6.4 Recommended icons per page

These create visual consistency as users navigate between pages.

**Knowledge Hub:** `BookOpen`, `Search`, `FileText`, `Globe2`, `Library`, `BookMarked`, `GraduationCap`

**Tools:** `Wand2`, `Sparkles`, `Wrench`, `FileEdit`, `Calculator`, `Download`, `Zap`

**Community:** `UsersRound`, `MessageSquareText`, `Heart`, `ThumbsUp`, `Shield`, `Trophy`

**Customers:** `Building2`, `Users`, `Quote`, `Star`, `TrendingUp`, `MapPin`

**Pricing:** `Check`, `Minus`, `HelpCircle`, `Zap`, `Shield`, `CreditCard`

**Sign In / Sign Up:** `Mail`, `Lock`, `Eye`, `EyeOff`, `ArrowRight`, `Globe2`, `CheckCircle2`

**Shared / nav:** `Menu`, `X`, `Sun`, `Moon`, `ChevronDown`, `ArrowRight`, `ExternalLink`

---

## 7. Imagery & Illustration

### 7.1 Hero visuals — hierarchy of preference

1. **Real Atlas HR UI screenshot** (highest credibility — shows actual product)
2. **Mockup of Atlas HR UI** (acceptable if real screenshot not available)
3. **Abstract gradient or geometric shape** (acceptable for non-content pages)
4. **Third-party stock illustration** (avoid unless there is no better option)
5. **Stock photos of people at laptops** — never use

### 7.2 File format rules

| Content type | Format | Reason |
|---|---|---|
| Product screenshots | WebP | Smaller than PNG, widely supported |
| Simple graphics, logos | SVG | Infinite resolution, tiny file size |
| Complex photos | WebP or JPEG at 80% quality | Balance quality and size |
| Animated content | CSS animation only — no GIF | GIF performance is poor |

### 7.3 Next.js Image component usage

All images must use the Next.js `<Image>` component:

```tsx
import Image from "next/image";

// Above-fold (hero) image — preload it
<Image
  src="/screenshots/knowledge-hub.webp"
  alt="Atlas HR Knowledge Hub showing Nigeria labor law articles"
  width={1200}
  height={800}
  priority   // above-fold only
  sizes="(max-width: 768px) 100vw, 50vw"
  className="rounded-xl object-cover"
/>

// Below-fold image — lazy load (default, no priority prop)
<Image
  src="/screenshots/tool-generator.webp"
  alt="Atlas HR payroll generator tool"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 640px"
  className="rounded-xl object-cover"
/>
```

### 7.4 What we do not do

- No video backgrounds in hero sections (kills 3G users)
- No animated GIFs (replaced by CSS transitions or static images)
- No 3D rendered isometric illustrations (overused 2020–2023 visual trend)
- No stock photos of generic office workers shaking hands or looking at whiteboards
- No illustrations that are purely decorative with no informational value
- No images without `alt` text describing their content (accessibility + SEO)

---

## 8. Mobile Breakpoints & Behavior

Atlas HR's target users in Nigeria, India, Kenya, and the Philippines predominantly access the product on mobile. Mobile is the design canvas; desktop is the upgrade.

### 8.1 Breakpoint table

| Breakpoint | Min width | Primary behavior |
|---|---|---|
| Default | < 640px | Single column, stacked, full-width |
| `sm:` | ≥ 640px | Slightly more breathing room, some side-by-side |
| `md:` | ≥ 768px | 2-column grids, nav goes horizontal |
| `lg:` | ≥ 1024px | Full desktop layouts, 3/4-column grids |
| `xl:` | ≥ 1280px | Content width capped at `max-w-[1280px]` |
| `2xl:` | ≥ 1536px | Content stays at xl cap, whitespace grows |

### 8.2 Touch targets

Every interactive element (buttons, links, icon buttons) must have a minimum touch target of **44×44 pixels**. Icon-only buttons use `size-11` or `h-11 w-11` as minimum.

```tsx
// Correct — 44px touch target
<button className="flex h-11 w-11 items-center justify-center rounded-lg">
  <Menu size={20} />
</button>

// Wrong — too small
<button className="flex h-8 w-8 items-center justify-center rounded-lg">
  <Menu size={16} />
</button>
```

### 8.3 Typography scaling on mobile

- Hero headlines start at `text-4xl` on mobile, scale to `text-5xl sm:text-6xl lg:text-7xl`
- Section headings start at `text-2xl` on mobile, scale to `text-3xl md:text-4xl`
- Body text stays at `text-base` (16px) — never go below 14px for paragraph text on mobile

### 8.4 Navigation on mobile

The `PublicNav` component already implements correct mobile behavior:
- Desktop: horizontal link list + sign in + CTA button
- Mobile: hamburger (`Menu` icon) opens animated drawer (`framer-motion AnimatePresence`)
- Drawer contains: all nav links + sign in + get started buttons (full-width, side by side)
- Do not change this pattern in redesigns — it is already correct

### 8.5 Grid collapse rules

| Desktop grid | Mobile collapse |
|---|---|
| `md:grid-cols-2` | Single column, stacked |
| `md:grid-cols-3` | Single column, stacked |
| `md:grid-cols-4` | `grid-cols-2` (pairs), or single column |
| Split hero (2-col) | Text on top, image below |
| Stat strip (4-col) | `grid-cols-2` |

### 8.6 Image responsive behavior

- Hero images: `sizes="100vw"` on mobile, narrower on desktop
- Card images: `sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 400px"`
- All images: `object-cover` with explicit width/height to prevent layout shift (CLS)

---

## 9. Footer Pattern

The footer is already implemented in `src/components/layout/footer.tsx` and is shared across all public pages. It should not be rebuilt per-page — it is a shared layout component. The design spec here describes the canonical structure for reference.

### 9.1 Structure

```
<footer bg-[--bg-card] border-t border-[--border]>
  <div max-w-[1280px] py-12 md:py-16>

    Top row — grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8:
      Brand block (lg:col-span-1, col-span-2 on smaller):
        Atlas HR logo (size-8 rounded-lg bg-[--accent] text-[--primary-foreground])
        "Atlas HR" wordmark (font-bold text-[--text-primary])
        Tagline: text-sm text-[--text-secondary] max-w-xs
        Social icons: Globe, MessageSquare, Code2 (lucide-react)
          h-8 w-8 rounded-md text-[--text-tertiary] hover:text-[--accent]

      Link columns (4 columns: Product / Resources / Company / Legal):
        Column heading: text-xs font-semibold uppercase tracking-wider text-[--text-tertiary]
        Links: text-sm text-[--text-secondary] hover:text-[--accent]

    Bottom row — flex justify-between border-t border-[--border] pt-6 mt-10:
      Copyright: text-xs text-[--text-tertiary]
      "Built for HR professionals in 50+ countries": text-xs text-[--text-tertiary]
```

### 9.2 Footer link columns

| Product | Resources | Company | Legal |
|---|---|---|---|
| Knowledge Hub | Community | Press Kit | Privacy Policy |
| Tools & Generators | Learning | Help Center | Terms of Service |
| Templates | Glossary | Contact | Cookie Policy |
| Atlas Copilot | Country Guides | Status | Acceptable Use |
| Pricing | Customer Stories | | DPA |
| | | | Do Not Sell or Share |

### 9.3 Regional emphasis (future enhancement)

A planned addition is a "Regions" column or callout row above the link grid, highlighting the 4 primary markets:

```
Nigeria · India · Kenya · Philippines
Each with a short phrase: "P.A.Y.E ready" / "EPF & ESI aware" / etc.
```

This is not implemented yet — do not add it in redesigns unless specifically tasked.

---

## 10. Page-Specific Design Notes

### 10.1 Knowledge Hub (`/knowledge`)

**Primary question the page answers:** "Where do I find reliable HR law and guidance for my country?"

**Hero:** The primary CTA is a **search input**, not a button. The hero heading is something like "HR knowledge that knows where you work." Below the heading sits a full-width search bar (`rounded-xl border border-[--border] bg-[--bg-card] shadow-sm`) with a `Search` icon (lucide-react) on the left and a "Search" button on the right. This signals immediately that this is a knowledge retrieval tool.

**Above-the-fold structure:**
1. Hero with search bar
2. Country quick-filters (Nigeria, India, Kenya, Philippines, + "All countries") as `rounded-full` chip buttons
3. "Today's Brief" — a featured article in a magazine-cover treatment (`md:col-span-2 bg-[--accent-soft]` card)

**Content grid:** Below the hero, a `grid md:grid-cols-3 gap-6` of article cards. The featured article occupies `col-span-2` with a larger image. Regular articles occupy 1 column.

**Categories strip:** A `flex flex-wrap gap-2` row of category chips (Labor Law, Payroll, Benefits, Compliance, etc.) sitting between the hero and content grid.

### 10.2 Tools (`/tools`)

**Primary question:** "What can I generate or calculate with Atlas HR?"

**Hero:** Communicates the value of AI-assisted generation. Heading emphasizes speed and compliance ("Generate compliant HR documents in seconds"). The subheadline names specific outputs (payroll slips, offer letters, severance calculations).

**Tool categorization:** Tools are grouped into 3–4 categories (Document Generators, Calculators, Policy Builders, Compliance Checkers). Each category gets a section heading (`h2`) with its own `grid md:grid-cols-3 gap-5` of tool cards.

**Tool card output preview:** Each tool card should include a 1–2 line "output preview" showing what the tool produces. This grounds the card in concrete value.

**Hero visual:** A real screenshot of the tool generation interface (the AI Copilot input + output panel). If unavailable, a terminal-style mockup (as seen on the homepage) showing a sample interaction.

### 10.3 Community (`/community`)

**Primary question:** "Is there a community of HR professionals I can connect with and learn from?"

**Hero:** Emphasizes activity — recent posts, active members. Include a live-ish stat block (posts this week, members, countries represented).

**Anonymous posting feature:** This is a differentiator. The hero or the section immediately below it should explicitly call out "Post anonymously" as a safety feature for HR pros who can't ask sensitive questions publicly.

**Structure:**
1. Hero + stats
2. Featured/trending threads (3 cards)
3. Category filters (Labor Law Questions, Payroll Help, Career Growth, Policy Sharing)
4. Recent activity feed
5. CTA to sign up and participate

**Tone:** More conversational than other pages. This is the "people" page — copy should be warm and peer-to-peer.

### 10.4 Customers (`/customers`)

**Primary question:** "Has anyone like me found success with Atlas HR?"

**Hero:** Features 3–5 customer logos at large size (not grayscale — this is the hero, let them be colorful or branded). Heading emphasizes outcomes, not features ("Teams across 12 countries manage HR with Atlas HR").

**Case study format:** Long-form case studies preferred over short 3-line testimonials. Each case study card shows:
- Company name + logo
- Industry + team size + countries
- "The challenge" (1-2 sentences)
- "The outcome" (1-2 stats)
- Link to full case study

**"Customers like you" segmentation:** Below the full customer list, offer a filter or callout row segmented by company size (Solo HR Manager, 10–50 person team, 50+ enterprise), industry, and region. This helps visitors self-identify.

**Trust signals:** Show the total number of customers, countries covered, and a satisfaction stat (NPS or rating) in a stat banner near the top.

### 10.5 Pricing (`/pricing`)

**Primary question:** "What does Atlas HR cost, and does the value justify it?"

**Tier structure:** 4 visible tiers — Free · Pro · Team · Business. Enterprise is a "Contact us" tile.

**Annual/monthly toggle:** A `rounded-full` pill toggle sitting above the tier grid. "Save 20% with annual" label next to it. Active state: `bg-[--accent] text-[--primary-foreground]` for the selected period.

**Tier grid:** `grid md:grid-cols-4 gap-5`. The Pro tier (or Team, depending on business decision) carries the "Recommended" treatment.

**Feature comparison table:** Below the tier cards, a full comparison table showing every feature row. Use `CheckCircle2` (success) and `Minus` (tertiary) icons. Sticky header row on desktop scroll.

**FAQ section:** 8–10 frequently asked questions in an accordion pattern using the `Dialog` or a disclosure pattern. Cover: free trial length, payment methods, cancellation, country support, data residency.

**Trust signals below tiers:** Refund policy note, security badges (SOC 2 mention), support hours.

### 10.6 Sign In (`/sign-in`)

**Primary question:** "How do I get back into my Atlas HR account?"

**Layout:** Centered single column, `max-w-md mx-auto`. Background: `bg-[--bg-app]` — plain, no distractions.

**Heading:** "Welcome back" — not "Sign In" or "Login". Conversational, not transactional.

**Form structure:**
1. Email input (label "Work email")
2. Password input with `Eye`/`EyeOff` toggle
3. "Forgot password?" link (right-aligned, below password)
4. Primary CTA: "Sign in" (full-width `Button` at `h-12`)
5. Divider: "or continue with"
6. OAuth buttons: Google · LinkedIn (stacked on mobile, side-by-side on sm+)

**Footer link:** "Don't have an account? Start for free →" below the form.

**No marketing noise:** No feature lists, no testimonials, no pricing mentions on this page. It is purely a utility page.

### 10.7 Sign Up (`/sign-up`)

**Primary question:** "How do I create an Atlas HR account?"

**Layout:** Same centered single column as Sign In, `max-w-md mx-auto`.

**Heading:** "Start for free" — emphasizes no cost, low friction.

**Subheadline:** "No credit card required. Set up in 2 minutes." — two friction-reducers in one line.

**Form structure:**
1. Full name input
2. Work email input
3. Password input with strength indicator (optional — use only if the UX is polished)
4. Terms checkbox: "I agree to the Terms of Service and Privacy Policy" (links inline)
5. Primary CTA: "Create free account" (full-width `Button` at `h-12`)
6. Divider: "or sign up with"
7. OAuth buttons: Google · LinkedIn (same pattern as Sign In)

**Footer link:** "Already have an account? Sign in →" below the form.

**OAuth prominence:** OAuth should be visually equal to or slightly above the email form — most users in the target market will prefer OAuth. Consider placing OAuth buttons above the form divider.

---

## 11. Anti-Patterns (What NOT to Do)

This section exists because of specific past failures. Every item here represents something that caused a broken page or a regression. Read it before touching any public page.

### 11.1 Code anti-patterns

**Never paste raw Stitch HTML into a Next.js file.**
Stitch HTML uses Material Symbols icon spans, Material Design CSS tokens (`--sf-primary`, `--sf-on-surface`, `--sf-primary-container`), and raw HTML form elements. None of these work in the Atlas HR token system. The correct approach is to extract the *content* (copy, structure, data) from Stitch output and rebuild it using the token system and `src/components/ui/` primitives.

**Never use Material Symbols icon spans.**
```html
<!-- WRONG — will break without the Material Symbols font loaded -->
<span class="material-symbols-outlined">search</span>

<!-- CORRECT — lucide-react -->
import { Search } from "lucide-react";
<Search size={20} aria-hidden="true" />
```

**Never use raw HTML form elements in redesigned pages.**
```tsx
// WRONG
<input type="email" className="border rounded px-3 py-2" />
<button className="bg-blue-600 text-white px-4 py-2">Submit</button>

// CORRECT
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
<Input type="email" placeholder="Work email" />
<Button>Submit</Button>
```

**Never hardcode Tailwind color classes.**
```tsx
// WRONG — breaks dark mode, breaks theme switching
<div className="bg-blue-600 text-white" />
<div className="bg-gray-50 text-slate-900" />
<div className="bg-white" />

// CORRECT — uses tokens, respects all themes
<div className="bg-[--accent] text-[--primary-foreground]" />
<div className="bg-[--bg-hover] text-[--text-primary]" />
<div className="bg-[--bg-card]" />
```

**Never use `--sf-*` or other Material Design tokens in new code.**
```tsx
// WRONG — Stitch/Material token
<div style={{ background: "var(--sf-primary-container)" }} />

// CORRECT — Atlas HR token
<div className="bg-[--accent-soft]" />
```

**Never invent new CSS tokens.** Use the 18 tokens in `globals.css`. If a token is missing, make the design work with what exists. Adding tokens requires a deliberate decision and a `globals.css` edit — not a spontaneous style attribute.

### 11.2 Process anti-patterns

**Never build more than one page per session.**
Each page gets its own session, its own commit, its own review. If page 3 breaks, pages 1 and 2 remain intact. This is the protocol that replaces the previous bulk-paste approach.

**Never assume dark mode is fine without testing.**
Every redesigned page must be visually verified in both light and dark mode before it is considered done. The `data-theme="dark"` attribute on `<html>` triggers dark tokens. The theme toggle button in the nav lets you switch in the browser.

**Never skip the spec.**
If you find yourself thinking "this page is simple enough to just write" — stop. Read the relevant section of this spec first. It takes 2 minutes and prevents the page from drifting from the visual language of the other pages.

**Never use `font-normal` on a heading.** Headings always carry weight. If the design calls for a lighter feel, use a smaller size, not a lighter weight.

**Never put a feature list on Sign In or Sign Up.** Those are utility pages. Marketing belongs on the landing page.

---

## 12. Implementation Checklist

Use this checklist before marking any redesigned page as complete:

- [ ] All colors reference `--token` variables — no hex values, no Tailwind color classes
- [ ] All icons from `lucide-react` — no Material Symbols spans
- [ ] All interactive elements use `src/components/ui/` primitives — no raw `<input>`, `<button>`, `<select>`
- [ ] All images use the Next.js `<Image>` component with `alt`, `width`, `height`, `sizes`
- [ ] Above-fold image has `priority` prop; below-fold does not
- [ ] Minimum touch target 44×44px on all interactive elements
- [ ] Page verified in light mode and dark mode
- [ ] Page verified at 390px (mobile), 768px (tablet), 1280px (desktop)
- [ ] No inline `style` attributes using Material/Stitch tokens
- [ ] No `--sf-*` token references in the new page file
- [ ] No Tailwind hardcoded colors (`bg-blue-*`, `text-slate-*`, etc.)
- [ ] Page heading hierarchy is logical (one h1, h2 for sections, h3 for cards)
- [ ] All decorative icons have `aria-hidden="true"`
- [ ] All functional icons have an `aria-label` or are accompanied by visible text

---

*This spec is the source of truth for Atlas HR public pages. Update it when the design system evolves — do not let pages diverge from it.*
