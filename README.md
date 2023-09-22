# Tribe

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
