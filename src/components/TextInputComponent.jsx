import { useState } from 'react';

const TextInputComponent = () => {

  const [inputs, setInputs] = useState(['']); // State to store the input values
    console.log(inputs)
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

  // Function to handle changes in input values
  const handleInputChange = (index, event) => {
    const newInputs = [...inputs];
    newInputs[index] = event.target.value;
    setInputs(newInputs);
  };

  return (
    <div>
      {inputs.map((input, index) => (
        <div key={index}>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(index, e)}
            placeholder="Enter text"
          />
          <button onClick={() => removeInput(index)}>Delete</button>
        </div>
      ))}
      <button onClick={addInput}>Add Input</button>
    </div>
  );
}

export default TextInputComponent;
