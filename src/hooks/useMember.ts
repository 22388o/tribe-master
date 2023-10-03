import { useQuery } from 'react-query';
import { nostrPool } from '@/services/nostr';

const fetchAuthors = async (pubkeys: Array<string>) => {
  const filter = [
    {
      authors: pubkeys,
      kinds: [0],
    },
  ];

  const authors = await nostrPool.list(filter);
  console.log('aa', authors);
  return authors;
};

const useAuthors = (pubkeys: Array<string>) => {
  const { data, isLoading, error } = useQuery(['authors', pubkeys], () =>
    fetchAuthors(pubkeys)
  );

  console.log('isLoading', isLoading);
  const authors = data?.map((author) => ({
    ...JSON.parse(author.content),
    pubkey: author.pubkey,
    id: author.id,
  }));
  return { authors, isLoading, error };
};

export default useAuthors;
