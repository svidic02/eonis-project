import React, { useState, useEffect } from "react";
import AdminTaxonomyInput from "../AdminTaxonomy/AdminTaxonomyInput";
import Input from "../Input/Input";
import { addColor, editColor, getColorById } from "../../services/colorService";

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function HexField({ item, errors, register, setValue }) {
  const [hex, setHex] = useState(item?.hex ?? "#000000");

  useEffect(() => {
    if (item?.hex) {
      setHex(item.hex);
      setValue("hex", item.hex, { shouldValidate: true });
    }
  }, [item, setValue]);

  const sync = (v) => {
    setHex(v);
    setValue("hex", v, { shouldValidate: true });
  };

  const pickerValue = HEX_RE.test(hex) ? hex : "#000000";

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
      <input
        type="color"
        value={pickerValue}
        onChange={(e) => sync(e.target.value.toUpperCase())}
        style={{
          width: "3rem",
          height: "2.6rem",
          padding: 0,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          background: "transparent",
          cursor: "pointer",
        }}
        aria-label="Pick color"
      />
      <div style={{ flex: 1 }}>
        <Input
          type="text"
          label="Hex"
          value={hex}
          onChange={(e) => sync(e.target.value)}
          error={errors.hex}
        />
        <input
          type="hidden"
          {...register("hex", { required: true, pattern: HEX_RE })}
          value={hex}
          readOnly
        />
      </div>
    </div>
  );
}

export default function ColorInput({ add }) {
  return (
    <AdminTaxonomyInput
      add={add}
      title={add ? "Add color" : "Edit color"}
      listPath="/colors"
      getById={getColorById}
      addFn={addColor}
      editFn={editColor}
      buildPayload={(d) => ({ name: d.name, hex: d.hex })}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "hex", render: (props) => <HexField {...props} /> },
      ]}
    />
  );
}
