import MultiSig from "../../components/MultiSig";


const CreateTribeBtc = () => {
  return (
    <div>
      <p>Enter pay-to-taproot (P2TR), also known as a Taproot or Bech32m address for everyone in your tribe:</p>
      <MultiSig />
      <script>
var BitcoinWallet() {
  const [multisigAddress, setMultisigAddress] = useState('');
  const [taprootAddress, setTaprootAddress] = useState('');

  // Create a Multisig address
  const createMultisigAddress = () => {
    const pubKeys = [
      'publicKey1',
      'publicKey2',
      // Add more public keys as needed for Multisig setup
    ];
    const m = 2; // Required number of signatures
    const network = bitcoin.networks.bitcoin; // You can change the network if needed

    const redeemScript = bitcoin.payments.p2ms({ m, pubkeys: pubKeys, network });
    const p2shAddress = bitcoin.payments.p2sh({ redeem: redeemScript, network });

    setMultisigAddress(p2shAddress.address);
  };

  // Create a Taproot address
  const createTaprootAddress = () => {
    const keyPair = bitcoin.ECPair.makeRandom(); // Generate a random key pair
    const publicKey = keyPair.publicKey;
    const network = bitcoin.networks.bitcoin; // You can change the network if needed

    const taprootAddress = bitcoin.payments.p2tr({ pubkey: publicKey, network });

    setTaprootAddress(taprootAddress.address);
  };

  return (
    <div>
      <h1>Bitcoin Wallet</h1>
      <button onClick={createMultisigAddress}>Create Multisig Address</button>
      <p>Multisig Address: {multisigAddress}</p>

      <button onClick={createTaprootAddress}>Create Taproot Address</button>
      <p>Taproot Address: {taprootAddress}</p>
    </div>
  );
}

export default BitcoinWallet;

      </script>
    </div>
  )
};

export default CreateTribeBtc;
