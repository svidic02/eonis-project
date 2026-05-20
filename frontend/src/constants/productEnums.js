export const GENDERS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
];

export const CATEGORIES = [
  { value: "Sneakers", label: "Sneakers" },
  { value: "Boots", label: "Boots" },
  { value: "Running", label: "Running" },
  { value: "Formal", label: "Formal" },
  { value: "Sandals", label: "Sandals" },
];

export const genderLabel = (value) =>
  GENDERS.find((g) => g.value === value)?.label ?? "—";

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? "—";
