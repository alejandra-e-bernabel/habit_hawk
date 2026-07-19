# Statistics — screen spec

The Statistics tab summarizes the user's progress: headline metrics, a weekly
completion chart, and a per-habit breakdown. Uses the Indigo pop tokens from
`CLAUDE.md`. Every element below maps to the SQLAlchemy models in the Habit
Hawk schema; the query sketch for each is noted so it can be built directly.

All "this week" aggregations use a **Monday 00:00 boundary in the user's local
timezone** (`User.timezone`, IANA name). Convert `HabitLog.logged_for_date`
against that tz before bucketing — never aggregate on UTC.

---

## Screen structure

```
Header  (white, slim)
Range selector  (Week / Month / All time)
Metric grid  (2×2 compact tiles)
Weekly progress  (bar chart card)
Habit breakdown  (per-habit rows)
Bottom navigation
```

---

## Header

White background (`--color-surface`), hairline bottom border, title
"Statistics" in `--color-text` (18px / 600), settings gear in
`--color-text-muted`. No solid color bar.

---

## Range selector

Segmented control, full width. Track `--color-primary-tint`, active segment
filled `--color-primary` with white text, inactive segments `--color-text-muted`.
Segments: Week, Month, All time. The selected range drives every
range-dependent value below (points, completion, completed count, chart,
breakdown). **Current streak is exempt** — it's always the live value.

---

## Metric grid (2×2)

Four compact tiles. Each: icon + label (12px, `--color-text-muted`), big number
(24px / 600, `--color-text`), sub-label (11px, `--color-text-faint`).

| Tile            | Value | Source |
| --------------- | ----- | ------ |
| Current streak  | `current_streak` + "Best: N" | `HabitStreak` — headline = `MAX(current_streak)` across the user's active habits; "Best" = `MAX(longest_streak)`. Not range-dependent. |
| Points          | sum in range | `SUM(HabitLog.score_earned)` for the user over the range. This is the leaderboard pool (never spent) — **not** `CurrencyTransaction`. |
| Completion      | percentage | `completed_count / due_count` over the range (see note below). |
| Completed       | count in range | `COUNT(HabitLog WHERE status = completed)` over the range. |

Icons: `ti-flame` (streak, use `--color-accent-text`), `ti-star` (points),
`ti-trending-up` (completion), `ti-circle-check` (completed).

---

## Weekly progress (bar chart)

Card titled "Weekly progress". Subtitle right-aligned, `--color-text-faint`:
"N done · M frozen".

- Seven bars, Monday→Sunday. Height = `COUNT(HabitLog WHERE status = completed)`
  grouped by `logged_for_date` for that day.
- Past/other days: `#A5B4FC` (soft indigo). **Today**: solid `--color-primary`,
  with its day label also in `--color-primary` / 600. Future days: a 5px stub in
  `--color-border` with a "—" label.
- Subtitle counts: `N` = completed this week, `M` = `COUNT(status = frozen)`
  this week (`LogStatus.frozen`).

Query: one grouped select over `HabitLog` for the user where `logged_for_date`
falls in the current local week, bucketed by day, split by `status`.

Optional: stack or overlay a thin marker for `frozen` / `skipped` days so a
protected day reads differently from a genuine miss.

---

## Habit breakdown

Card titled "Habit breakdown". One row per active `Habit`
(`status = in_progress`, `is_active = true`), sorted by completion rate (or
streak) descending.

Row anatomy:
- Icon chip (34×34, `--color-primary-tint` bg, `--color-primary` icon) driven by
  `Habit.icon_name`.
- Name (13px / 500) with a right-aligned "X of Y" count.
- A thin progress bar below: track `--color-primary-soft`, fill
  `--color-primary-bright`, width = X / Y.

Where Y = due occurrences this week (from `period` + `target_count` +
`HabitScheduleDay`) and X = `COUNT(HabitLog WHERE status = completed)` this week
for that habit. A fully-complete habit (X = Y) can show its count in
`--color-accent-text` to reward it.

---

## Completion-rate / "due count" note

The denominator isn't stored — derive expected occurrences per habit for the
range from the schedule model:

- `period = daily`, no schedule days → one occurrence per day in range
  (× `target_count` if it can be done multiple times a day).
- `period = weekly` with `HabitScheduleDay` rows → count the matching weekdays
  in the range.
- `period = weekly` with no schedule days → `target_count` per week ("N times,
  any days").
- `period = monthly` → `target_count` per month.

Then decide how `frozen` and `skipped` logs affect it. Recommended: **exclude
`frozen` from the denominator** (a freeze protects the day, so it neither counts
as done nor as missed), and treat `skipped` as a miss (stays in the denominator,
not in the numerator). Document whichever you pick — it changes every percentage
on the page.

---

## Optional stats the schema already supports

- **Focus time**: `SUM(HabitLog.duration_minutes)` for `log`-type habits →
  "3h 20m focused this week".
- **Avg session rating**: `AVG(HabitLog.session_rating)` where not null.
- **Outcome mix**: completed / skipped / frozen counts as a small stacked bar.
- **Freezes available**: `COUNT(StreakFreeze WHERE status = available)` — if you
  want the freeze pool visible here as well as on Home.

---

## Empty states

Before any logs exist, keep each card but replace its body with a one-line
`--color-text-muted` message and a faint dashed `--color-border` placeholder
box where the chart/rows will render — so the page reads as intentional rather
than broken.