import React, { useEffect, useState } from "react";
import AdminTaxonomyInput from "../AdminTaxonomy/AdminTaxonomyInput";
import Input from "../Input/Input";
import { addPromo, editPromo, getPromoById } from "../../services/promoService";

function TypeField({ item, register, setValue }) {
  const [type, setType] = useState(item?.type ?? "PERCENT");

  useEffect(() => {
    if (item?.type) {
      setType(item.type);
      setValue("type", item.type);
    } else {
      setValue("type", type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const onChange = (v) => {
    setType(v);
    setValue("type", v);
  };

  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          marginBottom: "0.35rem",
          fontWeight: 600,
        }}
      >
        Type
      </label>
      <select
        value={type}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "0.55rem 0.7rem",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          font: "inherit",
          width: "100%",
        }}
      >
        <option value="PERCENT">Percent (%)</option>
        <option value="FIXED">Fixed (RSD)</option>
      </select>
      <input type="hidden" {...register("type")} value={type} readOnly />
    </div>
  );
}

function ActiveField({ item, register, setValue }) {
  const initial = item?.active !== undefined ? item.active : true;
  const [active, setActive] = useState(initial);

  useEffect(() => {
    setValue("active", initial);
    setActive(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const toggle = (v) => {
    setActive(v);
    setValue("active", v);
  };

  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => toggle(e.target.checked)}
      />
      Active
      <input type="hidden" {...register("active")} value={active} readOnly />
    </label>
  );
}

export default function PromoInput({ add }) {
  return (
    <AdminTaxonomyInput
      add={add}
      title={add ? "Add promo" : "Edit promo"}
      listPath="/promos"
      getById={getPromoById}
      addFn={addPromo}
      editFn={editPromo}
      buildPayload={(d) => ({
        code: (d.code || "").trim().toUpperCase(),
        type: d.type,
        value: Number(d.value),
        minSubtotal: Number(d.minSubtotal) || 0,
        active: d.active === true || d.active === "true",
      })}
      fields={[
        { name: "code", label: "Code", required: true },
        { name: "type", render: (props) => <TypeField {...props} /> },
        { name: "value", label: "Value", type: "number", required: true },
        { name: "minSubtotal", label: "Minimum subtotal (RSD)", type: "number" },
        { name: "active", render: (props) => <ActiveField {...props} /> },
      ]}
    />
  );
}
