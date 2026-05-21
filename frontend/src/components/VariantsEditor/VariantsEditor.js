import React from "react";
import classes from "./variantsEditor.module.css";
import Button from "../Button/Button";

export default function VariantsEditor({ variants, onChange, hideLabel, colors = [] }) {
  const update = (idx, field, value) => {
    const next = variants.map((v, i) =>
      i === idx ? { ...v, [field]: value } : v
    );
    onChange(next);
  };
  const addRow = () => {
    onChange([...variants, { color: "", size: "", stock: 0 }]);
  };
  const removeRow = (idx) => {
    onChange(variants.filter((_, i) => i !== idx));
  };

  const colorNames = new Set(colors.map((c) => c.name));

  return (
    <div className={classes.wrapper}>
      {!hideLabel && <div className={classes.label}>Variants</div>}
      <table className={classes.table}>
        <colgroup>
          <col className={classes.colColor} />
          <col className={classes.colSize} />
          <col className={classes.colStock} />
          <col className={classes.colSku} />
          <col className={classes.colActions} />
        </colgroup>
        <thead>
          <tr>
            <th>Color</th>
            <th>Size</th>
            <th>Stock</th>
            <th>SKU</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {variants.map((v, idx) => (
            <tr key={idx}>
              <td>
                <select
                  value={v.color ?? ""}
                  onChange={(e) => update(idx, "color", e.target.value)}
                >
                  <option value="">Select color</option>
                  {colors.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {v.color && !colorNames.has(v.color) && (
                    <option value={v.color} disabled>
                      {v.color} (not in catalog)
                    </option>
                  )}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={v.size ?? ""}
                  onChange={(e) =>
                    update(idx, "size", Number(e.target.value))
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={v.stock ?? 0}
                  onChange={(e) =>
                    update(idx, "stock", Number(e.target.value))
                  }
                />
              </td>
              <td className={classes.sku}>{v.sku ?? "(auto)"}</td>
              <td>
                <button
                  type="button"
                  className={classes.remove}
                  onClick={() => removeRow(idx)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {variants.length === 0 && (
            <tr>
              <td colSpan="5" className={classes.empty}>
                No variants yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Button text="Add variant" onClick={addRow} />
    </div>
  );
}
