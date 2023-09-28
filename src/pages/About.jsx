const About = () => {
  return (
    <div style={{marginTop: "100px"}}>
    <p>DAO's(Decentralized Autonomous Organizations) have become wildly popular within the crypto ecosystem. However, we would argue that DAO's as they exist today are neither decentralized or autonomous. The DAO concept is clearly in high demand, and we beleive that bringing this idea to life natively on Bitcoin will be immensly valuable. Tribe aims to provide a user friendly way for groups to organize on-chain, submit proposals, vote, manage treasuries, and view activity with transparency and auditability on the most censorship resistent and immuntable ledger ever - bitcoin.</p>
    <p>Forget the overly marketed and co-opted DAO terminology, to create the bitcoin native governance experience described above, the techology being used is referred to as a bitpac (Bitcoin Publicly Auditable Cooperative).</p>
    <p>A bitpac is essentially a multisig. Traditional multisigs are usually private, participants are not normally disclosed. In a bitpac, participants are disclosed, introducing public auditability.

     Bitpac participants can be selected in various ways, through assets they hold, through profiles from nostr, through wallet submissions, etc. A new bitpac establishes a threshold of how many votes are needed to generate a transaction, this could be moving treasury funds, purchasing an asset, distruting payments, etc. Bitpac participants can generate proposals, submit votes, and effect action in the groups multisig, creating the foundational experience of a DAO, completely using bitcoin.</p>
    </div>
  )
};

export default About;
