import { useState } from 'react';
import './MultiSig.css'

const MultiSig = () => {
  const [selectThreshold, setSelectThreshold] = useState(1)
//   State to store the Threshold
  const [inputs, setInputs] = useState(['']);
  // State to store the input values
 
    console.log(selectThreshold)
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

  // Function to handle changes in text input values
  const handleInputChange = (index, event) => {
    const newInputs = [...inputs];
    newInputs[index] = event.target.value;
    setInputs(newInputs);
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

  return (
    <div>
      {inputs.map((input, index) => (
        <div key={index}>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(index, e)}
            placeholder="Enter your text"
            required
          />
          {!(inputs.length - 1 === 0) && 
          <button onClick={() => removeInput(index)}>Delete</button>}
        </div>
      ))}
      <button onClick={addInput}>Add Input</button>
      <label>Pick how many votes are needed to spend the money:
        <input
            className='select_threshold' 
            type="number"  
            min={1}
            value={selectThreshold} 
            step={1} 
            max={inputs.length}
            onChange={(event) => handleThresholdChange(event)}
            />
      </label>
      <p>Your policy so far: {selectThreshold} out of {inputs.length}
      </p>
      <input 
        type="submit" value="Create bitpac" className='create-multisg' />
    </div>
  );
}

export default MultiSig;
