export const calculateVotePercentages = (
  approvedVotes: number,
  rejectedVotes: number
) => {
  const totalVotes = approvedVotes + rejectedVotes;
  const acceptedPercentage = totalVotes
    ? (approvedVotes / totalVotes) * 100
    : 0;
  const rejectedPercentage = totalVotes
    ? (rejectedVotes / totalVotes) * 100
    : 0;

  return { acceptedPercentage, rejectedPercentage };
};
