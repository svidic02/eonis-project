import React, { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Title from "../../components/Title/Title";
import classes from "./profilePage.module.css";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) return;
    navigate("/");
  }, [user]);

  if (!user) return;

  return (
    <div className={classes.container}>
      <div className={classes.imgWrapper}>
        <img src="basics/user.png" alt="User Profile" />
      </div>
      <div className={classes.details}>
        <div>
          <Title title="User name" className={classes.detailLabel} />
          <span className={classes.detailContent}>{user.name}</span>
        </div>
        <div>
          <Title title="Adress" className={classes.detailLabel} />
          <span className={classes.detailContent}>{user.address}</span>
        </div>
        <div>
          <Title title="Email" className={classes.detailLabel} />
          <span className={classes.detailContent}>{user.email}</span>
        </div>
      </div>
    </div>
  );
}
