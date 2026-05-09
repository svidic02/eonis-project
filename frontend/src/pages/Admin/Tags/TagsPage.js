import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAllTags } from "../../../services/foodService";
import TagsList from "../../../components/TagsList/TagsList";

export default function TagsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  // const [filteredTags, setFilteredTags] = useState(tags);

  useEffect(() => {
    if (user && user.isAdmin) {
      getAllTags()
        .then((data) => {
          setTags(data);
        })
        .catch((error) => {
          console.error("Error fetching tags:", error);
        });
    } else {
      navigate("/");
    }

    // setFilteredTags(tags.filter((tag) => tag.name !== "All"));
  }, [user, navigate]);

  return <TagsList tags={tags} />;
  // <>{filteredTags && <TagsList tags={tags} />}</>;
}
