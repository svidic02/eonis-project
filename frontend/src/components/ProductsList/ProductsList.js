import React, { useMemo, useState } from "react";
import classes from "./productsList.module.css";
import { useNavigate } from "react-router-dom";
import { deleteProduct } from "../../services/productService";
import { genderLabel } from "../../constants/productEnums";
import ConfirmationDialog from "../ConfirmationDialog/ConfirmationDialog";
import { toast } from "react-toastify";

const LOW_STOCK = 5;

export default function ProductsList({ products }) {
  const navigate = useNavigate();
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDialog, setDialog] = useState(false);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const rows = useMemo(() => {
    return products.map((p) => ({
      ...p,
      totalStock: (p.variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0),
      variantCount: p.variants?.length ?? 0,
    }));
  }, [products]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const av = sortKey === "stock" ? a.totalStock : a[sortKey];
      const bv = sortKey === "stock" ? b.totalStock : b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const arrow = (key) => {
    if (sortKey !== key) return null;
    return <span className={classes.arrow}>{sortDir === "asc" ? "▲" : "▼"}</span>;
  };

  const handleEdit = (product) => navigate("/products/" + product.id);
  const handleDelete = (product) => {
    setProductToDelete(product);
    setDialog(true);
  };
  const dialogConfirmed = async () => {
    try {
      await deleteProduct(productToDelete._id);
      setDialog(false);
      toast.success("Product " + productToDelete.name + " deleted.");
      window.location.reload();
    } catch {
      toast.error("Could not delete " + productToDelete.name + ".");
    }
  };
  const dialogCanceled = () => setDialog(false);
  const handleAdd = () => navigate("/product/add");

  return (
    <div className={classes.wrapper}>
      <div className={classes.headerWrapper}>
        <h1 className={classes.title}>Products</h1>
        <div className={classes.headerRight}>
          <span className={classes.numberOf}>{products.length} total</span>
          <button className={classes.addBtn} onClick={handleAdd}>
            + Add product
          </button>
        </div>
      </div>

      <div className={classes.tableWrapper}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th className={classes.thumbCol}></th>
              <th onClick={() => toggleSort("name")} className={classes.sortable}>
                Name {arrow("name")}
              </th>
              <th onClick={() => toggleSort("brand")} className={classes.sortable}>
                Brand {arrow("brand")}
              </th>
              <th onClick={() => toggleSort("gender")} className={classes.sortable}>
                Gender {arrow("gender")}
              </th>
              <th onClick={() => toggleSort("category")} className={classes.sortable}>
                Category {arrow("category")}
              </th>
              <th onClick={() => toggleSort("price")} className={classes.sortable}>
                Price {arrow("price")}
              </th>
              <th>Tags</th>
              <th onClick={() => toggleSort("stock")} className={classes.sortable}>
                Variants {arrow("stock")}
              </th>
              <th className={classes.actionsCol}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className={classes.empty}>
                  No products yet.
                </td>
              </tr>
            )}
            {sorted.map((product) => {
              const out = product.totalStock === 0;
              const low = !out && product.totalStock < LOW_STOCK;
              return (
                <tr key={product._id}>
                  <td className={classes.thumbCol}>
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={classes.thumb}
                      />
                    )}
                  </td>
                  <td className={classes.nameCell}>{product.name}</td>
                  <td className={classes.muted}>{product.brand || "—"}</td>
                  <td className={classes.muted}>{genderLabel(product.gender)}</td>
                  <td className={classes.muted}>{product.category || "—"}</td>
                  <td className={classes.price}>${product.price}</td>
                  <td className={classes.muted}>
                    {(product.tags ?? []).join(", ")}
                  </td>
                  <td>
                    <span className={classes.stockText}>
                      {product.variantCount} · {product.totalStock} in stock
                    </span>
                    {out && <span className={classes.badgeOut}>Out</span>}
                    {low && <span className={classes.badgeLow}>Low</span>}
                  </td>
                  <td className={classes.actionsCol}>
                    <button
                      className={classes.editBtn}
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className={classes.deleteBtn}
                      onClick={() => handleDelete(product)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <ConfirmationDialog
          msg="Are you sure you want to delete product?"
          info={productToDelete}
          onConfirm={dialogConfirmed}
          onCancel={dialogCanceled}
        />
      )}
    </div>
  );
}
