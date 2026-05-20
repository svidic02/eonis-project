import React from "react";
import AdminTaxonomyList, { taxonomyClasses } from "../AdminTaxonomy/AdminTaxonomyList";
import { deleteColor } from "../../services/colorService";

export default function ColorsList({ colors, onDeleted }) {
  return (
    <AdminTaxonomyList
      items={colors}
      title="Colors"
      addLabel="+ Add color"
      addPath="/color/add"
      editPath={(id) => `/colors/${id}`}
      deleteFn={deleteColor}
      onDeleted={onDeleted}
      confirmMessage={(c) => `Delete color "${c?.name}"?`}
      columns={[
        {
          key: "swatch",
          label: "",
          width: "2.5rem",
          render: (c) => (
            <span
              className={taxonomyClasses.swatch}
              style={{ backgroundColor: c.hex }}
              title={c.hex}
            />
          ),
        },
        { key: "name", label: "Name", sortable: true, cellClassName: "nameCell" },
        { key: "hex", label: "Hex", width: "7rem", cellClassName: "hexCell" },
        { key: "count", label: "Count", sortable: true, align: "right", width: "6rem", cellClassName: "muted" },
      ]}
    />
  );
}
