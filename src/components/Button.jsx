function Button(props) {
  return (
    <button className={props.addclass} onClick={props.onClick}>
      {props.text}
      {props.children}
    </button>
  );
}

export default Button