// Returns true when `date` falls within the window keyed by `key`.
// Keys: "today" | "week" | "month" | "all".
// "week" / "month" are last-N-days (rolling), not calendar boundaries.
export function withinWindow(date, key) {
  if (!key || key === "all") return true;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (key === "today") {
    return d.toDateString() === now.toDateString();
  }
  const days = key === "week" ? 7 : key === "month" ? 30 : null;
  if (days == null) return true;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d >= cutoff;
}

export const WINDOW_LABELS = {
  today: "Today",
  week: "Week",
  month: "Month",
  all: "All",
};
