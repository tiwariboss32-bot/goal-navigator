

## Plan: Three Improvements

### 1. Public Goals Page (Explore/Community)
- Create a new page `src/pages/PublicGoals.tsx` that fetches all goals where `is_public = true` and `share_slug IS NOT NULL` using the existing RLS policy ("Anyone can view public goals")
- Add a `fetchPublicGoals` function in `goalService.ts` that queries public goals with task counts
- Add route `/explore` in `App.tsx`
- Add "Explore" nav item in Dashboard sidebar (using `Globe` icon)

### 2. Hide Chat Text While Plan is Generating
- In `ChatMessages.tsx`, detect when an assistant message contains a partial `<plan>` tag (i.e., `<plan>` exists but no closing `</plan>` yet) — this means the plan JSON is still streaming
- During that state, show "Generating your plan..." placeholder instead of the raw JSON/HTML content
- Once streaming is done and the plan block is complete, `stripPlanFromText` will handle removing it cleanly as it already does

**Implementation**: In `ChatMessages.tsx`, add logic: if `isLoading` and the display text after stripping looks like partial plan content (or the raw content has `<plan>` without `</plan>`), show a "Generating plan..." bubble instead of the raw text.

### 3. Mobile Finalize FAB
- In `GoalChat.tsx`, when `plan` exists, render a floating action button (FAB) at the bottom-right on mobile (`md:hidden`) that scrolls/navigates to finalize
- This button will call `handleFinalize` directly — a small sticky button visible on mobile

### 4. Fix Build Error
- Change `npm:@supabase/supabase-js@2.57.2` to `https://esm.sh/@supabase/supabase-js@2` in `supabase/functions/create-checkout/index.ts`

### Files to Create/Edit
| File | Action |
|---|---|
| `src/lib/goalService.ts` | Add `fetchPublicGoals` function |
| `src/pages/PublicGoals.tsx` | New page listing public goals |
| `src/App.tsx` | Add `/explore` route |
| `src/pages/Dashboard.tsx` | Add "Explore" nav item |
| `src/components/chat/ChatMessages.tsx` | Hide raw plan content while streaming |
| `src/pages/GoalChat.tsx` | Add mobile FAB for finalize |
| `supabase/functions/create-checkout/index.ts` | Fix import |

