import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { edit, getById } from "../../services/foodService";
import Title from "../Title/Title";
import Input from "../Input/Input";
import { toast } from "react-toastify";
import Button from "../Button/Button";

export default function MealInput() {
  const { id } = useParams();
  const [meal, setMeal] = useState();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getById(id);
      setMeal(data);
    };

    fetchData();
  }, [id]);

  const submit = async (data) => {
    await edit(data);
    toast.success("Food edited successfully!");
    navigate("/meals");
  };

  return (
    meal && (
      <div>
        <Title title="Edit meal" />
        <form onSubmit={handleSubmit(submit)}>
          <Input
            type="text"
            defaultValue={meal.id}
            label="Id"
            {...register("id", {
              required: true,
            })}
            error={errors.id}
            readOnly
          />
          <Input
            type="text"
            defaultValue={meal.name}
            label="Name"
            {...register("name", {
              required: true,
            })}
            error={errors.name}
          />
          <Input
            type="text"
            defaultValue={meal.price}
            label="Price in $"
            {...register("price", {
              required: true,
            })}
            error={errors.price}
          />
          <Input
            type="text"
            defaultValue={meal.tags}
            label="Tags"
            {...register("tags", {
              required: true,
            })}
            error={errors.tags}
          />
          <Input
            type="text"
            defaultValue={meal.cookTime}
            label="Cook time in minutes"
            {...register("cookTime", {
              required: true,
            })}
            error={errors.cookTime}
          />
          <Button text="Update" type="submit" />
        </form>
      </div>
    )
  );
}
