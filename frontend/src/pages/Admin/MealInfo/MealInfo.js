import React from "react";
import MealInput from "../../../components/MealInput/MealInput";
import MealAdd from "../../../components/MealAdd/MealAdd";

export default function MealInfo({ add }) {
  return add ? <MealAdd /> : <MealInput />;
}
