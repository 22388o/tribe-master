import { useState } from "react";


const MultiSigComponent = () => {
  
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="multisig-container">
     <div className="getPubkeys"></div>
    </div>
  )
};

export default MultiSigComponent;
