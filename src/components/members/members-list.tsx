import { motion, LayoutGroup } from 'framer-motion';
import VoteDetailsCard from '@/components/vote/vote-details/vote-details-card';
import { ExportIcon } from '@/components/icons/export-icon';
// static data
import { getVotesByStatus } from '@/data/static/vote-data';
import AuthorImage from '@/assets/images/author.jpg';
import AuthorCard from '../ui/author-card';
export default function MemberList() {
  const { votes, totalVote } = getVotesByStatus('past');
  return (
    <LayoutGroup>
      <motion.div layout initial={{ borderRadius: 16 }} className="rounded-2xl">
        <div className="grid grid-cols-3 gap-2">
          {votes.map((vote: any, index: number) => (
            <div key={index}>
              <AuthorCard
                image={AuthorImage}
                name="Cameron Williamson"
                role="admin"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </LayoutGroup>
  );
}
