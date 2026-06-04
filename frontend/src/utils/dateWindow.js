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

// Returns true when `date` falls within the window of equal length immediately
// preceding the current window keyed by `key`. Returns false for "all".
export function withinPreviousWindow(date, key) {
  if (!key || key === "all") return false;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (key === "today") {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return d.toDateString() === yesterday.toDateString();
  }
  const days = key === "week" ? 7 : key === "month" ? 30 : null;
  if (days == null) return false;
  const start = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d >= start && d < end;
}

export const WINDOW_LABELS = {
  today: "Today",
  week: "Week",
  month: "Month",
  all: "All",
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysAgo(date) {
  const ms = Date.now() - new Date(date).getTime();
  return Math.floor(ms / DAY_MS);
}

export function agoLabel(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}
