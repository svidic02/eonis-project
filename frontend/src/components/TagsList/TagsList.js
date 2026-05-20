import React from "react";
import AdminTaxonomyList from "../AdminTaxonomy/AdminTaxonomyList";
import { deleteTag } from "../../services/tagService";

export default function TagsList({ tags, onDeleted }) {
  return (
    <AdminTaxonomyList
      items={tags}
      title="Tags"
      addLabel="+ Add tag"
      addPath="/tag/add"
      editPath={(id) => `/tags/${id}`}
      deleteFn={deleteTag}
      onDeleted={onDeleted}
      confirmMessage={(t) =>
        `Delete tag "${t?.name}"? It will be removed from all products.`
      }
      columns={[
        { key: "name", label: "Name", sortable: true, cellClassName: "nameCell" },
        { key: "count", label: "Count", sortable: true, align: "right", width: "6rem", cellClassName: "muted" },
      ]}
    />
  );
}
