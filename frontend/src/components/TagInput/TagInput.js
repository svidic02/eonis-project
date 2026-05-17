import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { addTag, editTag, getTagById } from "../../services/tagService";
import Input from "../Input/Input";
import classes from "../ProductInput/productForm.module.css";

export default function TagInput({ add }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tag, setTag] = useState(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (add) return;
    getTagById(id).then(setTag);
  }, [add, id]);

  const submit = async (data) => {
    try {
      if (add) {
        await addTag(data);
        toast.success("Tag added.");
      } else {
        await editTag(id, data);
        toast.success("Tag updated.");
      }
      navigate("/tags");
    } catch (err) {
      const msg = err?.response?.data || (add ? "Failed to add tag." : "Failed to update tag.");
      toast.error(typeof msg === "string" ? msg : "Something went wrong.");
    }
  };

  if (!add && !tag) return null;

  return (
    <div className={classes.page}>
      <div className={classes.heading}>
        <h1>{add ? "Add tag" : "Edit tag"}</h1>
        <Link to="/tags" className={classes.cancelLink}>← Back to tags</Link>
      </div>

      <div className={classes.card}>
        <form className={classes.form} onSubmit={handleSubmit(submit)}>
          <Input
            type="text"
            defaultValue={tag?.name}
            label="Name"
            {...register("name", { required: true })}
            error={errors.name}
          />
          <Input
            type="text"
            defaultValue={tag?.description}
            label="Description"
            {...register("description")}
          />

          <div className={classes.actions}>
            <button
              type="button"
              className={classes.cancelBtn}
              onClick={() => navigate("/tags")}
            >
              Cancel
            </button>
            <button type="submit" className={classes.saveBtn} disabled={isSubmitting}>
              {add ? "Add tag" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
