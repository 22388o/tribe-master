import { motion, LayoutGroup } from 'framer-motion';
import VoteDetailsCard from '@/components/vote/vote-details/vote-details-card';
import { ExportIcon } from '@/components/icons/export-icon';
// static data
import { getVotesByStatus } from '@/data/static/vote-data';
import AuthorImage from '@/assets/images/author.jpg';
import AuthorCard from '../ui/author-card';
import { NostrTribe } from '@/types';

import useAuthors from '@/hooks/useMember';
import { pubkeyFromNpub, shortenStr } from '@/utils/utils';
import { useEffect, useState } from 'react';


export default function MemberList({ tribe }: { tribe?: NostrTribe }) {
  // var bitpac = JSON.parse( tribe.content   );
  // const pubkeys = bitpac[ 1 ];
  const pubkeys = [
    'c1fe52f8f5f40415e8237711ae4369fd4ecf753c995b512f49a1b26b8da18569',
    '2b1a0ee1061cc6c9487f0aa265a302cdb81974dac7df26a9940f5a0731cdc81f',
    'd444754a8e19a90f628fbce17f92176b25436f94227a36bb1670870f12cc9771',
  ];
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
