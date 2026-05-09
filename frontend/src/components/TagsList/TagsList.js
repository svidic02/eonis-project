import React from "react";
import Title from "../Title/Title";
import classes from "./tagsList.module.css";
import Button from "../Button/Button";

export default function TagsList({ tags }) {
  return (
    <div className={classes.wrapper}>
      <div className={classes.headerWrapper}>
        <Title title="Tags" className={classes.title} />
      </div>
      <Button text="Add" />
      <p className={classes.numberOf}>Total Tags : {tags.length}</p>
      <div className={classes.itemsWrapper}>
        {tags.map((tag) => (
          <div key={tag.name} className={classes.items}>
            <p>{tag.name}</p>
            <Button
              text="Edit"
              onClick={() => console.log("edit clicked on tag " + tag.name)}
            />
            <Button
              backgroundColor="red"
              color="black"
              text="Delete"
              onClick={() => console.log("delete clicked on tag " + tag.name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
