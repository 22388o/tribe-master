'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import cn from 'classnames';
import routes from '@/config/routes';
import Button from '@/components/ui/button';
import Image from '@/components/ui/image';
import ParamTab, { TabPanel } from '@/components/ui/param-tab';
import VoteList from '@/components/vote/vote-list';
import { ExportIcon } from '@/components/icons/export-icon';
// static data
import { getVotesByStatus } from '@/data/static/vote-data';
import votePool from '@/assets/images/vote-pool.svg';
import { useLayout } from '@/lib/hooks/use-layout';
import { LAYOUT_OPTIONS } from '@/lib/constants';
import Loader from '@/components/ui/loader';

const ProposalsPage = () => {
  const router = useRouter();
  const { layout } = useLayout();
  const { totalVote: totalActiveVote } = getVotesByStatus('active');
  const { totalVote: totalOffChainVote } = getVotesByStatus('off-chain');
  const { totalVote: totalExecutableVote } = getVotesByStatus('executable');
  const { totalVote: totalPastVote } = getVotesByStatus('past');
  function goToCreateProposalPage() {
    setTimeout(() => {
      router.push(
          routes.createProposal
      );
    }, 800);
  }
  const tabMenuItems = [
    {
      title: (
        <>
          Active{' '}
          {totalActiveVote > 0 && (
            <span className="ltr:ml-0.5 rtl:mr-0.5 ltr:md:ml-1.5 rtl:md:mr-1.5 ltr:lg:ml-2 rtl:lg:mr-2">
              {totalActiveVote}
            </span>
          )}
        </>
      ),
      path: 'active',
    },

    {
      title: (
        <>
          Past{' '}
          {totalPastVote > 0 && (
            <span className="ltr:ml-0.5 rtl:mr-0.5 ltr:md:ml-1.5 rtl:md:mr-1.5 ltr:lg:ml-2 rtl:lg:mr-2">
              {totalPastVote}
            </span>
          )}
        </>
      ),
      path: 'past',
    },
  ];
  return (
    <section className="mx-auto w-full max-w-[1160px] text-sm ">
      <header
        className={cn(
          'mb-8 flex flex-col gap-4 rounded-lg bg-white p-5 py-6 shadow-card dark:bg-light-dark xs:p-6 sm:flex-row sm:items-center sm:justify-between',
            'sm:flex-row sm:items-center sm:justify-between'
        )}
      >
        <div className="flex items-start gap-4 xs:items-center xs:gap-3 xl:gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-dark">
            <Image alt="Vote Pool" src={votePool} width={32} height={32} />
          </div>
          <div>
            <h2 className="mb-2 text-base font-medium uppercase dark:text-gray-100 xl:text-lg">
              Tribe
            </h2>
            <p className="leading-relaxed text-gray-600 dark:text-gray-400">
              You are part of the tribe, and you can create proposals.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <Button
            shape="rounded"
            fullWidth={true}
            className="uppercase"
            onClick={() => goToCreateProposalPage()}
          >
            Create Proposal
          </Button>
        </div>
      </header>

      <Suspense fallback={<Loader variant="blink" />}>
        <ParamTab tabMenu={tabMenuItems}>
          <TabPanel className="focus:outline-none">
            <VoteList voteStatus={'active'} />
          </TabPanel>

          <TabPanel className="focus:outline-none">
            <VoteList voteStatus={'past'} />
          </TabPanel>
        </ParamTab>
      </Suspense>
    </section>
  );
};

export default ProposalsPage;
