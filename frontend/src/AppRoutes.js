import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import FoodPage from "./pages/Food/FoodPage";
import CartPage from "./pages/Cart/CartPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import PaymentPage from "./pages/Payment/PaymentPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import UsersPage from "./pages/Admin/Users/UsersPage";
import TagsPage from "./pages/Admin/Tags/TagsPage";
import MealsPage from "./pages/Admin/Meals/MealsPage";
import OrdersPage from "./pages/Admin/Orders/OrdersPage";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import UserInfo from "./pages/Admin/UserInfo/UserInfo";
import MealInfo from "./pages/Admin/MealInfo/MealInfo";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}></Route>
      <Route path="/search/:searchTerm" element={<HomePage />}></Route>
      <Route path="/tag/:tag" element={<HomePage />}></Route>
      <Route path="/food/:id" element={<FoodPage />}></Route>
      <Route path="/cart" element={<CartPage />}></Route>
      <Route path="/login" element={<LoginPage />}></Route>
      <Route path="/register" element={<RegisterPage />}></Route>
      <Route path="/profile" element={<ProfilePage />}></Route>

      <Route
        path="/users"
        element={
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/tags"
        element={
          <AdminRoute>
            <TagsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/meals"
        element={
          <AdminRoute>
            <MealsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <AdminRoute>
            <OrdersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/user/:id"
        element={
          <AdminRoute>
            <UserInfo flag={false} />
          </AdminRoute>
        }
        // true is for add, false is for edit
      />
      <Route
        path="/user/add"
        element={
          <AdminRoute>
            <UserInfo flag={true} />
          </AdminRoute>
        }
        // true is for add, false is for edit
      />
      <Route
        path="/meals/:id"
        element={
          <AdminRoute>
            <MealInfo add={false} />
          </AdminRoute>
        }
      />
      <Route
        path="/meal/add"
        element={
          <AdminRoute>
            <MealInfo add={true} />
          </AdminRoute>
        }
      />
      {/* <Route
        path="/tags/:id"
        element={
          <AdminRoute>
            <MealInfo />
          </AdminRoute>
        }
      /> */}
      <Route
        path="/checkout"
        element={
          <AuthRoute>
            <CheckoutPage />
          </AuthRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <AuthRoute>
            <PaymentPage />
          </AuthRoute>
        }
      />
    </Routes>
  );
}
