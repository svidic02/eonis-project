import React, { useEffect, useReducer } from "react";
import { getAll, getAllTags, search, getAllByTag } from "../../services/productService";
import { useParams } from "react-router-dom";
import Search from "../../components/Search/Search";
import Tags from "../../components/Tags/Tags";
import Thumbnails from "../../components/Thumbnails/Thumbnails";
import NotFound from "../../components/NotFound/NotFound";

const initialState = { products: [], tags: [] };

const reducer = (state, action) => {
  switch (action.type) {
    case "PRODUCTS_LOADED":
      return { ...state, products: action.payload };
    case "TAGS_LOADED":
      return { ...state, tags: action.payload };
    default:
      return state;
  }
};

export default function HomePage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { products, tags } = state;
  const { searchTerm, tag } = useParams();

  useEffect(() => {
    getAllTags().then((tags) => dispatch({ type: "TAGS_LOADED", payload: tags }));

    const loadProducts = tag ? getAllByTag(tag) : searchTerm ? search(searchTerm) : getAll();

    loadProducts.then((products) => dispatch({ type: "PRODUCTS_LOADED", payload: products }));
  }, [searchTerm, tag]);

  return (
    <>
      <Search />
      <Tags tags={tags} />
      {products.length === 0 && <NotFound linkText="Reset Search" />}
      <Thumbnails products={products} />
    </>
  );
}
