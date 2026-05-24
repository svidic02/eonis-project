import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { edit, getById, getAllTags } from "../../services/productService";
import { getAllColorsAdmin } from "../../services/colorService";
import { getAllBrandsAdmin } from "../../services/brandService";
import { GENDERS, CATEGORIES } from "../../constants/productEnums";
import Input from "../Input/Input";
import { toast } from "react-toastify";
import VariantsEditor from "../VariantsEditor/VariantsEditor";
import ImagesEditor from "../ImagesEditor/ImagesEditor";
import classes from "./productForm.module.css";

export default function ProductInput() {
  const { id } = useParams();
  const [product, setProduct] = useState();
  const [tagOptions, setTagOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
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
      setImages(data.images ?? []);
    })();
    getAllTags().then((tags) =>
      setTagOptions(tags.filter((t) => t.name !== "All"))
    );
    getAllColorsAdmin().then(setColorOptions);
    getAllBrandsAdmin().then(setBrandOptions);
  }, [id]);

  const toggleTag = (name) => {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const submit = async (data) => {
    try {
      await edit({ id, ...data, tags: selectedTags, variants, images: images.map((u) => u.trim()).filter(Boolean) });
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
          <div>
            <label className={classes.fieldLabel}>Brand</label>
            <select
              key={brandOptions.length}
              defaultValue={product.brand ?? ""}
              className={classes.select}
              {...register("brand", { required: true })}
            >
              <option value="">—</option>
              {brandOptions.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
              {product.brand && !brandOptions.some((b) => b.name === product.brand) && (
                <option value={product.brand} disabled>
                  {product.brand} (not in catalog)
                </option>
              )}
            </select>
            {errors.brand && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>Required</div>}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label className={classes.fieldLabel}>Gender</label>
              <select
                defaultValue={product.gender ?? ""}
                className={classes.select}
                {...register("gender", { required: true })}
              >
                <option value="">—</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
              {errors.gender && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>Required</div>}
            </div>
            <div style={{ flex: 1 }}>
              <label className={classes.fieldLabel}>Category</label>
              <select
                defaultValue={product.category ?? ""}
                className={classes.select}
                {...register("category", { required: true })}
              >
                <option value="">—</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>Required</div>}
            </div>
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
            label="Price (RSD)"
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
            <label className={classes.fieldLabel}>Images</label>
            <ImagesEditor images={images} onChange={setImages} />
          </div>

          <div>
            <label className={classes.fieldLabel}>Variants</label>
            <VariantsEditor variants={variants} onChange={setVariants} colors={colorOptions} hideLabel />
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
