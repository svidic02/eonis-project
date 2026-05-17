import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { edit, getById, getAllTags } from "../../services/productService";
import Title from "../Title/Title";
import Input from "../Input/Input";
import { toast } from "react-toastify";
import Button from "../Button/Button";
import VariantsEditor from "../VariantsEditor/VariantsEditor";

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
    formState: { errors },
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
      await edit({
        ...data,
        tags: selectedTags,
        variants,
      });
      toast.success("Product edited successfully!");
      navigate("/products");
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  return (
    product && (
      <div>
        <Title title="Edit product" />
        <form onSubmit={handleSubmit(submit)}>
          <Input
            type="text"
            defaultValue={product.id}
            label="Id"
            {...register("id", { required: true })}
            error={errors.id}
            readOnly
          />
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
          <label>Category</label>
          <select defaultValue={product.category ?? ""} {...register("category")}>
            <option value="">—</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
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

          <Button text="Update" type="submit" />
        </form>
      </div>
    )
  );
}
