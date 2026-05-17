import classes from "./button.module.css";

export default function Button({
  type,
  text,
  onClick,
  color,
  backgroundColor,
  fontSize,
  fontWeight,
  width,
  height,
}) {
  const isDanger = backgroundColor === "red";
  const cls = isDanger
    ? `${classes.btn} ${classes.danger}`
    : `${classes.btn} ${classes.primary}`;
  const overrides = {
    fontSize,
    fontWeight,
    width,
    height,
  };
  if (color && !isDanger) overrides.color = color;
  return (
    <div className={classes.container}>
      <button className={cls} style={overrides} type={type} onClick={onClick}>
        {text}
      </button>
    </div>
  );
}

Button.defaultProps = {
  type: "button",
  text: "Submit",
  fontSize: "1rem",
  fontWeight: 600,
  width: "12rem",
  height: "2.75rem",
};
