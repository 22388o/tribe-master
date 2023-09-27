import { useEffect, useState } from 'react';
import { Address, Script, Tap } from '@cmdcode/tapscript'
// import { Buffer } from 'buffer';
// import { bech32 } from 'bech32'
import './MultiSig.css'

const MultiSig = () => {
  // State show modal
  const [showModal, setShowModal] = useState(false)
  // State to store the input values
  const [inputs, setInputs] = useState([""]);
  
  console.log(inputs)
  
// State to store tribe data
  const [tribe, setTribe] = useState({
    tribeName: '',
    pubKeys: [],
    multiSigAddress: ''
})

console.log(tribe)

// State to store the Threshold
const [selectThreshold, setSelectThreshold] = useState(1)
  

  // pubkey from taproot address

  // const pubkeyFromTaproot = (address) => {
  //   return Buffer.from(bech32.bech32m.fromWords(bech32.bech32m.decode(address).words)).toString("hex");
// }



  // Multisig function
  
  var network = "testnet";
  var script = [0];
  inputs.forEach( item => {
    script.push( item, "OP_CHECKSIGADD" );
  });
  var pubkey = "ab".repeat( 32 );
  script.push( selectThreshold, "OP_EQUAL" );
  var sbytes = Script.encode( script );
  var tapleaf = Tap.tree.getLeaf( sbytes );
  var [ tpubkey, cblock ] = Tap.getPubKey(pubkey, { target: tapleaf });
  var multisig_address = Address.p2tr.fromPubKey( tpubkey, network );


  // Function to add a new input field
  const addInput = () => {
    setInputs([...inputs, '']);
  };
  // Function to remove an input field by index
  const removeInput = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };
  // Function to handle change in tribe
  const handleChangeTribeName = (e) => {
    setTribe({...tribe,
            tribeName: e.target.value, 
        });
  }

  // Function to handle changes in text input values
  const handleInputChange = (index, event) => {
    const newInputs = [...inputs];
    newInputs[index] = event.target.value;
    setInputs(newInputs);
    setTribe(prev => (
      {...prev,
        pubKeys: newInputs,
        multiSigAddress: multisig_address}
    ));
  };
  // Function to handle changes in number input value
  // Define a function to handle changes in the input field
  const handleThresholdChange = (event) => {
    const inputValue = event.target.value;
    // Check if the input is a valid number and less than or equal to inputs.length
    if (!isNaN(inputValue) && Number(inputValue) <= inputs.length) {
      setSelectThreshold(inputValue); // Update the state if it's a valid input
    }
  };
  
  const createTribe = () => {
    if (inputs.length <= selectThreshold) {
      setShowModal(true)
    } else {
      setShowModal(false)
      alert('there is an error')
    }
  }

  return (
    <div>
      <div className="tribe-name-container">
        <label>Name your tribe:
        <input 
          type="text" 
          onChange={(event) => handleChangeTribeName(event)}
          disabled={showModal} />
        </label>
      </div>
      {inputs.map((input, index) => (
        <div key={index}>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(index, e)}
            placeholder=""
            required
            disabled={showModal}
          />
          {!(inputs.length - 1 === 0) && 
          <button disabled={showModal} onClick={() => removeInput(index)}>Delete</button>}
        </div>
      ))}
      <button 
        onClick={addInput}
        disabled={showModal}>Add Input</button>
      <label>Pick how many votes are needed to spend the money:
        <input
            className='select_threshold' 
            type="number"  
            min={1}
            value={selectThreshold} 
            step={1} 
            max={inputs.length}
            onChange={(event) => handleThresholdChange(event)}
            disabled={showModal}
            />
      </label>
      <p>Your policy so far: {selectThreshold} out of {inputs.length}
      </p>
      <input 
        type="button" value="Create bitpac" className='create-multisig'
        onClick={() => createTribe()}
        disabled={showModal}
      />
      {showModal ? <div className='modal'>
    {/* <button 
      className="exit-modal-btn"
      // onClick={setShowModal(false)}
      >X</button> */}
    <p className='modal-text'>Tribe name: {tribe.tribeName}</p>
    <p className='modal-text'>Your policy is: {selectThreshold} votes out of {inputs.length}
    </p>
    <p className='modal-text'>this is the multisig address: {tribe.multiSigAddress}</p>
  </div> : null}
    </div>
  );
}

export default MultiSig;
