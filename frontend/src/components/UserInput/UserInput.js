import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { getUserById } from "../../services/userService";
import Title from "../Title/Title";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { toast } from "react-toastify";
import "./UserInput.css"; // Adjust the path according to your folder structure

export default function UserInput({ flag }) {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const auth = useAuth();
  // const { user } = auth;
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (flag === false) {
      const fetchData = async () => {
        try {
          const subjectData = await getUserById(id);
          setSubject(subjectData);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }
  }, [flag, id]);

  const submit = async (data) => {
    try {
      if (flag === true) {
        // For adding a new user
        await auth.add(data); // Change to your method for adding a user
        toast.success(`User added successfully!`);
      } else if (flag === false) {
        // For editing an existing user
        await auth.edit(data); // Change to your method for editing a user
        toast.success(`User edited successfully!`);
      }
      navigate("/users");
    } catch (error) {
      console.error(error);
      if (flag === true) {
        toast.error("Error adding user.");
      } else {
        toast.error("Error editing user.");
      }
    }
  };

  return (
    <div className="user-input-container">
      {flag === true ? (
        <div>
          <Title title="Add User" className="user-input-title" />
          <form className="user-input-form" onSubmit={handleSubmit(submit)}>
            <Input
              className="user-input-field"
              type="text"
              label="Name"
              {...register("name", {
                required: true,
                minLength: 5,
              })}
              error={errors.name}
            />
            <Input
              className="user-input-field"
              type="text"
              label="Address"
              {...register("address", {
                required: true,
              })}
              error={errors.address}
            />
            <Input
              className="user-input-field"
              type="email"
              label="Email"
              {...register("email", {
                required: true,
                pattern: {
                  value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,63}$/i,
                  message: "Email Is Not Valid",
                },
              })}
              error={errors.email}
            />
            <div>
              <Input
                className="user-input-field"
                type="password"
                label="Password"
                {...register("password", {
                  required: true,
                  minLength: 5,
                })}
                error={errors.password}
              />
            </div>
            <Input
              className="user-input-field"
              type="checkbox"
              label="Admin"
              {...register("isAdmin", {
                required: false,
              })}
              error={errors.admin}
            />
            <Button text="Add" type="submit" className="user-input-button" />
          </form>
        </div>
      ) : flag === false ? (
        subject && (
          <div>
            <Title title="Edit User" className="user-input-title" />
            <form className="user-input-form" onSubmit={handleSubmit(submit)}>
              <Input
                className="user-input-field"
                type="text"
                defaultValue={subject.name}
                label="Name"
                {...register("name", {
                  required: true,
                  minLength: 5,
                })}
                error={errors.name}
              />
              <Input
                className="user-input-field"
                type="text"
                defaultValue={subject.id}
                label="Id:"
                {...register("id", {
                  defaultValue: id,
                })}
                error={errors.id}
                readOnly
              />
              <Input
                className="user-input-field"
                type="text"
                defaultValue={subject.address}
                label="Address"
                {...register("address", {
                  required: true,
                })}
                error={errors.address}
              />
              <Input
                className="user-input-field"
                type="email"
                defaultValue={subject.email}
                label="Email"
                {...register("email", {
                  required: true,
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,63}$/i,
                    message: "Email Is Not Valid",
                  },
                })}
                error={errors.email}
              />
              <div>
                <Input
                  className="user-input-field"
                  type="password"
                  defaultValue={subject.password}
                  label="Password"
                  {...register("password", {
                    required: true,
                    minLength: 5,
                  })}
                  error={errors.password}
                />
              </div>
              <Input
                className="user-input-field"
                type="checkbox"
                defaultChecked={subject.isAdmin}
                label="Admin"
                {...register("isAdmin", {
                  required: false,
                })}
                error={errors.admin}
              />
              <Button text="Update" type="submit" className="user-input-button" />
            </form>
          </div>
        )
      ) : null}
    </div>
  );
}
