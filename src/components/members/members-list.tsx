import { motion, LayoutGroup } from 'framer-motion';
import AuthorImage from '@/assets/images/author.jpg';
import AuthorCard from '../ui/author-card';
import { NostrEvent } from '@/types';

import useAuthors from '@/hooks/useMember';
import { shortenStr } from '@/utils/utils';

export default function MemberList({pubkeys}: {pubkeys: string[]}) {
  const { members } = useAuthors(pubkeys);

  return (
    <LayoutGroup>
      <motion.div layout initial={{ borderRadius: 16 }} className="rounded-2xl">
        <div className="grid grid-cols-3 gap-2">
          {members?.map((member: any, index: number) => (
            <div key={index}>
              <AuthorCard
                image={member.picture || AuthorImage}
                name={member.display_name || 'No name'}
                role={shortenStr(member.pubkey)}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </LayoutGroup>
  );
}
