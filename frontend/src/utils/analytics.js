import { withinWindow, withinPreviousWindow } from "./dateWindow";

const EXCLUDE_DEFAULT = new Set(["CANCELED", "REFUNDED"]);
const CATEGORIES = ["Sneakers", "Boots", "Running", "Formal", "Sandals"];

export function flattenOrderItems(orders, opts = {}) {
  const { window: win = "all", gender = "all", excludeStatuses = EXCLUDE_DEFAULT } = opts;
  const out = [];
  for (const o of orders ?? []) {
    if (excludeStatuses.has(o.status)) continue;
    if (!withinWindow(o.createdAt, win)) continue;
    for (const item of o.items ?? []) {
      const p = item.product ?? {};
      if (gender !== "all" && p.gender !== gender) continue;
      out.push({
        orderId: o._id,
        createdAt: o.createdAt,
        status: o.status,
        item,
        product: p,
      });
    }
  }
  return out;
}

export function topProducts(rows, n = 8) {
  const map = new Map();
  for (const r of rows) {
    const id = r.product?._id ?? r.product?.id;
    if (!id) continue;
    const key = String(id);
    const prev = map.get(key) ?? {
      productId: key,
      name: r.product.name,
      brand: r.product.brand,
      image: r.product.imageUrl ?? r.product.images?.[0],
      units: 0,
      revenue: 0,
    };
    prev.units += r.item.quantity ?? 0;
    prev.revenue += r.item.price ?? 0;
    map.set(key, prev);
  }
  return [...map.values()].sort((a, b) => b.units - a.units).slice(0, n);
}

export function topSizes(rows, n = 10) {
  const map = new Map();
  for (const r of rows) {
    const size = r.item.selectedSize;
    if (size == null) continue;
    map.set(size, (map.get(size) ?? 0) + (r.item.quantity ?? 0));
  }
  return [...map.entries()]
    .map(([size, units]) => ({ size, units }))
    .sort((a, b) => b.units - a.units)
    .slice(0, n);
}

export function topBrands(rows, n = 6) {
  const map = new Map();
  for (const r of rows) {
    const brand = r.product?.brand;
    if (!brand) continue;
    const prev = map.get(brand) ?? { brand, units: 0, revenue: 0 };
    prev.units += r.item.quantity ?? 0;
    prev.revenue += r.item.price ?? 0;
    map.set(brand, prev);
  }
  return [...map.values()].sort((a, b) => b.units - a.units).slice(0, n);
}

export function promoUsage(orders, opts = {}) {
  const { window: win = "all", excludeStatuses = EXCLUDE_DEFAULT } = opts;
  const map = new Map();
  for (const o of orders ?? []) {
    if (excludeStatuses.has(o.status)) continue;
    if (!withinWindow(o.createdAt, win)) continue;
    const code = o.promoCode;
    if (!code) continue;
    const prev = map.get(code) ?? { code, redemptions: 0, discount: 0, totalRevenue: 0 };
    prev.redemptions += 1;
    prev.discount += o.discount ?? 0;
    prev.totalRevenue += o.totalPrice ?? 0;
    map.set(code, prev);
  }
  return [...map.values()]
    .map((r) => ({ ...r, aov: r.redemptions ? Math.round(r.totalRevenue / r.redemptions) : 0 }))
    .sort((a, b) => b.redemptions - a.redemptions);
}

export function revenueByCategory(rows) {
  const map = new Map(CATEGORIES.map((c) => [c, { revenue: 0, units: 0, orders: new Set() }]));
  for (const r of rows) {
    const cat = r.product?.category;
    if (!map.has(cat)) continue;
    const bucket = map.get(cat);
    bucket.revenue += r.item.price ?? 0;
    bucket.units += r.item.quantity ?? 0;
    bucket.orders.add(String(r.orderId));
  }
  return [...map.entries()].map(([category, b]) => ({
    category,
    revenue: b.revenue,
    units: b.units,
    orders: b.orders.size,
  }));
}

function computeConversion(attempts, orders, predicate, opts) {
  const { excludeStatuses = EXCLUDE_DEFAULT } = opts ?? {};
  const attemptsIn = (attempts ?? []).filter((a) => predicate(a.createdAt));
  const ordersIn = (orders ?? []).filter(
    (o) => !excludeStatuses.has(o.status) && predicate(o.createdAt)
  );
  const conversion = attemptsIn.length ? Math.min(1, ordersIn.length / attemptsIn.length) : 0;
  const avgCartTotal = attemptsIn.length
    ? attemptsIn.reduce((s, a) => s + (a.cartTotal ?? 0), 0) / attemptsIn.length
    : 0;
  return {
    attempts: attemptsIn.length,
    orders: ordersIn.length,
    conversion,
    abandonmentRate: 1 - conversion,
    avgCartTotal,
  };
}

export function conversionStats(attempts, orders, opts = {}) {
  const { window: win = "all" } = opts;
  return computeConversion(attempts, orders, (d) => withinWindow(d, win), opts);
}

export function previousConversionStats(attempts, orders, opts = {}) {
  const { window: win = "all" } = opts;
  if (win === "all") {
    return { attempts: 0, orders: 0, conversion: 0, abandonmentRate: 0, avgCartTotal: 0 };
  }
  return computeConversion(attempts, orders, (d) => withinPreviousWindow(d, win), opts);
}

export function stockHealth(products) {
  let totalUnits = 0;
  let totalVariants = 0;
  let lowCount = 0;
  let outCount = 0;
  for (const p of products ?? []) {
    for (const v of p.variants ?? []) {
      totalVariants += 1;
      const s = v.stock ?? 0;
      totalUnits += s;
      if (s === 0) outCount += 1;
      else if (s < 5) lowCount += 1;
    }
  }
  const lowPct = totalVariants ? Math.round((lowCount / totalVariants) * 100) : 0;
  const outPct = totalVariants ? Math.round((outCount / totalVariants) * 100) : 0;
  return { totalUnits, totalVariants, lowCount, outCount, lowPct, outPct };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmtDay(d) {
  return d.toLocaleDateString("sr-RS", { day: "2-digit", month: "short" });
}

export function revenueTrend(orders, win, opts = {}) {
  const { excludeStatuses = EXCLUDE_DEFAULT } = opts;
  const filtered = (orders ?? []).filter(
    (o) => !excludeStatuses.has(o.status) && withinWindow(o.createdAt, win)
  );

  const now = new Date();
  let buckets;
  let bucketDays;

  if (win === "today") {
    buckets = [{ key: fmtDay(now), revenue: 0, orderCount: 0, start: startOfDay(now) }];
    bucketDays = 1;
  } else if (win === "week") {
    bucketDays = 1;
    buckets = Array.from({ length: 7 }, (_, i) => {
      const d = startOfDay(new Date(now.getTime() - (6 - i) * DAY_MS));
      return { key: fmtDay(d), revenue: 0, orderCount: 0, start: d };
    });
  } else if (win === "month") {
    bucketDays = 1;
    buckets = Array.from({ length: 30 }, (_, i) => {
      const d = startOfDay(new Date(now.getTime() - (29 - i) * DAY_MS));
      return { key: fmtDay(d), revenue: 0, orderCount: 0, start: d };
    });
  } else {
    if (filtered.length === 0) return [];
    const earliest = filtered.reduce(
      (acc, o) => (new Date(o.createdAt) < acc ? new Date(o.createdAt) : acc),
      new Date()
    );
    const weeks = Math.max(1, Math.ceil((now - earliest) / (7 * DAY_MS)));
    bucketDays = 7;
    buckets = Array.from({ length: weeks }, (_, i) => {
      const d = startOfDay(new Date(now.getTime() - (weeks - 1 - i) * 7 * DAY_MS));
      return { key: fmtDay(d), revenue: 0, orderCount: 0, start: d };
    });
  }

  for (const o of filtered) {
    const t = new Date(o.createdAt).getTime();
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (t >= buckets[i].start.getTime()) {
        const end = buckets[i].start.getTime() + bucketDays * DAY_MS;
        if (t < end) {
          buckets[i].revenue += o.totalPrice ?? 0;
          buckets[i].orderCount += 1;
        }
        break;
      }
    }
  }

  return buckets.map(({ key, revenue, orderCount }) => ({
    bucket: key,
    revenue,
    aov: orderCount ? Math.round(revenue / orderCount) : 0,
  }));
}
