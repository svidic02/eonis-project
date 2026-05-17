import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { addUser, getUserById } from "../../services/userService";
import Input from "../Input/Input";
import { toast } from "react-toastify";
import classes from "../ProductInput/productForm.module.css";

export default function UserInput({ flag }) {
  const isAdd = flag === true;
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (isAdd) return;
    (async () => {
      try {
        const data = await getUserById(id);
        setSubject(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [isAdd, id]);

  const submit = async (data) => {
    try {
      if (isAdd) {
        await addUser(data);
        toast.success("User added.");
      } else {
        const payload = { ...data, id: subject.id };
        if (!payload.password) delete payload.password;
        await auth.edit(payload);
        toast.success("User updated.");
      }
      navigate("/users");
    } catch (err) {
      toast.error(isAdd ? "Failed to add user." : "Failed to update user.");
    }
  };

  if (!isAdd && !subject) return null;

  const passwordLabel = isAdd ? "Password" : "New password (leave blank to keep)";
  const passwordRules = isAdd
    ? { required: true, minLength: 5 }
    : { minLength: { value: 5, message: "At least 5 characters" } };

  return (
    <div className={classes.page}>
      <div className={classes.heading}>
        <h1>{isAdd ? "Add user" : "Edit user"}</h1>
        <Link to="/users" className={classes.cancelLink}>
          ← Back to users
        </Link>
      </div>

      <div className={classes.card}>
        <form className={classes.form} onSubmit={handleSubmit(submit)}>
          <Input
            type="text"
            defaultValue={subject?.name}
            label="Name"
            {...register("name", { required: true, minLength: 5 })}
            error={errors.name}
          />
          <Input
            type="text"
            defaultValue={subject?.address}
            label="Address"
            {...register("address", { required: true })}
            error={errors.address}
          />
          <Input
            type="email"
            defaultValue={subject?.email}
            label="Email"
            {...register("email", {
              required: true,
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,63}$/i,
                message: "Email is not valid",
              },
            })}
            error={errors.email}
          />
          <Input
            type="password"
            label={passwordLabel}
            {...register("password", passwordRules)}
            error={errors.password}
          />

          <label className={classes.checkboxRow}>
            <input type="checkbox" defaultChecked={subject?.isAdmin} {...register("isAdmin")} />
            Admin
          </label>

          <div className={classes.actions}>
            <button type="button" className={classes.cancelBtn} onClick={() => navigate("/users")}>
              Cancel
            </button>
            <button type="submit" className={classes.saveBtn} disabled={isSubmitting}>
              {isAdd ? "Add user" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
