import React, { useMemo, useState } from "react";
import classes from "./variantSelector.module.css";

export default function VariantSelector({ variants = [], onChange }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))),
    [variants]
  );
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))).sort((a, b) => a - b),
    [variants]
  );

  const colorDisabled = (color) => {
    const matches = variants.filter((v) => v.color === color);
    if (matches.every((v) => v.stock === 0)) return true;
    if (selectedSize != null) {
      return !matches.some((v) => v.size === selectedSize && v.stock > 0);
    }
    return false;
  };

  const sizeDisabled = (size) => {
    const matches = variants.filter((v) => v.size === size);
    if (matches.every((v) => v.stock === 0)) return true;
    if (selectedColor != null) {
      return !matches.some((v) => v.color === selectedColor && v.stock > 0);
    }
    return false;
  };

  const pickColor = (color) => {
    if (colorDisabled(color)) return;
    const next = selectedColor === color ? null : color;
    setSelectedColor(next);
    notify(next, selectedSize);
  };

  const pickSize = (size) => {
    if (sizeDisabled(size)) return;
    const next = selectedSize === size ? null : size;
    setSelectedSize(next);
    notify(selectedColor, next);
  };

  const notify = (color, size) => {
    if (color && size != null) {
      const variant = variants.find((v) => v.color === color && v.size === size);
      onChange?.(variant ?? null);
    } else {
      onChange?.(null);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.group}>
        <div className={classes.label}>Color</div>
        <div className={classes.options}>
          {colors.map((color) => {
            const disabled = colorDisabled(color);
            return (
              <button
                key={color}
                type="button"
                className={`${classes.option} ${
                  selectedColor === color ? classes.selected : ""
                } ${disabled ? classes.disabled : ""}`}
                onClick={() => pickColor(color)}
                disabled={disabled}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>
      <div className={classes.group}>
        <div className={classes.label}>Size</div>
        <div className={classes.options}>
          {sizes.map((size) => {
            const disabled = sizeDisabled(size);
            return (
              <button
                key={size}
                type="button"
                className={`${classes.option} ${
                  selectedSize === size ? classes.selected : ""
                } ${disabled ? classes.disabled : ""}`}
                onClick={() => pickSize(size)}
                disabled={disabled}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
