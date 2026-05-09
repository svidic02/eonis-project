import { Router } from "express";
import { FoodModel } from "../models/food.model.js";
import handler from "express-async-handler";
import mongoose from "mongoose";
import authMid from "../middleware/auth.mid.js";
import adminMid from "../middleware/admin.mid.js";

const router = Router();

router.get(
  "/",
  handler(async (req, res) => {
    const foods = await FoodModel.find({});
    res.send(foods);
  })
);

router.get(
  "/tags",
  handler(async (req, res) => {
    const tags = await FoodModel.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", count: "$count" } },
    ]).sort({ count: -1 });

    const all = {
      name: "All",
      count: await FoodModel.countDocuments(),
    };
    tags.unshift(all);

    res.send(tags);
  })
);

router.get(
  "/search/:searchTerm",
  handler(async (req, res) => {
    const { searchTerm } = req.params;
    const searchRegex = new RegExp(searchTerm, "i");
    const foods = await FoodModel.find({ name: { $regex: searchRegex } });
    res.send(foods);
  })
);

router.get(
  "/tag/:tag",
  handler(async (req, res) => {
    const { tag } = req.params;
    const foods = await FoodModel.find({ tags: tag });
    res.send(foods);
  })
);

router.get(
  "/:foodId",
  handler(async (req, res) => {
    const { foodId } = req.params;
    const food = await FoodModel.findById(foodId);
    res.send(food);
  })
);

// router.put(
//   "/:foodId",
//   authMid,
//   adminMid,
//   handler(async (req, res) => {
//     const { foodId } = req.params;
//     const data = req.body;
//     const name = data.name;
//     const price = data.price;
//     const tags = data.tags;
//     const time = data.cookTime;
//     // res.send(name);

//     const updatedMeal = {
//       name,
//       price,
//       tags,
//       time,
//     };

//     const meal = await FoodModel.findByIdAndUpdate(
//       { _id: foodId },
//       updatedMeal,
//       {
//         new: true,
//       }
//     );

//     if (!meal) {
//       return res.status(404).send("Meal not found");
//     }

//     res.send(meal);
//   })
// );

// router.delete(
//   "/:foodId",
//   authMid,
//   adminMid,
//   handler(async (req, res) => {
//     const { foodId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(foodId)) {
//       return res.status(400).send("Invalid food ID");
//     }
//     const result = await FoodModel.findByIdAndDelete(foodId);
//     if (!result) {
//       return res.status(400).send("User couldnt be deleted!");
//     }

//     res.send(result);
//   })
// );

// router.post(
//   "/addFood",
//   authMid,
//   adminMid,
//   handler(async (req, res) => {
//     const { name, price, tags, cookTime, imageUrl } = req.body;

//     const newMeal = {
//       name,
//       cookTime,
//       price,
//       imageUrl,
//       tags,
//     };

//     const result = await FoodModel.create(newMeal);

//     res.send(result);
//   })
// );

export default router;
