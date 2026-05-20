import React, { useState, useEffect } from "react";
import AdminTaxonomyInput from "../AdminTaxonomy/AdminTaxonomyInput";
import Input from "../Input/Input";
import { addBrand, editBrand, getBrandById } from "../../services/brandService";

function LogoField({ item, errors, register, setValue }) {
  const [url, setUrl] = useState(item?.logoUrl ?? "");
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (item?.logoUrl) {
      setUrl(item.logoUrl);
      setValue("logoUrl", item.logoUrl);
    }
  }, [item, setValue]);

  const sync = (v) => {
    setUrl(v);
    setBroken(false);
    setValue("logoUrl", v);
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
      <div style={{ flex: 1 }}>
        <Input
          type="text"
          label="Logo URL (optional)"
          value={url}
          onChange={(e) => sync(e.target.value)}
          error={errors.logoUrl}
        />
        <input type="hidden" {...register("logoUrl")} value={url} readOnly />
      </div>
      {url && !broken && (
        <img
          src={url}
          alt="logo preview"
          onError={() => setBroken(true)}
          style={{
            width: "2.5rem",
            height: "2.5rem",
            objectFit: "contain",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            background: "var(--surface-alt)",
          }}
        />
      )}
    </div>
  );
}

export default function BrandInput({ add }) {
  return (
    <AdminTaxonomyInput
      add={add}
      title={add ? "Add brand" : "Edit brand"}
      listPath="/brands"
      getById={getBrandById}
      addFn={addBrand}
      editFn={editBrand}
      buildPayload={(d) => ({ name: d.name, logoUrl: d.logoUrl ?? "" })}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "logoUrl", render: (props) => <LogoField {...props} /> },
      ]}
    />
  );
}
