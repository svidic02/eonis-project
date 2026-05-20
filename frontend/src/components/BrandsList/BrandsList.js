import React, { useState } from "react";
import AdminTaxonomyList, { taxonomyClasses } from "../AdminTaxonomy/AdminTaxonomyList";
import { deleteBrand } from "../../services/brandService";

function LogoCell({ brand }) {
  const [broken, setBroken] = useState(false);
  if (brand.logoUrl && !broken) {
    return (
      <img
        src={brand.logoUrl}
        alt={brand.name}
        className={taxonomyClasses.logo}
        onError={() => setBroken(true)}
      />
    );
  }
  return <span className={taxonomyClasses.logoPlaceholder}>{brand.name.charAt(0)}</span>;
}

export default function BrandsList({ brands, onDeleted }) {
  return (
    <AdminTaxonomyList
      items={brands}
      title="Brands"
      addLabel="+ Add brand"
      addPath="/brand/add"
      editPath={(id) => `/brands/${id}`}
      deleteFn={deleteBrand}
      onDeleted={onDeleted}
      confirmMessage={(b) => `Delete brand "${b?.name}"?`}
      columns={[
        {
          key: "logo",
          label: "",
          width: "3rem",
          render: (b) => <LogoCell brand={b} />,
        },
        { key: "name", label: "Name", sortable: true, cellClassName: "nameCell" },
        { key: "count", label: "Count", sortable: true, align: "right", width: "6rem", cellClassName: "muted" },
      ]}
    />
  );
}
