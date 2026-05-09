import React, { useState } from "react";
import Title from "../Title/Title";
import classes from "./mealsList.module.css";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import { deleteMeal } from "../../services/foodService";
import ConfirmationDialog from "../ConfirmationDialog/ConfirmationDialog";
import { toast } from "react-toastify";

export default function MealsList({ meals }) {
  const navigate = useNavigate();
  const [mealToDelete, setMealToDelete] = useState(null);
  const [showDialog, setDialog] = useState(false);

  const handleEdit = (meal) => {
    navigate("/meals/" + meal.id);
  };
  const handleDelete = (meal) => {
    setMealToDelete(meal);
    setDialog(true);
  };
  const dialogConfirmed = async () => {
    try {
      await deleteMeal(mealToDelete._id);
      setDialog(false);
      window.location.reload();
      toast.success(
        "Meal with id:" + mealToDelete._id + " deleted succesfuly!"
      );
    } catch (error) {
      toast.error("Meal with id:" + mealToDelete._id + " couldnt be deleted!");
    }
  };
  const dialogCanceled = () => {
    setDialog(false);
  };
  const handleAdd = () => {
    navigate("/meal/add");
  };
  return (
    <div className={classes.wrapper}>
      <div className={classes.headerWrapper}>
        <Title title="Meals" className={classes.title} />
      </div>
      <Button text="Add" onClick={handleAdd} />
      <p className={classes.numberOf}>Total Meals: {meals.length}</p>
      <div className={classes.itemsWrapper}>
        {meals.map((meal) => (
          <div key={meal._id} className={classes.items}>
            <p>Name: {meal.name}</p>
            <p>Price: ${meal.price}</p>
            <p>Tags: {meal.tags.join(", ")}</p>
            <p>Cook Time: {meal.cookTime}</p>
            <Button text="Edit" onClick={() => handleEdit(meal)} />
            <Button
              backgroundColor="red"
              color="black"
              text="Delete"
              onClick={() => handleDelete(meal)}
            />
          </div>
        ))}
      </div>
      {showDialog && (
        <ConfirmationDialog
          msg="Are you sure you want to delete meal?"
          info={mealToDelete}
          onConfirm={() => dialogConfirmed()}
          onCancel={() => dialogCanceled()}
        />
      )}
    </div>
  );
}
