export type UrgencyState = 'normal' | 'urgent' | 'today' | 'passed';

export interface UpdateUrgency {
  state: UrgencyState;
  label: string;
}

/**
 * Calculates a customer-facing urgency label for an update's application deadline
 * (`announcements.last_date`).
 *
 * `last_date` is a plain `date` column with no time-of-day component, so this
 * compares whole calendar days rather than raw timestamps — comparing via UTC
 * date components on both sides keeps the day-difference stable regardless of
 * the server's local timezone, avoiding misleading off-by-one results near
 * midnight boundaries.
 *
 * Returns null when there is no usable deadline (missing or an invalid value),
 * so callers can simply skip rendering a badge in that case.
 *
 * This is purely a display concern — it does not affect public visibility.
 * Visibility remains governed by `announcements.expires_at` wherever updates
 * are queried; this function only describes a deadline for updates that are
 * already known to be visible.
 */
export function getUpdateUrgency(
  lastDate: string | null | undefined,
  now: Date = new Date()
): UpdateUrgency | null {
  if (!lastDate) return null;

  const deadline = new Date(lastDate);
  if (Number.isNaN(deadline.getTime())) return null;

  const deadlineUTC = Date.UTC(deadline.getUTCFullYear(), deadline.getUTCMonth(), deadline.getUTCDate());
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const daysRemaining = Math.round((deadlineUTC - todayUTC) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { state: 'passed', label: 'Deadline passed' };
  }
  if (daysRemaining === 0) {
    return { state: 'today', label: 'Closes today' };
  }
  if (daysRemaining === 1) {
    return { state: 'urgent', label: '1 day left' };
  }
  if (daysRemaining <= 7) {
    return { state: 'urgent', label: `${daysRemaining} days left` };
  }

  const formatted = deadline.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  return { state: 'normal', label: `Closes ${formatted}` };
}

/**
 * Shared badge styling per urgency state, so the homepage, /updates, and
 * /updates/[slug] all use the same visual language instead of each page
 * defining its own colors.
 */
export function getUrgencyBadgeClasses(state: UrgencyState): string {
  switch (state) {
    case 'today':
    case 'urgent':
      return 'bg-rose-50 text-rose-700';
    case 'passed':
      return 'bg-slate-100 text-slate-500';
    case 'normal':
    default:
      return 'bg-blue-50 text-blue-700';
  }
}