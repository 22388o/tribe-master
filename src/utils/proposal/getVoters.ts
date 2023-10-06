export const getVoters = (votes: any[]) => {
  return votes?.map((vote: any) => {
    const content = vote.content ? JSON.parse(vote.content) : 0;

    return {
      voter: { id: vote.pubkey, link: '#' },
      voting_weight: new Date(vote.created_at * 1000).toLocaleDateString(
        'en-US',
        { month: 'short', day: '2-digit', year: 'numeric' }
      ),
      status: content ? 'accepted' : 'rejected',
      pubkey: vote.pubkey,
    };
  });
};
