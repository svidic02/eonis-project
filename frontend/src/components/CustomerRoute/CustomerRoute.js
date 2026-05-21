import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

export default function CustomerRoute({ children }) {
  const { user } = useAuth();
  const blocked = !!user?.isAdmin;

  useEffect(() => {
    if (blocked) {
      toast.info("Admins can't access the shop. Sign in as a customer to buy.");
    }
  }, [blocked]);

  if (blocked) return <Navigate to="/" replace />;
  return children;
}
