import React, { useState } from "react";
import Title from "../Title/Title";
import classes from "./productsList.module.css";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import { deleteProduct } from "../../services/productService";
import ConfirmationDialog from "../ConfirmationDialog/ConfirmationDialog";
import { toast } from "react-toastify";

export default function ProductsList({ products }) {
  const navigate = useNavigate();
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDialog, setDialog] = useState(false);

  const handleEdit = (product) => {
    navigate("/products/" + product.id);
  };
  const handleDelete = (product) => {
    setProductToDelete(product);
    setDialog(true);
  };
  const dialogConfirmed = async () => {
    try {
      await deleteProduct(productToDelete._id);
      setDialog(false);
      window.location.reload();
      toast.success(
        "Product with id:" + productToDelete._id + " deleted succesfuly!"
      );
    } catch (error) {
      toast.error(
        "Product with id:" + productToDelete._id + " couldnt be deleted!"
      );
    }
  };
  const dialogCanceled = () => {
    setDialog(false);
  };
  const handleAdd = () => {
    navigate("/product/add");
  };
  return (
    <div className={classes.wrapper}>
      <div className={classes.headerWrapper}>
        <Title title="Products" className={classes.title} />
      </div>
      <Button text="Add" onClick={handleAdd} />
      <p className={classes.numberOf}>Total Products: {products.length}</p>
      <div className={classes.itemsWrapper}>
        {products.map((product) => {
          const totalStock = (product.variants ?? []).reduce(
            (sum, v) => sum + (v.stock ?? 0),
            0
          );
          return (
            <div key={product._id} className={classes.items}>
              <p>Name: {product.name}</p>
              {product.brand && <p>Brand: {product.brand}</p>}
              <p>Price: ${product.price}</p>
              <p>Tags: {product.tags.join(", ")}</p>
              <p>
                Variants: {product.variants?.length ?? 0} · {totalStock} in stock
              </p>
              <Button text="Edit" onClick={() => handleEdit(product)} />
              <Button
                backgroundColor="red"
                color="black"
                text="Delete"
                onClick={() => handleDelete(product)}
              />
            </div>
          );
        })}
      </div>
      {showDialog && (
        <ConfirmationDialog
          msg="Are you sure you want to delete product?"
          info={productToDelete}
          onConfirm={() => dialogConfirmed()}
          onCancel={() => dialogCanceled()}
        />
      )}
    </div>
  );
}
