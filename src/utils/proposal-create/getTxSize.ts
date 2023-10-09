export const getTxSize = (
  inputs: any[],
  outputs: any[],
  temp_multisig: any[]
) => {
  var size_of_each_input = 0;
  var i;
  for (i = 0; i < temp_multisig.length; i++) {
    size_of_each_input = size_of_each_input + (64 + 32 + 8);
  }
  var txsize = 0;
  var i;
  for (i = 0; i < inputs.length; i++) {
    txsize = txsize + size_of_each_input;
  }
  var i;
  for (i = 0; i < outputs.length; i++) {
    txsize = txsize + 30;
  }
  return txsize;
};
