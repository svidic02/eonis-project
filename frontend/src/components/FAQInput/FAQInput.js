import React from "react";
import AdminTaxonomyInput from "../AdminTaxonomy/AdminTaxonomyInput";
import { addFaq, editFaq, getFaqById } from "../../services/faqService";

export default function FAQInput({ add }) {
  return (
    <AdminTaxonomyInput
      add={add}
      title={add ? "Add FAQ" : "Edit FAQ"}
      listPath="/faqs"
      getById={getFaqById}
      addFn={addFaq}
      editFn={editFaq}
      buildPayload={(d) => ({
        question: d.question,
        answer: d.answer,
        order: Number.isFinite(d.order) ? d.order : Number(d.order) || 0,
      })}
      fields={[
        { name: "question", label: "Question", required: true },
        { name: "answer", label: "Answer", required: true, type: "textarea", rows: 6, maxLength: 2000 },
        { name: "order", label: "Display order (lower first)", type: "number" },
      ]}
    />
  );
}
