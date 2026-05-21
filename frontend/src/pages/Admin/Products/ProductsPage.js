import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAll } from "../../../services/productService";
import ProductsList from "../../../components/ProductsList/ProductsList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

export default function ProductsPage() {
  useDocumentTitle("Footprint Admin · Products");
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
