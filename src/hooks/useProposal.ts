import { useAtom } from 'jotai';
import { useQuery } from 'react-query';
import { Bitpac, Proposal } from '@/types';
import fetchProposalsAndVotes from '@/utils/proposal/fetchProposalsAndVotes';
import { atom } from 'jotai';
import SessionStorage, {
  SessionsStorageKeys,
} from '@/services/session-storage';
import { useEffect } from 'react';

// Define your atoms here
const dataAtom = atom<{ proposals: Proposal[] } | undefined>(undefined);
const isLoadingAtom = atom(false);
const errorAtom = atom<any>(null);

const useProposals = (bitpac: Bitpac, utxos?: any) => {
  const { pubkeys = [], id = '' } = bitpac || {};

  const { refetch } = useQuery(
    ['proposals', pubkeys, id],
    () => fetchProposalsAndVotes(pubkeys, id, utxos, bitpac),
    {
      onSuccess: (data) => {
        if (data?.proposals?.length && id) {
          SessionStorage.set(`${id}_${SessionsStorageKeys.PROPOSALS}`, data);
        }
        // @ts-ignore
        setDataAtom(data);
        setIsLoadingAtom(false);
      },
      onError: (error) => {
        setErrorAtom(error);
        setIsLoadingAtom(false);
      },
      // @ts-ignore
      onLoading: () => {
        setIsLoadingAtom(true);
      },
    }
  );

  useEffect(() => {
    if (!bitpac) {
      return;
    }

    const proposals = SessionStorage.get(
      `${bitpac.id}_${SessionsStorageKeys.PROPOSALS}`
    );
    if (proposals?.proposals?.length) {
      setDataAtom(proposals);
    }
  }, [bitpac]);

  const [data, setDataAtom] = useAtom(dataAtom);
  const [isLoading, setIsLoadingAtom] = useAtom(isLoadingAtom);
  const [error, setErrorAtom] = useAtom(errorAtom);

  const { proposals = [] } = data || {};

  return {
    current: proposals,
    totalActiveVote:
      proposals?.filter((proposal: Proposal) => proposal.status === 'active')
        .length || 0,
    totalPastVote:
      proposals?.filter((proposal: Proposal) => proposal.status === 'past')
        .length || 0,
    isLoading,
    error,
    refetch, // Expose the refetch function
  };
};

export default useProposals;
