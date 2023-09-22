# Tribe

Publicly Auditable Cooperatives on Bitcoin

About
Publicly Auditable Cooperatives on Bitcoin

DAO's (Decentralized Autonomous Organizations) have become wildly popular within the crypto ecosystem. However, we would argue that DAO's as they exist today are neither decentralized or autonomous. The DAO concept is clearly in high demand, and we beleive that bringing this idea to life natively on Bitcoin will be immensly valuable. Tribe aims to provide a user friendly way for groups to organize on-chain, submit proposals, vote, manage treasuries, and view activity with transparency and auditability on the most censorship resistent and immuntable ledger ever - bitcoin.

Forget the overly marketed and co-opted DAO terminology, to create the bitcoin native governance experience described above, the techology being used is referred to as a bitpac (Bitcoin Publicly Auditable Cooperative).

A bitpac is essentially a multisig. Traditional multisigs are usually private, participants are not normally disclosed. In a bitpac, participants are disclosed, introducing public auditability.

Bitpac participants can be selected in various ways, through assets they hold, through profiles from nostr, through wallet submissions, etc. A new bitpac establishes a threshold of how many votes are needed to generate a transaction, this could be moving treasury funds, purchasing an asset, distruting payments, etc. Bitpac participants can generate proposals, submit votes, and effect action in the groups multisig, creating the foundational experience of a DAO, completely using bitcoin.

In the future we plan to upgrade and improve the tooling and ability of this tech through the integration of DLCs, Lightning, Nostr, and more. Tribe will always be bitcoin only and aims to push the capability of on-chain organization and governance forward.

Tribe Core is the open source fundamental tech behind Tribe and bitpacs

How Tribe Works
Tribe will offer bitpacs based on several inputs, including NOSTR npubs, btc wallet addresses, and ordinals assets held. Using NOSTR for example:

Alice and Bob enter their Nostr Keys (Npubs) as inputs to create a Bitpac.

A multisig bitpac is created where both participants have access to make proposals, submit votes, and thus control the treasurary.

Both participants can make proposals and submit votes to existing proposals, passed votes generate treasury transactions.

Integrating Ordinals
Sign in with xverse, hiro, unisat
When users go to join X ordinal bitpac, bitcheck should automatically check and verify they own said inscription in order to give them access
Once confirmed, they’re a participant of said bitpac and are given voting / proposal access
They would automatically be kicked from the bitpac if they sold or moved that ordinal
Status Software
This software is in Proof of Concept, we are adding:

Support for Bitcoin wallet addresses as WL inputs for bitpac creation
Support for Xverse, Hiro, and Unisat wallets, allowing sign in and access gating
Support for Ordinals protocol asset based inputs for bitpac creation (inscriptions and rare sats)
Support for Bitcheck verification
