import React, { useState } from "react";
import classes from "./userList.module.css";
import Title from "../Title/Title";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "../ConfirmationDialog/ConfirmationDialog";
import { deleteUser } from "../../services/userService";
import { toast } from "react-toastify";

export default function UserList({ users }) {
  const navigate = useNavigate();
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDialog, setDialog] = useState(false);

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDialog(true);
  };

  const dialogConfirmed = async () => {
    try {
      await deleteUser(userToDelete._id);
      setDialog(false);
      window.location.reload();
      toast.success(
        "User with id:" + userToDelete._id + " deleted succesfuly!"
      );
    } catch (error) {
      toast.error("User with id:" + userToDelete._id + " couldnt be deleted!");
    }
  };

  const dialogCanceled = () => {
    setDialog(false);
  };

  const handleEdit = (user) => {
    navigate(`/user/${user._id}`);
  };

  const handleAdd = () =>{
    navigate(`/user/add`);
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.headerWrapper}>
        <Title title="Users" className={classes.title} />
      </div>
      <Button text="Add" onClick={handleAdd} />
      <p className={classes.numberOf}>Total Users: {users.length}</p>
      <div className={classes.itemsWrapper}>
        {users.map((user) => (
          <div key={user._id} className={classes.items}>
            <p>Name : {user.name}</p>
            <p>Email : {user.email}</p>
            <p>Address : {user.address}</p>
            <p>Type of user : {user.isAdmin ? "Admin" : "Regular User"}</p>
            <p>Date joined : {extractDate(user.createdAt)}</p>
            <Button text="Edit" onClick={() => handleEdit(user)} />
            <Button
              backgroundColor="red"
              color="black"
              text="Delete"
              onClick={() => handleDelete(user)}
            />
          </div>
        ))}
      </div>
      {showDialog && (
        <ConfirmationDialog
          msg="Are you sure you want to delete user?"
          info={userToDelete}
          onConfirm={() => dialogConfirmed()}
          onCancel={() => dialogCanceled()}
        />
      )}
    </div>
  );
}
function extractDate(timestamp) {
  const dateObj = new Date(timestamp);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // Months are 0-indexed, so add 1
  const day = dateObj.getDate();

  return `${day}/${month}/${year}`;
}
