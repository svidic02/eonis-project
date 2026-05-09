import classes from './button.module.css';

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
  return (
    <div className={classes.container}>
      <button
        style={{
          color,
          backgroundColor,
          fontSize,
          fontWeight,
          width,
          height,
        }}
        type={type}
        onClick={onClick}
      >
        {text}
      </button>
      
    </div>
  );
}

Button.defaultProps = {
  type: 'button',
  text: 'Submit',
  backgroundColor: '#e5201c',
  color: 'white',
  fontSize: '1.3rem',
  width: '12rem',
  height: '3.5rem',
};