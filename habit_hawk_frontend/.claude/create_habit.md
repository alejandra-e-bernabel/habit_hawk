# Create habit — wizard spec

A six-step wizard for creating a habit. Uses the Indigo pop tokens from
`CLAUDE.md`. Each step writes to specific fields on the Habit Hawk schema;
mappings noted per step. On the final step, the whole set is persisted together.

---

## Shared wizard chrome

Every step shares the same frame:

- **Progress**: "Step N of 6" centered (11–12px, `--color-text-muted`) above a
  slim track (`--color-border`) with an `--color-primary` fill at `N / 6`.
- **Step icon**: a single indigo glyph in a `--color-primary-tint` rounded chip,
  centered. Consistent across steps — no mixed illustration styles.
- **Title**: centered, `--color-text`, 16–18px / 600. Optional one-line
  subtitle in `--color-text-muted` below.
- **Footer buttons** (bottom, hairline top border):
  - Step 1 shows **Cancel** (neutral ghost — `--color-text-muted` text,
    `--color-border` outline; not red, cancelling isn't destructive) + **Next**.
  - Steps 2–5 show **Back** (outlined indigo) + **Next** (solid
    `--color-primary`).
  - Step 6's primary is **Create habit** instead of Next.
- **Disabled Next**: when the step's required input is missing, render Next
  disabled — `--color-primary-soft` background, `--color-text-faint` text — not
  a washed-out lavender. Keep it visible, just clearly inactive.

Keep content top-aligned; these steps are short and shouldn't stretch to fill
the screen.

---

## Step 1 — Name & motivation

Fields:
- **Name** (required) → `Habit.name`. Text input, placeholder
  "e.g. Morning meditation", helper "Give it a clear, memorable name".
- **Why is this important?** (optional) → `Habit.motivation_note`. Textarea,
  placeholder "Your motivation keeps you going…".

Next is disabled until Name is non-empty.

---

## Step 2 — Icon

→ `Habit.icon_name`. A grid grouped by category (Exercise, Wellness, Learning,
Productivity, Creative, Home, Social, Finance, Other). Each icon is an outlined
glyph in a bordered square; the selected one gets `2px solid --color-primary`
and a `--color-primary-tint` fill. Optional step — Next is always enabled; store
a null/default `icon_name` if skipped.

---

## Step 3 — Tracking type

→ `Habit.habit_type`. Two selectable option cards:

- **Simple reminder** (`reminder`) — bell icon, "Mark it complete when done."
- **Timed session** (`log`) — timer icon, "Track duration with a timer."

Selected card uses the standard treatment: `2px solid --color-primary` border,
`--color-primary-tint` background, a filled check on the right.

**Conditional**: when Timed session is selected, reveal a **Target duration**
field (minutes) below the cards → `Habit.target_duration_minutes`. This is the
only place that value is captured; leave it NULL for reminder-type habits.

---

## Step 4 — Frequency

→ `Habit.period` + `Habit.target_count`. A three-way segmented control or card
row: Daily / Weekly / Monthly (`period`). Below it, a count field whose label
adapts to the period:

- Daily → "How many times per day?"
- Weekly → "How many times per week?"
- Monthly → "How many times per month?"

Default `target_count = 1`.

---

## Step 5 — Reminders

→ `HabitReminder` rows. Titled "When should we remind you?", subtitle
"Optional". A list of reminder rows, each: a clock icon + time (`remind_at`) and
an on/off toggle (`is_enabled`). An "Add reminder" dashed button appends a new
row (opens a time picker). A habit can carry several, so there's no cap.

This step fills the previously-blank screen. It's the only step that writes to
`HabitReminder`; if the user adds none, write no rows. (Scheduling the actual
`Notification` records from these reminders is a backend job, not part of this
form.)

---

## Step 6 — Schedule days & start date

→ `HabitScheduleDay` rows + `Habit.started_on`. Titled "Which days will you do
this?", subtitle "Optional — helps with planning".

- **Weekday picker**: Mon–Sun pills (`day_of_week` 0–6). Selected pills fill
  `--color-primary` with white text. Each selected day writes one
  `HabitScheduleDay` row. Leave empty for "any days, N times" habits — those
  rely on `target_count` alone.
- **Start date** (optional) → `Habit.started_on`. Date input, helper "Leave
  blank to start today".

**Conditional**: hide the weekday picker when `period = monthly` — specific
weekdays don't apply there.

Primary button reads **Create habit**.

---

## On submit ("Create habit")

Persist as one unit:

1. Insert the `Habit` (`name`, `motivation_note`, `icon_name`, `habit_type`,
   `period`, `target_count`, `target_duration_minutes`, `started_on`), with
   `status = in_progress` and `is_active = true`. If `started_on` is blank,
   default to today in the user's timezone.
2. Insert one `HabitScheduleDay` per selected weekday.
3. Insert one `HabitReminder` per reminder row.
4. Initialize a `HabitStreak` for the habit (`current_streak = 0`,
   `longest_streak = 0`, `last_completed_date = NULL`).

---

## Validation summary

- Step 1 Name is the only hard requirement to advance.
- `target_count` must be a positive integer (default 1).
- `target_duration_minutes` only collected/stored for `log`-type habits.
- Everything else (icon, motivation, reminders, schedule days, start date) is
  optional.