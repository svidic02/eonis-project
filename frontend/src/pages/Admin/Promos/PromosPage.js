import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAllPromosAdmin } from "../../../services/promoService";
import PromosList from "../../../components/PromosList/PromosList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

export default function PromosPage() {
  useDocumentTitle("Footprint Admin · Promos");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    if (user && user.isAdmin) {
      getAllPromosAdmin()
        .then(setPromos)
        .catch((err) => console.error("Error fetching promos:", err));
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <PromosList
      promos={promos}
      onDeleted={(id) => setPromos((prev) => prev.filter((p) => p._id !== id))}
    />
  );
}
