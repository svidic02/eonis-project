import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { edit, getById, getAllTags } from "../../services/productService";
import Input from "../Input/Input";
import { toast } from "react-toastify";
import VariantsEditor from "../VariantsEditor/VariantsEditor";
import classes from "./productForm.module.css";

export default function ProductInput() {
  const { id } = useParams();
  const [product, setProduct] = useState();
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [variants, setVariants] = useState([]);
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    (async () => {
      const data = await getById(id);
      setProduct(data);
      setSelectedTags(data.tags ?? []);
      setVariants(data.variants ?? []);
    })();
    getAllTags().then((tags) =>
      setTagOptions(tags.filter((t) => t.name !== "All"))
    );
  }, [id]);

  const toggleTag = (name) => {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const submit = async (data) => {
    try {
      await edit({ id, ...data, tags: selectedTags, variants });
      toast.success("Product updated.");
      navigate("/products");
    } catch {
      toast.error("Failed to update product.");
    }
  };

  if (!product) return null;

  return (
    <div className={classes.page}>
      <div className={classes.heading}>
        <h1>Edit product</h1>
        <Link to="/products" className={classes.cancelLink}>← Back to products</Link>
      </div>

      <div className={classes.card}>
        <form className={classes.form} onSubmit={handleSubmit(submit)}>
          <Input
            type="text"
            defaultValue={product.name}
            label="Name"
            {...register("name", { required: true })}
            error={errors.name}
          />
          <Input
            type="text"
            defaultValue={product.brand}
            label="Brand"
            {...register("brand")}
          />

          <div>
            <label className={classes.fieldLabel}>Category</label>
            <select
              defaultValue={product.category ?? ""}
              className={classes.select}
              {...register("category")}
            >
              <option value="">—</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>
          </div>

          <Input
            type="text"
            defaultValue={product.description}
            label="Description"
            {...register("description")}
          />
          <Input
            type="number"
            defaultValue={product.price}
            label="Price in $"
            {...register("price", { required: true, valueAsNumber: true })}
            error={errors.price}
          />

          <div>
            <label className={classes.fieldLabel}>Tags</label>
            <div className={classes.tagChips}>
              {tagOptions.map((tag) => {
                const selected = selectedTags.includes(tag.name);
                return (
                  <label
                    key={tag.name}
                    className={`${classes.tagChip} ${selected ? classes.selected : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleTag(tag.name)}
                    />
                    {tag.name}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className={classes.fieldLabel}>Variants</label>
            <VariantsEditor variants={variants} onChange={setVariants} hideLabel />
          </div>

          <div className={classes.actions}>
            <button
              type="button"
              className={classes.cancelBtn}
              onClick={() => navigate("/products")}
            >
              Cancel
            </button>
            <button type="submit" className={classes.saveBtn} disabled={isSubmitting}>
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
