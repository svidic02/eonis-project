import {
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import React, { useEffect } from "react";
import { useLoading } from "../../hooks/useLoading";
import { pay } from "../../services/orderService";
import { useCart } from "../../hooks/useCart";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function PayPalButtons({order}) {
  return (
    <PayPalScriptProvider
      options={{
        clienId:
          "AUTlclA13NbGmJ02A2Rf7B_dMwkhOx2BJtN2jkAXX07I7fVTOEiqsSaJwADLvX7U9N85xxwE295pLQ05",
      }}
    >
      <Buttons order={order} />
    </PayPalScriptProvider>
  );
}

function Buttons({ order }) {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [{ isPending }] = usePayPalScriptReducer();
  const { showLoading, hideLoading } = useLoading();
  useEffect(() => {
    isPending ? showLoading() : hideLoading();
  });

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: order.totalPrice,
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const payment = await actions.order.capture();
      const orderId = await pay(payment.id);
      clearCart();
      toast.success("Payment Saved Successfully", "Success");
      navigate("/track/" + orderId);
    } catch (error) {
      toast.error("Payment Saving Failed", "Error");
    }
  };

  const onError = (err) => {
    toast.error("Payment Failed", "Error");
  };

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
    />
  );
}
