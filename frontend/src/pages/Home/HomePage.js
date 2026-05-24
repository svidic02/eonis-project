import React, { useEffect, useMemo, useReducer, useState } from "react";
import { getAll, getAllTags, search } from "../../services/productService";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Search from "../../components/Search/Search";
import Tags from "../../components/Tags/Tags";
import FilterBar from "../../components/FilterBar/FilterBar";
import Thumbnails from "../../components/Thumbnails/Thumbnails";
import NotFound from "../../components/NotFound/NotFound";
import useDocumentTitle from "../../hooks/useDocumentTitle";
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
  useDocumentTitle("Footprint · Shop");
  const [state, dispatch] = useReducer(reducer, initialState);
  const { products, tags } = state;
  const { searchTerm, tag: legacyTag } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const gender = searchParams.get("gender");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const [sortBy, setSortBy] = useState("featured");

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case "price-asc":
        return arr.sort((a, b) => a.price - b.price);
      case "price-desc":
        return arr.sort((a, b) => b.price - a.price);
      case "newest":
        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return arr;
    }
  }, [products, sortBy]);

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
          onGenderChange={(v) => updateParam("gender", v)}
        />
        <Tags
          tags={tags}
          selected={tag}
          onSelect={(name) => updateParam("tag", name)}
        />
      </aside>
      <main className={classes.content}>
        {products.length > 0 && (
          <div className={classes.sortBar}>
            <label htmlFor="sort">Sort:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={classes.sortSelect}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        )}
        {products.length === 0 ? (
          <NotFound linkText="Reset Search" />
        ) : (
          <Thumbnails products={sortedProducts} />
        )}
      </main>
    </div>
  );
}
