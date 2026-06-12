import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Input from "../Input/Input";
import InputContainer from "../InputContainer/InputContainer";
import classes from "../ProductInput/productForm.module.css";

export default function AdminTaxonomyInput({
  add,
  title,
  listPath,
  getById,
  addFn,
  editFn,
  fields,
  buildPayload,
  maxWidth,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  const form = useForm();
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (add) return;
    getById(id).then((it) => {
      setItem(it);
      if (it) {
        for (const f of fields) {
          if (it[f.name] !== undefined) setValue(f.name, it[f.name]);
        }
      }
    });
  }, [add, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (data) => {
    try {
      const payload = buildPayload ? buildPayload(data) : data;
      const noun = capitalize(title.replace(/^Add |^Edit /, ""));
      if (add) {
        await addFn(payload);
        toast.success(`${noun} added.`);
      } else {
        await editFn(id, payload);
        toast.success(`${noun} updated.`);
      }
      navigate(listPath);
    } catch (err) {
      const msg = err?.response?.data;
      toast.error(typeof msg === "string" ? msg : "Something went wrong.");
    }
  };

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  if (!add && !item) return null;

  return (
    <div className={classes.page} style={maxWidth ? { maxWidth } : undefined}>
      <div className={classes.heading}>
        <h1>{title}</h1>
        <Link to={listPath} className={classes.cancelLink}>← Back</Link>
      </div>

      <div className={classes.card}>
        <form className={classes.form} onSubmit={handleSubmit(submit)}>
          {fields.map((field) =>
            field.render ? (
              <React.Fragment key={field.name}>
                {field.render({ item, form, errors, register, setValue })}
              </React.Fragment>
            ) : field.type === "textarea" ? (
              <InputContainer key={field.name} label={field.label}>
                <textarea
                  className={classes.textarea}
                  rows={field.rows ?? 4}
                  maxLength={field.maxLength}
                  placeholder={field.label}
                  defaultValue={item?.[field.name]}
                  {...register(field.name, { required: field.required })}
                />
                {errors[field.name] && (
                  <div className={classes.textareaError}>
                    {errors[field.name].message || "This field is required"}
                  </div>
                )}
              </InputContainer>
            ) : (
              <Input
                key={field.name}
                type={field.type ?? "text"}
                defaultValue={item?.[field.name]}
                label={field.label}
                {...register(field.name, {
                  required: field.required,
                  pattern: field.pattern,
                  valueAsNumber: field.type === "number",
                })}
                error={errors[field.name]}
              />
            )
          )}

          <div className={classes.actions}>
            <button
              type="button"
              className={classes.cancelBtn}
              onClick={() => navigate(listPath)}
            >
              Cancel
            </button>
            <button type="submit" className={classes.saveBtn} disabled={isSubmitting}>
              {add ? "Save" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
