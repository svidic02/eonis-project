import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAllFaqs } from "../../../services/faqService";
import FAQsList from "../../../components/FAQsList/FAQsList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

export default function FAQsPage() {
  useDocumentTitle("Footprint Admin · FAQs");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    if (user && user.isAdmin) {
      getAllFaqs()
        .then(setFaqs)
        .catch((err) => console.error("Error fetching FAQs:", err));
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <FAQsList
      faqs={faqs}
      onDeleted={(id) => setFaqs((prev) => prev.filter((f) => f._id !== id))}
    />
  );
}
