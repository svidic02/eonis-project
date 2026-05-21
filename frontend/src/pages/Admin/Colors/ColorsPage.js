import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAllColorsAdmin } from "../../../services/colorService";
import ColorsList from "../../../components/ColorsList/ColorsList";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

export default function ColorsPage() {
  useDocumentTitle("Footprint Admin · Colors");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [colors, setColors] = useState([]);

  useEffect(() => {
    if (user && user.isAdmin) {
      getAllColorsAdmin()
        .then((data) => setColors(data))
        .catch((error) => console.error("Error fetching colors:", error));
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <ColorsList
      colors={colors}
      onDeleted={(id) => setColors((prev) => prev.filter((c) => c._id !== id))}
    />
  );
}
