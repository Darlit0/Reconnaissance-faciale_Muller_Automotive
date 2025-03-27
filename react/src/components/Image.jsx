function Image(props) {
  
    return (
      <img className={props.addclass} src={props.src} alt={props.alt} width={props.width} height={props.height}/>
    )
  }

export default Image