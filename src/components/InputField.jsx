function InputField(props) {
  //       <form className={`${props.addclass} inputfield`} role={props.role}>
  //      </form>  
    return (
        <input className={props.addclass} placeholder={props.placeholder}/>
    )
}

export default InputField