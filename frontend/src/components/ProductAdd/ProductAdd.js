import React, { useEffect, useState } from "react";
import Title from "../Title/Title";
import { useForm } from "react-hook-form";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { addProduct, getAllTags } from "../../services/productService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import VariantsEditor from "../VariantsEditor/VariantsEditor";

export default function ProductAdd() {
  const navigate = useNavigate();
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [variants, setVariants] = useState([]);

  const {
    handleSubmit,
    register,
    formState: { errors },
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
      await addProduct({
        ...data,
        tags: selectedTags,
        variants,
      });
      toast.success("Product added successfully!");
      navigate("/products");
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  return (
    <div>
      <Title title="Add product" />
      <form onSubmit={handleSubmit(submit)}>
        <Input
          type="text"
          label="Name"
          {...register("name", { required: true })}
          error={errors.name}
        />
        <Input type="text" label="Brand" {...register("brand")} />
        <label>Category</label>
        <select defaultValue="" {...register("category")}>
          <option value="">—</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
        </select>
        <Input
          type="text"
          label="Description"
          {...register("description")}
        />
        <Input
          type="number"
          label="Price in $"
          {...register("price", { required: true, valueAsNumber: true })}
          error={errors.price}
        />

        <label>Tags</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", margin: "0.5rem 0 1rem" }}>
          {tagOptions.map((tag) => (
            <label key={tag.name} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.name)}
                onChange={() => toggleTag(tag.name)}
              />
              {tag.name}
            </label>
          ))}
        </div>

        <VariantsEditor variants={variants} onChange={setVariants} />

        <Button text="Add" type="submit" />
      </form>
    </div>
  );
}
