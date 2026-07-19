# Leaderboard — screen spec

The Leaderboard tab ranks the user against their friends by points earned this
week: a top-three podium, a ranked list below, and a pinned "you" row. Uses the
Indigo pop tokens from `CLAUDE.md`. Grounded in the Habit Hawk schema; query
sketches noted per element.

Ranking uses the same **Monday 00:00 boundary in the user's local timezone**
(`User.timezone`) as the Statistics week. Everyone's points are summed within
that window.

---

## Data source

- **Scope**: the current user plus their accepted friends. From `Friendship`
  where `status = accepted` and the user is `requester_id` or `addressee_id`;
  take the other side as the friend. (The model stores a directed pair — resolve
  both directions.)
- **Score per user**: `SUM(HabitLog.score_earned)` for that user where
  `logged_for_date` falls in the current local week. This is the leaderboard
  pool your comments mark as never spent — not `CurrencyTransaction`.
- **Week range label**: derived from the same Monday-local boundary
  (e.g. "Jul 12 – Jul 19").

---

## Screen structure

```
Header  (white, slim, + add-friend action)
Week selector  (‹ range ›, scope label)
Podium  (top 3, #1 center and taller)
Ranked list  (rank 4…N)
Pinned "you" row  (only when user is off-podium and off-screen)
Bottom navigation
```

---

## Header

White background, hairline bottom border, "Leaderboard" title in `--color-text`
(18px / 600). Right side: `ti-user-plus` in `--color-primary` (add/invite
friend — the leaderboard is only as good as the friend set) and a `ti-settings`
gear in `--color-text-muted`.

---

## Week selector

Centered. `ti-chevron-left` / `ti-chevron-right` in `--color-text-muted` flank
a two-line center: the date range (13px / 600, `--color-text`) and a scope line
"This week · friends" (11px, `--color-text-faint`). Disable the right chevron on
the current week (dim to `--color-border`).

---

## Podium (top 3)

Three columns, base-aligned; center column (#1) larger and raised. Order left→
right is 2, 1, 3.

- Avatar: use the shared avatar resolution from `CLAUDE.md` (photo →
  profile icon → initials). #1 is 72px; #2 and #3 are 56px.
- Rank badge: small circle overlapping the avatar's bottom edge, filled
  `--color-primary`, white number, with a 2px page-colored border so it reads as
  a separate chip.
- #1 gets a `ti-trophy` in `#F59E0B` (gold) above the avatar — a one-off medal
  cue, the only warm color on the screen.
- Display name below (12–13px / 600) using the shared name rule (`first_name`,
  else `username`), then points: `ti-bolt` + number in `--color-accent-text`
  (cyan reward accent).

### Highlighting the current user

If the user is in the top 3, ring their avatar with `2px solid --color-primary`
and add a small "You" pill (`--color-primary-tint` bg, `--color-primary` text)
under their name.

---

## Ranked list (rank 4…N)

One card per user. White surface, 12px radius, `--shadow-card`, ~11px padding.
Left to right: rank number (`--color-text-muted`, 13px / 600, fixed width),
avatar (30px, shared resolution from `CLAUDE.md`), display name (flex-fill,
14px / 500), points (right, `--color-text`, 13px / 600). In this tight row show
just the display name — no `@username` secondary line.

### Current user in the list

If the user's rank falls in this range, give their row the highlight treatment:
`--color-primary-tint` background, `1.5px solid --color-primary` border, rank and
"(You)" suffix in `--color-primary`, avatar filled `--color-primary` with white
initials.

---

## Pinned "you" row

When the user is neither on the podium nor within the loaded list rows, pin their
row to the bottom of the list, separated by a subtle `···` divider. Same
highlight treatment as the in-list current-user row. This guarantees the user can
always see their own rank and points without scrolling — the single most
important leaderboard affordance. Omit it when the user is already visible above.

---

## Tie-breaking

Equal weekly scores must resolve to a stable order (e.g. two friends both on
300). Pick one rule and apply it in the sort and in any "by X" label:

- **Highest current streak** — secondary sort on `HabitStreak.current_streak`.
- **Reached the total first** — earliest `HabitLog.created_at` among the logs
  making up the tie.
- **Username** — last-resort alphabetical, fully deterministic.

Both of the first two are already in your data. Document the choice so ranks
don't shuffle between page loads.

---

## Not currently supported (needs new data)

- **Rank movement arrows** (up/down vs last week) need last week's finishing
  ranks. Add a small weekly `leaderboard_snapshot` (user, week_start, rank,
  score) written at week rollover, or recompute the prior week's sums on the fly.

---

## Empty / sparse states

- **No friends yet**: replace the list with an invite prompt — `ti-user-plus`
  in a `--color-primary-tint` chip, "Add friends to compete", and a primary
  "Invite a friend" button. The user can still see their own solo score above.
- **Fewer than 3 people**: render the podium with only the filled positions;
  don't show empty pedestals.