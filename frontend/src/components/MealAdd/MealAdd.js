import React, { useEffect, useState } from "react";
import Title from "../Title/Title";
import { useForm } from "react-hook-form";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { addMeal, getAllTags } from "../../services/foodService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function MealAdd() {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue, // Added to set multiple selected values
  } = useForm();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const result = await getAllTags();
        setTags(result);
      } catch (error) {
        toast.error("Failed to load tags");
      }
    };
    fetchTags();
  }, []);

  const submit = async (data) => {
    try {
      await addMeal(data);
      toast.success("Food added successfully!");
      navigate("/meals");
    } catch (error) {
      toast.error("Failed to add meal");
    }
  };

  // Handle multiple selection
  const handleTagChange = (event) => {
    const options = event.target.options;
    const selectedTags = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTags.push(options[i].value);
      }
    }
    setValue("tags", selectedTags); // Update the form state with selected tags
  };

  return (
    <div>
      <Title title="Add meal" />
      <form onSubmit={handleSubmit(submit)}>
        <Input
          type="text"
          label="Name"
          {...register("name", {
            required: true,
          })}
          error={errors.name}
        />
        <Input
          type="text"
          label="Price in $"
          {...register("price", {
            required: true,
          })}
          error={errors.price}
        />
        {/* Dropdown for selecting multiple tags */}
        <label htmlFor="tags">Tags</label>
        <select
          id="tags"
          {...register("tags", {
            required: true,
          })}
          multiple
          onChange={handleTagChange} // Add onChange handler
        >
          {tags.map((tag, index) => (
            <option key={index} value={tag.id}> {/* Use tag.id if it's an object */}
              {tag.name} {/* Use tag.name for display */}
            </option>
          ))}
        </select>
        {errors.tags && <span>This field is required</span>}

        <Input
          type="text"
          label="Cook time in minutes"
          {...register("cookTime", {
            required: true,
          })}
          error={errors.cookTime}
        />
        <Button text="Add" type="submit" />
      </form>
    </div>
  );
}
