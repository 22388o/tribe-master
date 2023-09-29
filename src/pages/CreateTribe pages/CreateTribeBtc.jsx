import { useState } from "react";
import { Address, Script, Tap } from '@cmdcode/tapscript'
import './CreateTribeBtc.css'
import { useNavigate } from 'react-router-dom';

const CreateTribeBtc = () => {
 
  // useNavigate() hook
  const navigate = useNavigate();
  // show multisig modal component
  const [isModal, setIsModal ] = useState(false)
  
  // State to store the tribe info
  const [tribeBtc, setTribeBtc] = useState({
    tribeName: '',
    publicKeys: [''],
    threshold: 1,
    multisigAddress: ''
  })
  console.log(tribeBtc)

  // State to store the input values
  const [inputs, setInputs] = useState(['']); 
  // console.log(tribeBtc.publicKeys)

   // Function to add a new input field
   const addInput = () => {
    setInputs([...inputs, '']);
    setTribeBtc(prev => ({...prev, publicKeys: [...inputs, '']}))
  };

  // Function to remove an input field by index
  const removeInput = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
    setTribeBtc(prev => ({...prev, publicKeys: newInputs}))
  };
  // Function to handle change in text input value tribe name
  const handleChangeTribeName = (e) => {
      setTribeBtc({...tribeBtc,
              tribeName: e.target.value, 
          });
    }

  // Function to handle changes in text input values
  const handleInputChange = (index, event) => {
    const newInputs = [...inputs];
    newInputs[index] = event.target.value;
    setInputs(newInputs);
    setTribeBtc(prev => ({...prev, publicKeys: newInputs}))
  };

  // Define a function to handle changes in the input field
  const handleThresholdChange = (event) => {
    const inputValue = event.target.value;
    // Check if the input is a valid number and less than or equal to inputs.length
    if (!isNaN(inputValue) && Number(inputValue) <= inputs.length)  {
      setTribeBtc(prev => ({...prev, threshold: inputValue})); // Update the state if it's a valid input
    } else {
      alert('Choose a number inside the threshold')
    }
  };

  const tribeComponent = 
  <div 
    className={isModal ? 'tribe-component-btc' : 'hide' }>
    <p style={{fontWeight: 'bold'}}>{tribeBtc.tribeName}</p>
    <p style={{wordBreak: "break-all"}}>Your multisig address:<br></br> {tribeBtc.multisigAddress}</p>
    <p>Your policy is: {tribeBtc.threshold === '' ? 1 : tribeBtc.threshold} out of {tribeBtc.publicKeys.length} to get the stacking out.
    </p>
    <button onClick={() => navigate('/multisigPage')} >Check your tribe</button>
  </div>

// handle submit form
const handleSubmit = (event) => {
  event.preventDefault();
  // Handle the form submission logic with the input values
  setTribeBtc(prev => ({...prev, multisigAddress: multisig_address}))
  setIsModal(true)
  console.log(`Your tribe name is: ${tribeBtc.tribeName} and your multisig address is: ${multisig_address}`)
};

// multisig
var network = "testnet";
var script = [0];
tribeBtc.publicKeys.forEach( item => {
    script.push( item, "OP_CHECKSIGADD" );
});
var pubkey = "ab".repeat( 32 );
script.push( tribeBtc.threshold, "OP_EQUAL" );
var sbytes = Script.encode( script );
var tapleaf = Tap.tree.getLeaf( sbytes );
var [ tpubkey, cblock ] = Tap.getPubKey(pubkey, { target: tapleaf });
var multisig_address = Address.p2tr.fromPubKey( tpubkey, network );
console.log(multisig_address)

  const inputsComponent = inputs.map((input, index) => (
    <div key={index}>
        <input
          type="text"
          value={input}
          id={index}
          onChange={(e) => handleInputChange(index, e)}
          placeholder="public keys Only"
          disabled={isModal}
        />
        <button 
          className="input-buttons" 
          onClick={() => removeInput(index)}
          disabled={inputs.length === 1 || isModal}
          >-</button>
      </div>
    ))

  return (
    <form 
      className="tribeBtc-container" 
      onSubmit={handleSubmit}
      >
      <label htmlFor='tribe-name-input'>Name your tribe
        <input 
          disabled={isModal} 
          id='tribe-name-input' 
          onChange={handleChangeTribeName} 
          type="text"/>
      </label>
      <p>Enter your bitcoin *public keys  address for everyone in your tribe:</p>
      {inputsComponent}
      <button 
        // type="button" 
        disabled={isModal} 
        className="input-buttons" 
        onClick={addInput}
        >+</button>
      <p>Pick how many votes are needed to spend the money</p>
      <input
        className='select-threshold' 
        type="number"  
        min={1}
        value={tribeBtc.threshold} 
        step={1} 
        max={66}
        onChange={handleThresholdChange}
        disabled={isModal}
      />
       <p>Your policy so far: {tribeBtc.threshold === '' ? 1 : tribeBtc.threshold} out of {tribeBtc.publicKeys.length}
      </p>
      <button
       type="submit"
       >Submit</button>
      {tribeComponent}
    </form>
  )
};

export default CreateTribeBtc;
