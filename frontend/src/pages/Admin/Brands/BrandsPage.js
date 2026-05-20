import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAllBrandsAdmin } from "../../../services/brandService";
import BrandsList from "../../../components/BrandsList/BrandsList";

export default function BrandsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    if (user && user.isAdmin) {
      getAllBrandsAdmin()
        .then((data) => setBrands(data))
        .catch((error) => console.error("Error fetching brands:", error));
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <BrandsList
      brands={brands}
      onDeleted={(id) => setBrands((prev) => prev.filter((b) => b._id !== id))}
    />
  );
}
