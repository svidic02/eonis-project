import React from "react";
import classes from "./filterBar.module.css";
import { GENDERS, CATEGORIES } from "../../constants/productEnums";

const ALL = { value: null, label: "All" };
const GENDER_OPTIONS = [ALL, ...GENDERS];
const CATEGORY_OPTIONS = [ALL, ...CATEGORIES];

function PillRow({ label, options, value, onChange }) {
  return (
    <div className={classes.group}>
      <div className={classes.label}>{label}</div>
      <div className={classes.row}>
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            className={`${classes.pill} ${value === o.value ? classes.active : ""}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FilterBar({
  gender,
  category,
  onGenderChange,
  onCategoryChange,
}) {
  return (
    <div className={classes.container}>
      <PillRow
        label="Gender"
        options={GENDER_OPTIONS}
        value={gender}
        onChange={onGenderChange}
      />
      <PillRow
        label="Category"
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={onCategoryChange}
      />
    </div>
  );
}
