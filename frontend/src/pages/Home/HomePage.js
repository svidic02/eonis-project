import React, { useEffect, useReducer } from "react";
import { getAll, getAllTags, search } from "../../services/productService";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Search from "../../components/Search/Search";
import Tags from "../../components/Tags/Tags";
import FilterBar from "../../components/FilterBar/FilterBar";
import Thumbnails from "../../components/Thumbnails/Thumbnails";
import NotFound from "../../components/NotFound/NotFound";
import classes from "./homePage.module.css";

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
  const { searchTerm, tag: legacyTag } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const gender = searchParams.get("gender");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");

  // Redirect legacy /tag/:tag → /?tag=...
  useEffect(() => {
    if (legacyTag) {
      navigate(`/?tag=${encodeURIComponent(legacyTag)}`, { replace: true });
    }
  }, [legacyTag, navigate]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    getAllTags().then((tags) => dispatch({ type: "TAGS_LOADED", payload: tags }));
  }, []);

  useEffect(() => {
    if (legacyTag) return; // wait for redirect to settle
    const loadProducts = searchTerm
      ? search(searchTerm)
      : getAll({ gender, category, tag });

    loadProducts.then((products) =>
      dispatch({ type: "PRODUCTS_LOADED", payload: products })
    );
  }, [searchTerm, gender, category, tag, legacyTag]);

  return (
    <div className={classes.layout}>
      <aside className={classes.sidebar}>
        <Search />
        <FilterBar
          gender={gender}
          category={category}
          onGenderChange={(v) => updateParam("gender", v)}
          onCategoryChange={(v) => updateParam("category", v)}
        />
        <Tags
          tags={tags}
          selected={tag}
          onSelect={(name) => updateParam("tag", name)}
        />
      </aside>
      <main className={classes.content}>
        {products.length === 0 ? (
          <NotFound linkText="Reset Search" />
        ) : (
          <Thumbnails products={products} />
        )}
      </main>
    </div>
  );
}
