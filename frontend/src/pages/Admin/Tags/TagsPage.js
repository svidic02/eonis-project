import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAllTagsAdmin } from "../../../services/tagService";
import TagsList from "../../../components/TagsList/TagsList";

export default function TagsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (user && user.isAdmin) {
      getAllTagsAdmin()
        .then((data) => {
          setTags(data);
        })
        .catch((error) => {
          console.error("Error fetching tags:", error);
        });
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <TagsList
      tags={tags}
      onDeleted={(id) => setTags((prev) => prev.filter((t) => t._id !== id))}
    />
  );
}
