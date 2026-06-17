import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import ProductPage from "./pages/Product/ProductPage";
import CartPage from "./pages/Cart/CartPage";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import CustomerRoute from "./components/CustomerRoute/CustomerRoute";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import UsersPage from "./pages/Admin/Users/UsersPage";
import TagsPage from "./pages/Admin/Tags/TagsPage";
import ProductsPage from "./pages/Admin/Products/ProductsPage";
import OrdersPage from "./pages/Admin/Orders/OrdersPage";
import OrderInfoPage from "./pages/Admin/OrderInfo/OrderInfoPage";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import UserInfo from "./pages/Admin/UserInfo/UserInfo";
import ProductInfoPage from "./pages/Admin/ProductInfo/ProductInfoPage";
import TagInfoPage from "./pages/Admin/TagInfo/TagInfoPage";
import ColorsPage from "./pages/Admin/Colors/ColorsPage";
import ColorInfoPage from "./pages/Admin/ColorInfo/ColorInfoPage";
import BrandsPage from "./pages/Admin/Brands/BrandsPage";
import BrandInfoPage from "./pages/Admin/BrandInfo/BrandInfoPage";
import PromosPage from "./pages/Admin/Promos/PromosPage";
import PromoInfoPage from "./pages/Admin/PromoInfo/PromoInfoPage";
import AdminHomePage from "./pages/Admin/Home/AdminHomePage";
import AnalyticsPage from "./pages/Admin/Analytics/AnalyticsPage";
import FAQsPage from "./pages/Admin/FAQs/FAQsPage";
import FAQInfoPage from "./pages/Admin/FAQInfo/FAQInfoPage";
import ContactPage from "./pages/Contact/ContactPage";
import NotFound from "./components/NotFound/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}></Route>
      <Route path="/admin" element={<AdminRoute><AdminHomePage /></AdminRoute>}></Route>
      <Route path="/admin/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>}></Route>
      <Route path="/search/:searchTerm" element={<HomePage />}></Route>
      <Route path="/tag/:tag" element={<HomePage />}></Route>
      <Route path="/product/:id" element={<ProductPage />}></Route>
      <Route path="/cart" element={<CustomerRoute><CartPage /></CustomerRoute>}></Route>
      <Route path="/login" element={<LoginPage />}></Route>
      <Route path="/register" element={<RegisterPage />}></Route>
      <Route path="/profile" element={<AuthRoute><ProfilePage /></AuthRoute>}></Route>
      <Route
        path="/orders/:id"
        element={<OrderInfoPage />}
      />

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
        path="/products"
        element={
          <AdminRoute>
            <ProductsPage />
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
        path="/products/:id"
        element={
          <AdminRoute>
            <ProductInfoPage add={false} />
          </AdminRoute>
        }
      />
      <Route
        path="/product/add"
        element={
          <AdminRoute>
            <ProductInfoPage add={true} />
          </AdminRoute>
        }
      />
      <Route
        path="/tag/add"
        element={
          <AdminRoute>
            <TagInfoPage add={true} />
          </AdminRoute>
        }
      />
      <Route
        path="/tags/:id"
        element={
          <AdminRoute>
            <TagInfoPage add={false} />
          </AdminRoute>
        }
      />
      <Route
        path="/colors"
        element={
          <AdminRoute>
            <ColorsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/color/add"
        element={
          <AdminRoute>
            <ColorInfoPage add={true} />
          </AdminRoute>
        }
      />
      <Route
        path="/colors/:id"
        element={
          <AdminRoute>
            <ColorInfoPage add={false} />
          </AdminRoute>
        }
      />
      <Route
        path="/brands"
        element={
          <AdminRoute>
            <BrandsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/brand/add"
        element={
          <AdminRoute>
            <BrandInfoPage add={true} />
          </AdminRoute>
        }
      />
      <Route
        path="/brands/:id"
        element={
          <AdminRoute>
            <BrandInfoPage add={false} />
          </AdminRoute>
        }
      />
      <Route
        path="/promos"
        element={
          <AdminRoute>
            <PromosPage />
          </AdminRoute>
        }
      />
      <Route
        path="/promo/add"
        element={
          <AdminRoute>
            <PromoInfoPage add={true} />
          </AdminRoute>
        }
      />
      <Route
        path="/promos/:id"
        element={
          <AdminRoute>
            <PromoInfoPage add={false} />
          </AdminRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <CustomerRoute>
            <CheckoutPage />
          </CustomerRoute>
        }
      />
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/faqs"
        element={
          <AdminRoute>
            <FAQsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/faq/add"
        element={
          <AdminRoute>
            <FAQInfoPage add={true} />
          </AdminRoute>
        }
      />
      <Route
        path="/faqs/:id"
        element={
          <AdminRoute>
            <FAQInfoPage add={false} />
          </AdminRoute>
        }
      />
      <Route
        path="*"
        element={
          <NotFound
            message="This page doesn't exist."
            hint="The link may be broken or the page may have moved. Head back to the shop."
            linkText="Back to home"
          />
        }
      />
    </Routes>
  );
}
