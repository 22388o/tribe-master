import { useQuery } from 'react-query';
import { nostrPool } from '@/services/nostr';
import { NostrMember } from '@/types';

const fetchAuthors = async (pubkeys: string[]) => {
  const filter = [{
    authors: pubkeys,
    kinds: [0]
  }]

  const authors = await nostrPool.list(filter);
  return authors;
};

const useAuthors = (pubkeys: string[]) => {
  const { data: authors, isLoading, error } = useQuery(['authors', pubkeys], () => fetchAuthors(pubkeys));

  const missingAuthors = pubkeys.filter((pubkey) => !authors?.some((author) => author.pubkey === pubkey)) || [];

  const missingMembers = missingAuthors.map((m) => ({
    display_name: 'No name',
    pubkey: m,
  }));

  const findedMembers: NostrMember[] = authors?.reduce((unique: NostrMember[], m: any) => {
    if (!unique.some((member) => member.pubkey === m.pubkey)) {
        const content = JSON.parse(m.content);
      unique.push({
        display_name: content.display_name,
        pubkey: m.pubkey,
        picture: content.picture,
      });
    }
    return unique;
  }, []) || [];

  const allMembers: NostrMember[] = [...findedMembers, ...missingMembers || []];
  allMembers.sort((a, b) => a.pubkey.localeCompare(b.pubkey));

  return { members: allMembers, isLoading, error };
};

export default useAuthors;