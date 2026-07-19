# Habit Tracker — Design System

Guidance for the visual design of the app. Read this before building or
restyling any UI. The look is **Indigo pop**: a clean, bright, modern SaaS
feel on a near-white canvas, with a cyan accent reserved for reward moments
(streaks, points, completions) so they stand out.

---

## Design principles

- **Light, airy background.** The page background is near-white, not olive/beige.
  Cards float on a very light neutral so content reads as the foreground.
- **Lighten the chrome.** Don't paint the whole top bar in a heavy saturated
  color. Use a white (or barely-tinted) header with an indigo title/icon accent,
  or a slim indigo bar — never a tall solid block that competes with content.
- **Cyan is the pop, and only the pop.** Reserve the accent strictly for
  reward/gamification UI (points, streak counts, earned badges). Everything else
  stays indigo or neutral. That restraint is what reads as professional.
- **Consistent spacing and radius.** All cards share the same radius, padding,
  and border treatment. Inconsistency is the main thing that reads as "unfinished."
- **Contrast is non-negotiable.** Completed/struck-through items must stay
  readable — dim them with a muted-but-legible color, never near-invisible gray.

---

## Color tokens

Drop this into `globals.css` and reference the variables everywhere.

```css
:root {
  --color-primary:        #4F46E5;  /* buttons, active nav, headers */
  --color-primary-hover:  #4338CA;
  --color-primary-bright: #6366F1;  /* progress fill, highlights */
  --color-primary-soft:   #E0E7FF;  /* progress track, soft fills */
  --color-primary-tint:   #EEF2FF;  /* selected / completed card background */

  --color-accent:         #06B6D4;  /* cyan — points, streaks, rewards */
  --color-accent-soft:    #CFFAFE;
  --color-accent-text:    #0E7490;  /* text on accent-soft */

  --color-page:           #F8FAFC;  /* app background */
  --color-surface:        #FFFFFF;  /* cards */
  --color-border:         #E5E7EB;

  --color-text:           #0F172A;
  --color-text-muted:     #64748B;
  --color-text-faint:     #94A3B8;  /* completed/struck items — still legible */

  --color-success:        #10B981;
  --color-danger:         #F43F5E;  /* streak flame, alerts */
}
```

### Tailwind mapping (optional)

If using Tailwind, expose the vars in `tailwind.config` so you get `bg-primary`,
`text-accent`, etc.:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary:          'var(--color-primary)',
      'primary-bright': 'var(--color-primary-bright)',
      'primary-soft':   'var(--color-primary-soft)',
      'primary-tint':   'var(--color-primary-tint)',
      accent:           'var(--color-accent)',
      'accent-soft':    'var(--color-accent-soft)',
      page:             'var(--color-page)',
      surface:          'var(--color-surface)',
    },
  },
}
```

---

## Layout tokens

Use these consistently across Home, Habits, Leaderboard, and Statistics.

```css
--radius-card:   16px;   /* all cards */
--radius-inner:  12px;   /* nested items, buttons */
--radius-pill:   999px;  /* badges, progress tracks */
--pad-card:      20px;
--gap-section:   16px;   /* between stacked cards */
--shadow-card:   0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
```

---

## Component rules

### Header

- Prefer a white header: `background: var(--color-surface)`, a hairline bottom
  border, title in `--color-text`, gear icon in `--color-text-muted`.
- If you keep a colored header, make it a **slim** bar in `--color-primary`
  (not the old dark forest green) and don't let it exceed ~64px tall.

### Cards

- `background: var(--color-surface)`, `border-radius: var(--radius-card)`,
  `box-shadow: var(--shadow-card)`, `padding: var(--pad-card)`.
- Drop the heavy borders where the soft shadow already separates the card from
  the page. One separation cue, not two.

### Progress bars

- Track `--color-primary-soft`, fill `--color-primary-bright`, both fully
  rounded (`--radius-pill`), ~8px tall.

### Badges / pills (points, streaks, "available")

- Background `--color-accent-soft`, text `--color-accent-text`. This is the pop.
- Keep the accent to reward UI only so it stays meaningful, not decorative.

### Completed items

- Text `--color-text-faint` with `text-decoration: line-through` — legible, not
  ghosted. Keep the checkmark in `--color-success`. Optionally tint the whole
  card `--color-primary-tint` to signal "done" instead of graying the text out.

### Bottom navigation

- White background, hairline top border. Active tab icon + label in
  `--color-primary`; inactive in `--color-text-muted`. Consistent icon weight.

### Avatars and display names

Users now carry profile data (`first_name`, `last_name`, `profile_icon_name`,
`profile_image_url`) alongside `username`. Resolve both the same way everywhere
an avatar or name appears (leaderboard, profile, headers).

**Avatar — first non-empty wins:**
1. `profile_image_url` → the photo, circular, `object-fit: cover`.
2. `profile_icon_name` → that icon centered in a `--color-primary-tint` circle,
   glyph in `--color-primary`.
3. Initials → `first_name[0] + last_name[0]`, uppercased, on a
   `--color-primary-tint` circle. If both names are empty, use `username[0]`.

Keep the circle size per context (e.g. 72/56 on the podium, 30 in list rows).
The current user's avatar can take a `2px solid --color-primary` ring for
emphasis.

**Display name — first non-empty wins:**
1. `first_name` (+ ` last_name[0].` if you want a last initial).
2. `username`.

Where space allows on social screens, show the display name as the primary
label and `@username` as a muted secondary line. In tight rows, show just the
display name.

### Typography

- Two weights only: 400 regular, 500/600 for titles and numbers.
- Big stat numbers (streak days, points, completion %) can go large and bold —
  that's where visual energy belongs, not in the chrome.
- Sentence case everywhere.

---

## Specific fixes for the current screens

1. **Replace the olive/beige page background** with `--color-page`. Single
   biggest upgrade.
2. **Lighten the top bars** across all four tabs — they're currently too heavy.
   Move them to a white header or a slim `--color-primary` bar.
3. **Fix the completed "Exercise" card** — struck text is near-invisible; use
   `--color-text-faint` and consider the `--color-primary-tint` card treatment.
4. **Unify card radius/padding/shadow** — Home cards, Habits rows, and Stats
   cards should all use the same tokens.
5. **Give the empty Statistics states** ("Chart will appear here") a light
   dashed placeholder box in `--color-border` so they read as intentional.
6. **Move the streak-freeze mini-stats** (Earned/Available/Applied) to
   `--color-primary-tint` tiles with the number in `--color-primary` — cleaner
   than the current flat green boxes.
7. **Recolor reward UI to cyan** — points totals, streak counts, and the
   trophy/leaderboard highlights use `--color-accent` / `--color-accent-soft`
   so they pop against the indigo.