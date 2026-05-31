import React, { useEffect, useMemo, useReducer, useState } from "react";
import { getAll, getAllTags, search } from "../../services/productService";
import { getAllColorsAdmin } from "../../services/colorService";
import { useParams, useSearchParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Search from "../../components/Search/Search";
import Tags from "../../components/Tags/Tags";
import Filters from "../../components/Filters/Filters";
import Thumbnails from "../../components/Thumbnails/Thumbnails";
import NotFound from "../../components/NotFound/NotFound";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { filterProducts } from "../../utils/facets";
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

const splitCsv = (s) => (s ? s.split(",").filter(Boolean) : []);
const numOrNull = (s) => (s == null || s === "" ? null : Number(s));

export default function HomePage() {
  useDocumentTitle("Footprint · Shop");
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { products, tags } = state;
  const { searchTerm, tag: legacyTag } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [colorMap, setColorMap] = useState({});
  const [sortBy, setSortBy] = useState("featured");

  const filters = useMemo(
    () => ({
      gender: searchParams.get("gender") || null,
      category: searchParams.get("category") || null,
      brand: splitCsv(searchParams.get("brand")),
      color: splitCsv(searchParams.get("color")),
      size: splitCsv(searchParams.get("size")),
      priceMin: numOrNull(searchParams.get("priceMin")),
      priceMax: numOrNull(searchParams.get("priceMax")),
    }),
    [searchParams]
  );
  const tag = searchParams.get("tag");

  const setFilters = (next) => {
    const params = new URLSearchParams(searchParams);
    const writeSingle = (k, v) => (v ? params.set(k, v) : params.delete(k));
    const writeMulti = (k, v) =>
      v && v.length ? params.set(k, v.join(",")) : params.delete(k);
    const writeNum = (k, v) =>
      v != null && !Number.isNaN(v) ? params.set(k, String(v)) : params.delete(k);

    writeSingle("gender", next.gender);
    writeSingle("category", next.category);
    writeMulti("brand", next.brand);
    writeMulti("color", next.color);
    writeMulti("size", next.size);
    writeNum("priceMin", next.priceMin);
    writeNum("priceMax", next.priceMax);
    setSearchParams(params, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    const byTag = tag
      ? products.filter((p) => (p.tags ?? []).includes(tag))
      : products;
    return filterProducts(byTag, filters);
  }, [products, filters, tag]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
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
  }, [filteredProducts, sortBy]);

  // Redirect legacy /tag/:tag → /?tag=...
  useEffect(() => {
    if (legacyTag) {
      navigate(`/?tag=${encodeURIComponent(legacyTag)}`, { replace: true });
    }
  }, [legacyTag, navigate]);

  useEffect(() => {
    getAllTags().then((tags) => dispatch({ type: "TAGS_LOADED", payload: tags }));
    getAllColorsAdmin()
      .then((cs) => setColorMap(Object.fromEntries(cs.map((c) => [c.name, c.hex]))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (legacyTag) return;
    const loadProducts = searchTerm ? search(searchTerm) : getAll();
    loadProducts.then((products) =>
      dispatch({ type: "PRODUCTS_LOADED", payload: products })
    );
  }, [searchTerm, legacyTag]);

  const setTag = (name) => {
    const params = new URLSearchParams(searchParams);
    if (name && name !== tag) params.set("tag", name);
    else params.delete("tag");
    setSearchParams(params, { replace: true });
  };

  return (
    user?.isAdmin ? <Navigate to="/admin" replace /> :
    <div className={classes.layout}>
      <aside className={classes.sidebar}>
        <Search />
        <Filters
          products={tag ? products.filter((p) => (p.tags ?? []).includes(tag)) : products}
          filters={filters}
          colorMap={colorMap}
          onChange={setFilters}
        />
        <Tags tags={tags} selected={tag} onSelect={setTag} />
      </aside>
      <main className={classes.content}>
        {sortedProducts.length > 0 && (
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
        {sortedProducts.length === 0 ? (
          <NotFound linkText="Reset Search" />
        ) : (
          <Thumbnails products={sortedProducts} />
        )}
      </main>
    </div>
  );
}
