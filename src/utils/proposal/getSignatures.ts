export const getSignatures = (votes: any[]) => {
  const votesWithSignatures = votes?.filter(
    (vote: any) => vote.content && vote.content !== '1'
  );
  const allSignatures: { sigs: any[]; pubkey: string }[] = [];
  votesWithSignatures?.forEach((vote: any) => {
    const voteSignatures = JSON.parse(vote.content);
    allSignatures.push({ sigs: voteSignatures, pubkey: vote.pubkey });
  });

  return allSignatures;
};
