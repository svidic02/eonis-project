import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { addProduct, getAllTags } from "../../services/productService";
import Input from "../Input/Input";
import { toast } from "react-toastify";
import VariantsEditor from "../VariantsEditor/VariantsEditor";
import classes from "../ProductInput/productForm.module.css";

export default function ProductAdd() {
  const navigate = useNavigate();
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [variants, setVariants] = useState([]);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    getAllTags()
      .then((tags) => setTagOptions(tags.filter((t) => t.name !== "All")))
      .catch(() => toast.error("Failed to load tags"));
  }, []);

  const toggleTag = (name) => {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const submit = async (data) => {
    try {
      await addProduct({ ...data, tags: selectedTags, variants });
      toast.success("Product added.");
      navigate("/products");
    } catch {
      toast.error("Failed to add product.");
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.heading}>
        <h1>Add product</h1>
        <Link to="/products" className={classes.cancelLink}>← Back to products</Link>
      </div>

      <div className={classes.card}>
        <form className={classes.form} onSubmit={handleSubmit(submit)}>
          <Input
            type="text"
            label="Name"
            {...register("name", { required: true })}
            error={errors.name}
          />
          <Input type="text" label="Brand" {...register("brand")} />

          <div>
            <label className={classes.fieldLabel}>Category</label>
            <select defaultValue="" className={classes.select} {...register("category")}>
              <option value="">—</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>
          </div>

          <Input type="text" label="Description" {...register("description")} />
          <Input
            type="number"
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
              Add product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
