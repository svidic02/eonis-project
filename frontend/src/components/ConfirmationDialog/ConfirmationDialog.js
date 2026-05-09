import React from "react";
import classes from "./confirmationDialog.module.css";

export default function ConfirmationDialog({ msg, info, onConfirm, onCancel }) {
  return (
    <div className={classes.modal}>
      <div className={classes.dialog}>
        <p>{msg}</p>
        <p>Name : {info.name}</p>
        {info.email ? <p>Email : {info.email}</p> : ""}
        {info.address ? <p>Address : {info.address}</p> : ""}
        {info.isAdmin ? (
          <p>Type of user : {info.isAdmin ? "Admin" : "Regular User"}</p>
        ) : (
          ""
        )}
        {info.price ? <p>Price : {info.price}</p> : ""}
        <button onClick={onConfirm}>Yes</button>
        <button onClick={onCancel}>No</button>
      </div>
    </div>
  );
}
