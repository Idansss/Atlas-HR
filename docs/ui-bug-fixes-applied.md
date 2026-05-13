# Atlas HR UI Bug Fix Sprint Applied

Date: 2026-05-13

## Fixes

1. Cookie banner opacity and overlap
   - Updated the cookie consent overlay to block the page with a dimmed backdrop.
   - Made the banner panel fully opaque and above the backdrop.
   - Touched: `src/components/legal/CookieConsentBanner.tsx`

2. Cookie consent buttons
   - Consent choices persist to localStorage immediately.
   - The banner closes after a choice even if the profile persistence call fails.
   - Touched: `src/components/legal/CookieConsentBanner.tsx`, `src/components/legal/CookiePreferences.tsx`

3. Trial button loading state
   - Replaced the shared pricing-page pending state with per-plan loading state.
   - Failed checkout attempts now clear only the selected plan.
   - Touched: `src/app/(public)/pricing/pricing-client.tsx`

4. Icon hover visibility
   - Replaced hardcoded white hover icon text on accent backgrounds with `--primary-foreground`.
   - Added an explicit foreground color to the shared ghost button variant.
   - Touched: `src/components/ui/button.tsx`, affected icon-card and accent-hover components.

5. Auth spacing
   - Removed viewport-height centering from sign-in and sign-up pages.
   - Reduced header spacing so form, divider, and OAuth buttons remain grouped.
   - Touched: `src/app/(public)/sign-in/page.tsx`, `src/app/(public)/sign-up/page.tsx`

6. OAuth provider logos
   - Added inline Google and LinkedIn SVG logos.
   - OAuth buttons show the brand logo unless that provider is loading.
   - Touched: `src/components/auth/oauth-logos.tsx`, sign-in and sign-up pages.

7. Final CTA hardcoded blue treatment
   - Replaced the custom blue gradient treatment with theme accent and foreground tokens.
   - Touched: `src/components/sections/final-cta.tsx`

8. Pie chart label collision
   - Replaced default Recharts pie labels with a shared donut renderer.
   - Small slices hide in-chart labels and remain available through tooltip and legend.
   - Touched: `src/components/tools/CalculatorPage.tsx`

9. Mentorship route
   - Added `/community/mentorship` with a public waitlist form.
   - Added a Supabase migration for `mentorship_waitlist`.
   - Touched: `src/app/(public)/community/mentorship/page.tsx`, `actions.ts`, `supabase/migrations/0029_mentorship_waitlist.sql`

10. Cookie banner on 404 pages
   - Covered by the cookie banner overlay and opaque panel fix.
   - Touched: `src/components/legal/CookieConsentBanner.tsx`

## Commits

- `9d4f7a8` fix(ui): cookie banner opaque background, fix overlap
- `9849a03` fix(billing): cookie consent buttons now wire up to server action
- `cd8e069` fix(billing): trial buttons handle loading state per-plan and redirect properly
- `3914d98` fix(ui): icon visibility on hover across all ghost buttons
- `02b14aa` fix(auth): remove excessive vertical spacing on sign-in form
- `9d43d1c` feat(auth): add Google and LinkedIn brand SVG logos to OAuth buttons
- `9c690a7` fix(ui): replace hardcoded blue with theme accent token
- `772307f` fix(charts): pie chart label collision handling
- `14af2be` feat(community): add mentorship page with waitlist signup
