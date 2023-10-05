export const getProposalContent = (proposal: any) => {
  const proposalContent = JSON.parse(proposal.content);
  const { id, pubkey } = proposal;
  const title = proposalContent[0];
  const inputs = proposalContent[1];
  const outputs = proposalContent[2];
  const description = proposalContent[3];

  return { id, pubkey, title, inputs, outputs, description };
};
