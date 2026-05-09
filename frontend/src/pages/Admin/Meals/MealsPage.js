import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAll } from "../../../services/foodService";
import MealsList from "../../../components/MealsList/MealsList";

export default function MealsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    if (user && user.isAdmin) {
      getAll()
        .then((data) => {
          setMeals(data);
        })
        .catch((error) => {
          console.error("Error fetching meals:", error);
        });
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <MealsList meals={meals} />
    </>
  );
}
