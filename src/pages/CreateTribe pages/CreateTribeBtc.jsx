import MultiSig from "../../components/MultiSig";


const CreateTribeBtc = () => {
  return (
    <div>
      <p>Enter pay-to-taproot (P2TR), also known as a Taproot or Bech32m address for everyone in your tribe:</p>
      <MultiSig />
      <script>
      
var network = "testnet";
var threshold = 3;
var script = [0];
pubkeys.forEach( item => {
    script.push( item, "OP_CHECKSIGADD" );
});
var pubkey = "ab".repeat( 32 );
script.push( threshold, "OP_EQUAL" );
var sbytes = tapscript.Script.encode( script );
var tapleaf = tapscript.Tap.tree.getLeaf( sbytes );
var [ tpubkey, cblock ] = tapscript.Tap.getPubKey(pubkey, { target: tapleaf });
var multisig_address = tapscript.Address.p2tr.fromPubKey( tpubkey, network );

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
