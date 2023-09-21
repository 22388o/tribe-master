import MultiSig from "../../components/MultiSig";


const CreateTribeBtc = () => {
  return (
    <div>
      <p>Enter pay-to-taproot (P2TR), also known as a Taproot or Bech32m address for everyone in your tribe:</p>
      <MultiSig />
    </div>
  )
};

export default CreateTribeBtc;
