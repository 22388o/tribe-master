export const getVoteCounts = (
  votes: any[]
): { approvedVotes: number; rejectedVotes: number } => {
  let approvedVotes = 0;
  let rejectedVotes = 0;

  votes?.forEach((vote: any) => {
    const content = vote.content ? JSON.parse(vote.content) : 0;

    if (content) {
      approvedVotes += 1;
    } else {
      rejectedVotes += 1;
    }
  });

  return { approvedVotes, rejectedVotes };
};
