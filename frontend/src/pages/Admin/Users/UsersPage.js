import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../../services/userService";
import UserList from "../../../components/UserList/UserList";

export default function UsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user && user.isAdmin) {
      getAllUsers()
        .then((data) => {
          setUsers(data);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
        });
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <UserList users={users} />
    </>
  );
}
