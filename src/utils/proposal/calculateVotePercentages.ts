export const calculateVotePercentages = (
  approvedVotes: number,
  rejectedVotes: number,
  threshold: number
) => {
  const totalVotes = approvedVotes + rejectedVotes;
  const acceptedPercentage =
    approvedVotes >= threshold
      ? 100
      : totalVotes
      ? (approvedVotes / threshold) * 100
      : 0;
  const rejectedPercentage = totalVotes ? (rejectedVotes / threshold) * 100 : 0;

  return { acceptedPercentage, rejectedPercentage };
};
