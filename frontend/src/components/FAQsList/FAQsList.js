import React from "react";
import AdminTaxonomyList from "../AdminTaxonomy/AdminTaxonomyList";
import { deleteFaq } from "../../services/faqService";

export default function FAQsList({ faqs, onDeleted }) {
  return (
    <AdminTaxonomyList
      items={faqs}
      title="FAQs"
      addLabel="+ Add FAQ"
      addPath="/faq/add"
      editPath={(id) => `/faqs/${id}`}
      deleteFn={deleteFaq}
      onDeleted={onDeleted}
      itemLabel={(f) => f?.question}
      searchKeys={["question", "answer"]}
      searchPlaceholder="Search questions or answers…"
      confirmMessage={(f) => `Delete this FAQ?\n\n"${f?.question}"`}
      columns={[
        { key: "order", label: "Order", sortable: true, align: "right", width: "5rem", cellClassName: "muted" },
        {
          key: "question",
          label: "Question",
          sortable: true,
          cellClassName: "nameCell",
          render: (f) => f.question,
        },
        {
          key: "answer",
          label: "Answer",
          render: (f) => (
            <span style={{ color: "var(--text-muted)" }}>
              {f.answer.length > 100 ? f.answer.slice(0, 100) + "…" : f.answer}
            </span>
          ),
        },
      ]}
    />
  );
}
