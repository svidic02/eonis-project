import React from "react";
import AdminTaxonomyList from "../AdminTaxonomy/AdminTaxonomyList";
import { deletePromo } from "../../services/promoService";

const formatValue = (p) =>
  p.type === "PERCENT" ? `${p.value}%` : `${p.value} RSD`;

export default function PromosList({ promos, onDeleted }) {
  return (
    <AdminTaxonomyList
      items={promos}
      title="Promo codes"
      addLabel="+ Add promo"
      addPath="/promo/add"
      editPath={(id) => `/promos/${id}`}
      deleteFn={deletePromo}
      onDeleted={onDeleted}
      confirmMessage={(p) => `Delete promo "${p?.code}"?`}
      itemLabel={(p) => p?.code}
      searchKeys={["code", "type"]}
      searchPlaceholder="Search promos…"
      columns={[
        { key: "code", label: "Code", sortable: true, cellClassName: "nameCell" },
        { key: "type", label: "Type", sortable: true, width: "7rem" },
        {
          key: "value",
          label: "Value",
          sortable: true,
          align: "right",
          width: "7rem",
          render: (p) => formatValue(p),
        },
        {
          key: "minSubtotal",
          label: "Min subtotal",
          sortable: true,
          align: "right",
          width: "8rem",
          cellClassName: "muted",
          render: (p) => (p.minSubtotal ? `${p.minSubtotal} RSD` : "—"),
        },
        {
          key: "active",
          label: "Active",
          sortable: true,
          width: "5rem",
          render: (p) => (p.active ? "Yes" : "No"),
        },
      ]}
    />
  );
}
