import React from "react";
import classes from "./filters.module.css";
import { GENDERS, CATEGORIES } from "../../constants/productEnums";
import {
  availableValues,
  allBrands,
  allColors,
  allSizes,
  priceBounds,
} from "../../utils/facets";

function Pill({ label, count, active, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`${classes.pill} ${active ? classes.active : ""}`}
      disabled={disabled && !active}
      onClick={onClick}
    >
      {label}
      {count != null && <span className={classes.count}>({count})</span>}
    </button>
  );
}

export default function Filters({ products, filters, colorMap = {}, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  const toggleSingle = (key, value) =>
    set({ [key]: filters[key] === value ? null : value });

  const toggleMulti = (key, value) => {
    const current = filters[key] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    set({ [key]: next.length ? next : [] });
  };

  const genderCounts = availableValues(products, filters, "gender");
  const categoryCounts = availableValues(products, filters, "category");
  const brandCounts = availableValues(products, filters, "brand");
  const colorCounts = availableValues(products, filters, "color");
  const sizeCounts = availableValues(products, filters, "size");

  const brands = allBrands(products);
  const colors = allColors(products);
  const sizes = allSizes(products);
  const { min: pMin, max: pMax } = priceBounds(products);

  const hasAny =
    filters.gender ||
    filters.category ||
    (filters.brand?.length ?? 0) > 0 ||
    (filters.color?.length ?? 0) > 0 ||
    (filters.size?.length ?? 0) > 0 ||
    filters.priceMin != null ||
    filters.priceMax != null;

  const clearAll = () =>
    onChange({
      gender: null,
      category: null,
      brand: [],
      color: [],
      size: [],
      priceMin: null,
      priceMax: null,
    });

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <span className={classes.title}>Filters</span>
        <button
          type="button"
          className={classes.clear}
          onClick={clearAll}
          disabled={!hasAny}
        >
          Clear all
        </button>
      </div>

      <div className={classes.section}>
        <div className={classes.label}>Gender</div>
        <div className={classes.row}>
          {GENDERS.map((g) => {
            const count = genderCounts.get(g.value) ?? 0;
            return (
              <Pill
                key={g.value}
                label={g.label}
                count={count}
                active={filters.gender === g.value}
                disabled={count === 0}
                onClick={() => toggleSingle("gender", g.value)}
              />
            );
          })}
        </div>
      </div>

      <div className={classes.section}>
        <div className={classes.label}>Category</div>
        <div className={classes.row}>
          {CATEGORIES.map((c) => {
            const count = categoryCounts.get(c.value) ?? 0;
            return (
              <Pill
                key={c.value}
                label={c.label}
                count={count}
                active={filters.category === c.value}
                disabled={count === 0}
                onClick={() => toggleSingle("category", c.value)}
              />
            );
          })}
        </div>
      </div>

      {brands.length > 0 && (
        <div className={classes.section}>
          <div className={classes.label}>Brand</div>
          <div className={classes.row}>
            {brands.map((b) => {
              const count = brandCounts.get(b) ?? 0;
              return (
                <Pill
                  key={b}
                  label={b}
                  count={count}
                  active={(filters.brand ?? []).includes(b)}
                  disabled={count === 0}
                  onClick={() => toggleMulti("brand", b)}
                />
              );
            })}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className={classes.section}>
          <div className={classes.label}>Color</div>
          <div className={classes.swatchRow}>
            {colors.map((c) => {
              const count = colorCounts.get(c) ?? 0;
              const active = (filters.color ?? []).includes(c);
              const disabled = count === 0 && !active;
              return (
                <button
                  key={c}
                  type="button"
                  className={`${classes.swatch} ${active ? classes.active : ""}`}
                  style={{ background: colorMap[c] || "#ccc" }}
                  title={`${c}${count ? ` (${count})` : ""}`}
                  aria-label={c}
                  disabled={disabled}
                  onClick={() => toggleMulti("color", c)}
                />
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className={classes.section}>
          <div className={classes.label}>Size</div>
          <div className={classes.row}>
            {sizes.map((s) => {
              const count = sizeCounts.get(s) ?? 0;
              const active = (filters.size ?? []).includes(s);
              return (
                <Pill
                  key={s}
                  label={s}
                  count={count || null}
                  active={active}
                  disabled={count === 0}
                  onClick={() => toggleMulti("size", s)}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className={classes.section}>
        <div className={classes.label}>Price (RSD)</div>
        <div className={classes.priceRow}>
          <input
            type="number"
            className={classes.priceInput}
            placeholder={`min ${pMin}`}
            value={filters.priceMin ?? ""}
            min={0}
            onChange={(e) =>
              set({ priceMin: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
          <span className={classes.priceDash}>—</span>
          <input
            type="number"
            className={classes.priceInput}
            placeholder={`max ${pMax}`}
            value={filters.priceMax ?? ""}
            min={0}
            onChange={(e) =>
              set({ priceMax: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </div>
      </div>
    </div>
  );
}
