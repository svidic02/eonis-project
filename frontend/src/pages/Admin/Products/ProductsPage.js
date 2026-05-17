import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAll } from "../../../services/productService";
import ProductsList from "../../../components/ProductsList/ProductsList";

export default function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (user && user.isAdmin) {
      getAll()
        .then((data) => {
          setProducts(data);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
        });
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <ProductsList products={products} />
    </>
  );
}
