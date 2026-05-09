import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAllOrders } from "../../../services/orderService";
import OrderList from "../../../components/OrdersList/OrdersList";

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getAllOrders()
      .then((data) => {
        setOrders(data);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
  }, []);

  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <OrderList orders={orders} />
    </>
  );
}
