'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import cn from 'classnames';
import Button from '@/components/ui/button';
import RevealContent from '@/components/ui/reveal-content';
import { Switch } from '@/components/ui/switch';
import { ExportIcon } from '@/components/icons/export-icon';
import VotePoll from '@/components/vote/vote-details/vote-poll';
import VoteActions from '@/components/vote/vote-details/vote-outputs';
import VoterTable from '@/components/vote/vote-details/voter-table';
import { fadeInBottom } from '@/lib/framer-motion/fade-in-bottom';
import { useLayout } from '@/lib/hooks/use-layout';
import useWallet from '@/hooks/useWallet';
import { useModal } from '@/components/modal-views/context';
import { getApprovalSigs } from '@/services/tribe';
import { Proposal } from '@/types';
import { nostrPool } from '@/services/nostr';

function VoteActionButton({
  vote,
  privateKey,
  pubkey,
}: {
  vote: Proposal;
  privateKey: string;
  pubkey: string;
}) {
  const onApprove = async() => {
    const { inputs, outputs, bitpac, id } = vote;

    const allSigs = getApprovalSigs({
      inputs,
      outputs,
      seckey: privateKey,
      multisig: bitpac.pubkeys,
    });

    const reply = {
      content: JSON.stringify(allSigs),
      created_at: Math.floor(Date.now() / 1000),
      kind: 2860,
      tags: [['e', id]],
      pubkey: pubkey,
    };

   
    const signedEvent = await nostrPool.sign(reply, privateKey, pubkey);
    await nostrPool.publish(signedEvent);
  };

  const onDeny = async() => {
    const { id } = vote;

    const reply = {
      content: "",
      created_at: Math.floor(Date.now() / 1000),
      kind: 2860,
      tags: [['e', id]],
      pubkey: pubkey,
    };

   
    const signedEvent = await nostrPool.sign(reply, privateKey, pubkey);
    await nostrPool.publish(signedEvent);
  };

  return (
    <div className="mt-4 flex items-center gap-3 xs:mt-6 xs:inline-flex md:mt-10">
      <Button
        shape="rounded"
        color="success"
        className="flex-1 xs:flex-auto"
        onClick={onApprove}
      >
        Accept
      </Button>
      <Button shape="rounded" color="danger" className="flex-1 xs:flex-auto" onClick={onDeny}>
        Reject
      </Button>
    </div>
  );
}

// FIXME: need to add vote type
export default function VoteDetailsCard({ vote }: { vote: Proposal }) {
  const [isExpand, setIsExpand] = useState(false);
  const { privateKey, pubkey, nsec } = useWallet();
  console.log(" { privateKey, pubkey, nsec }",  { privateKey, pubkey, nsec })
  const { openModal } = useModal();

  const renderVotingActions = () => {
    if (privateKey) {
      return (
        <VoteActionButton vote={vote} privateKey={privateKey} pubkey={pubkey} />
      );
    }

    return (
      <div className="mt-4 flex items-center gap-3 xs:mt-6 xs:inline-flex md:mt-10">
        <Button
          onClick={() => openModal('WALLET_CONNECT_VIEW')}
          className={cn('shadow-main hover:shadow-large')}
        >
          CONNECT TO VOTE
        </Button>
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ borderRadius: 8 }}
      className={cn(
        'mb-3 rounded-lg bg-white p-5 transition-shadow duration-200 dark:bg-light-dark xs:p-6 xl:p-4',
        isExpand ? 'shadow-large' : 'shadow-card hover:shadow-large'
      )}
    >
      <motion.div
        layout
        className={cn(
          'flex w-full flex-col-reverse justify-between ',
          'md:grid md:grid-cols-3'
        )}
      >
        <div className="self-start md:col-span-2">
          <h3
            onClick={() => setIsExpand(!isExpand)}
            className="cursor-pointer text-base font-medium leading-normal dark:text-gray-100 2xl:text-lg"
          >
            {vote.title}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Proposal #{vote.id}
          </p>

          {/* show only when vote is active */}
          {vote.status === 'active' && (
            <>
              {!isExpand ? (
                <Button
                  onClick={() => setIsExpand(!isExpand)}
                  className="mt-4 w-full xs:mt-6 xs:w-auto md:mt-10"
                  shape="rounded"
                >
                  Vote Now
                </Button>
              ) : (
                renderVotingActions()
              )}
            </>
          )}

          {/* show only for past vote */}
          {vote.status === 'past' && (
            <time className="mt-4 block text-gray-400 xs:mt-6 md:mt-7">
              <span className="font-medium">Executed</span> at{' '}
              {dayjs(vote.executed_at).format('MMM DD, YYYY')}
            </time>
          )}
        </div>

        {/* switch toggle indicator for past vote */}
        {vote.status === 'past' && (
          <div className="mb-4 flex items-center gap-3 md:mb-0 md:items-start md:justify-end">
            <Switch
              checked={isExpand}
              onChange={setIsExpand}
              className="flex items-center gap-3 text-gray-400"
            >
              <span className="inline-flex text-xs font-medium uppercase sm:text-sm">
                Close
              </span>
              <div
                className={cn(
                  isExpand
                    ? 'bg-brand dark:bg-white'
                    : 'bg-gray-200 dark:bg-gray-700',
                  'relative inline-flex h-[22px] w-10 items-center rounded-full transition-colors duration-300'
                )}
              >
                <span
                  className={cn(
                    isExpand
                      ? 'bg-white ltr:translate-x-5 rtl:-translate-x-5 dark:bg-gray-700'
                      : 'bg-white ltr:translate-x-0.5 rtl:-translate-x-0.5 dark:bg-gray-200',
                    'inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform duration-200'
                  )}
                />
              </div>
              <span className="inline-flex text-xs font-medium uppercase sm:text-sm">
                View
              </span>
            </Switch>
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {isExpand && (
          <motion.div
            layout
            initial="exit"
            animate="enter"
            exit="exit"
            variants={fadeInBottom('easeIn', 0.25, 16)}
          >
            <div className="my-6 border-y border-dashed border-gray-200 py-6 text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <div>
                Votes required to pass:{' '}
                <p className="ml-1 inline-flex items-center gap-3 font-medium text-gray-900 dark:text-gray-100">
                  {vote.requiredVotesToPass}
                </p>
              </div>

              <div>
                Votes required to deny:{' '}
                <p className="ml-1 inline-flex items-center gap-3 font-medium text-gray-900 dark:text-gray-100">
                  {vote.requiredVotesToDeny}
                </p>
              </div>

              <div>
                Proposed by:{' '}
                <a
                  href={vote.proposed_by.link}
                  className="ml-1 inline-flex items-center gap-3 font-medium text-gray-900 hover:underline hover:opacity-90 focus:underline focus:opacity-90 dark:text-gray-100"
                >
                  {vote.proposed_by.id} <ExportIcon className="h-auto w-3" />
                </a>
              </div>
            </div>

            <VotePoll
              title={'Votes'}
              accepted={vote?.accepted}
              rejected={vote?.rejected}
            />
            <VoterTable votes={vote?.votes} />
            <RevealContent defaultHeight={250}>
              <h4 className="mb-6 uppercase dark:text-gray-100">Description</h4>
              <div
                className="dynamic-html grid gap-2 leading-relaxed text-gray-600 dark:text-gray-400"
                dangerouslySetInnerHTML={{ __html: vote.description }}
              />
            </RevealContent>
            {vote?.action?.lenght && (
              <RevealContent
                defaultHeight={320}
                className="mt-6 border-t border-dashed border-gray-200 pt-6 dark:border-gray-700"
              >
                <VoteActions title={'Outputs'} action={vote?.action} />
              </RevealContent>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
