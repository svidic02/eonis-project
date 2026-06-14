import {
  PayPalScriptProvider,
  PayPalButtons as PayPalSDKButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import React, { useEffect } from "react";
import { useLoading } from "../../hooks/useLoading";
import { pay } from "../../services/orderService";
import { useCart } from "../../hooks/useCart";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || "sb";
const RSD_TO_USD = Number(process.env.REACT_APP_RSD_TO_USD) || 0.0091;

export function toUsd(rsdAmount) {
  return (rsdAmount * RSD_TO_USD).toFixed(2);
}

export default function PayPalButtons({ order }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: CLIENT_ID,
        currency: "USD",
        intent: "capture",
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
    if (isPending) showLoading();
    else hideLoading();
  }, [isPending, showLoading, hideLoading]);

  const createPaypalOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: toUsd(order.totalPrice),
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const capture = await actions.order.capture();
      const orderId = await pay(capture.id);
      clearCart();
      toast.success("Payment successful.");
      navigate("/orders/" + orderId);
    } catch (err) {
      const msg = err?.response?.data;
      toast.error(typeof msg === "string" && msg ? msg : "Payment could not be confirmed.");
    }
  };

  const onError = () => {
    toast.error("Payment failed.");
  };

  return (
    <PayPalSDKButtons
      createOrder={createPaypalOrder}
      onApprove={onApprove}
      onError={onError}
      style={{ layout: "vertical", shape: "rect" }}
    />
  );
}
