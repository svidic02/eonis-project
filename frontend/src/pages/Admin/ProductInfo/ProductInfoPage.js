import React from "react";
import ProductInput from "../../../components/ProductInput/ProductInput";
import ProductAdd from "../../../components/ProductAdd/ProductAdd";

export default function ProductInfoPage({ add }) {
  return add ? <ProductAdd /> : <ProductInput />;
}
