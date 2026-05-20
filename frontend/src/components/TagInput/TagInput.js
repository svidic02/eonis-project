import React from "react";
import AdminTaxonomyInput from "../AdminTaxonomy/AdminTaxonomyInput";
import { addTag, editTag, getTagById } from "../../services/tagService";

export default function TagInput({ add }) {
  return (
    <AdminTaxonomyInput
      add={add}
      title={add ? "Add tag" : "Edit tag"}
      listPath="/tags"
      getById={getTagById}
      addFn={addTag}
      editFn={editTag}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "description", label: "Description" },
      ]}
    />
  );
}
