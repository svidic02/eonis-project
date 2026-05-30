export function matchesProduct(product, filters, exclude = null) {
  const f = filters;
  if (exclude !== "gender" && f.gender && product.gender !== f.gender) return false;
  if (exclude !== "category" && f.category && product.category !== f.category) return false;
  if (exclude !== "brand" && f.brand?.length && !f.brand.includes(product.brand)) return false;
  if (exclude !== "priceMin" && exclude !== "priceMax") {
    if (f.priceMin != null && product.price < f.priceMin) return false;
    if (f.priceMax != null && product.price > f.priceMax) return false;
  } else if (exclude === "priceMin") {
    if (f.priceMax != null && product.price > f.priceMax) return false;
  } else if (exclude === "priceMax") {
    if (f.priceMin != null && product.price < f.priceMin) return false;
  }
  const variants = (product.variants ?? []).filter((v) => v.stock > 0);
  if (exclude !== "color" && f.color?.length) {
    if (!variants.some((v) => f.color.includes(v.color))) return false;
  }
  if (exclude !== "size" && f.size?.length) {
    if (!variants.some((v) => f.size.includes(String(v.size)))) return false;
  }
  return true;
}

export function filterProducts(products, filters) {
  return products.filter((p) => matchesProduct(p, filters));
}

// Returns Map<value, count> of values that would still yield ≥1 product
// when only the given facet is changed (leave-one-out).
export function availableValues(products, filters, facetKey) {
  const base = products.filter((p) => matchesProduct(p, filters, facetKey));
  const counts = new Map();
  const bump = (v) => counts.set(v, (counts.get(v) ?? 0) + 1);

  for (const p of base) {
    if (facetKey === "gender") bump(p.gender);
    else if (facetKey === "category") bump(p.category);
    else if (facetKey === "brand") {
      if (p.brand) bump(p.brand);
    } else if (facetKey === "color") {
      const seen = new Set();
      for (const v of p.variants ?? []) {
        if (v.stock > 0 && !seen.has(v.color)) {
          seen.add(v.color);
          bump(v.color);
        }
      }
    } else if (facetKey === "size") {
      const seen = new Set();
      for (const v of p.variants ?? []) {
        const s = String(v.size);
        if (v.stock > 0 && !seen.has(s)) {
          seen.add(s);
          bump(s);
        }
      }
    }
  }
  return counts;
}

export function priceBounds(products) {
  if (!products.length) return { min: 0, max: 0 };
  let min = Infinity, max = -Infinity;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return { min, max };
}

export function allBrands(products) {
  return Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();
}

export function allColors(products) {
  const s = new Set();
  for (const p of products) for (const v of p.variants ?? []) if (v.color) s.add(v.color);
  return Array.from(s).sort();
}

export function allSizes(products) {
  const s = new Set();
  for (const p of products) for (const v of p.variants ?? []) if (v.size != null) s.add(String(v.size));
  return Array.from(s).sort((a, b) => Number(a) - Number(b));
}
