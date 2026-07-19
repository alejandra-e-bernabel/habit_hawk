# Habits overview — screen spec

The Habits tab lists every active habit the user is tracking, grouped by
cadence, with per-habit status (streak, completion, progress) surfaced inline.
Uses the Indigo pop tokens defined in `CLAUDE.md`.

---

## Screen structure

```
Header  (white, slim)
Summary card  (today's completion + best streak)
Section: Daily    → habit rows
Section: Weekly   → habit rows
Section: Monthly  → habit rows
Bottom navigation
```

Sections only render if they contain at least one habit. Order is fixed:
Daily, Weekly, Monthly.

---

## Header

- White background (`--color-surface`), hairline bottom border (`--color-border`).
- Title "Habits" left, `--color-text`, 18px / 600.
- Right side: a `plus` action in `--color-primary` (add habit) and a `settings`
  gear in `--color-text-muted`. Keep it to ~56px tall — no solid color bar.

---

## Summary card

A single card at the top of the list. White surface, `--radius-inner` (12px),
`--shadow-card`, ~14px padding.

- Left (flex-fill): label "Today" in `--color-text-muted` (13px), progress bar
  below it — track `--color-primary-soft`, fill `--color-primary-bright`, 8px,
  fully rounded. Right-aligned "3 of 5 done" in `--color-text`, 13px / 600.
- Right: best-streak pill — `--color-accent-soft` background, `flame` icon +
  number in `--color-accent-text`, fully rounded.

`completed_today / total_active` drives the fraction and the bar width.

---

## Section label

Cadence name in `--color-text-muted`, 12px / 600, sentence case, ~8px margin
below. One per group: "Daily", "Weekly", "Monthly".

---

## Habit row

White card, `--radius-inner` (12–14px), `--shadow-card`, 12px × 14px padding,
10px gap between rows. Three zones left to right:

### 1. Icon chip (fixed 38×38)

Rounded square (10px), `--color-primary-tint` background, icon in
`--color-primary`, 18px. One icon per habit category, e.g.:

| Habit type      | Icon           |
| --------------- | -------------- |
| Meditation      | `ti-yoga`      |
| Exercise / run  | `ti-run`       |
| Language        | `ti-language`  |
| Reading         | `ti-book`      |
| Gym / strength  | `ti-barbell`   |
| Cleaning        | `ti-sparkles`  |
| Finance         | `ti-wallet`    |

Fall back to a neutral icon (`ti-circle-dashed`) if a habit has no category.

### 2. Text block (flex-fill, min-width 0)

- Name: `--color-text`, 14px / 600, truncate on overflow.
- Meta line: `--color-text-muted`, 12px. Shows cadence, then — if a streak
  exists — a `·` separator and `flame` icon + "N day streak" in
  `--color-accent-text`.

### 3. Status control (right, cadence-dependent)

This is the important logic. The control changes by cadence:

**Daily → check circle.** A 27px tappable circle.
- Done today: filled `--color-accent`, white `check` icon.
- Not done: 1.5px `--color-border-strong` outline, transparent fill.
- Tapping toggles completion for today and updates the summary card + streak.

**Weekly / N× weekly → progress readout.** Right-aligned:
- "X of N" in `--color-primary`, 12px / 600.
- A row of N dots below — completed dots `--color-primary-bright`, remaining
  dots `--color-primary-soft`. When X = 0, use `--color-text-faint` for the
  "0 of N" text.

**Monthly → due chip.** A pill in `--color-text-muted` on `#F1F5F9`
(neutral) showing "Due in Nd" (or "Due today"). If already completed this
period, swap to a filled `--color-accent` check like the daily case.

---

## Interaction notes

- The status control (check circle / dots / chip) is the only tap target that
  mutates state. Tapping anywhere else on the row opens the habit detail page.
- If you'd rather completion happen only on the detail page, drop the inline
  check circle and let the whole row open detail — decide based on how you want
  the primary interaction to feel. The spec above assumes inline completion.

---

## Empty state

If the user has no habits, replace the list with a centered block: `ti-plus`
in a `--color-primary-tint` chip, "Start your first habit" (16px / 600), a
one-line description in `--color-text-muted`, and a primary "Add habit" button.

---

## Scaling note

Cadence grouping adds structure but lengthens the scroll past ~15 habits. If
that becomes a problem, switch to a flat list with a small cadence pill on each
row instead of section headers — the row anatomy above stays identical.