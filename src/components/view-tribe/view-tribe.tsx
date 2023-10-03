'use client';

import CoinSlider from '@/components/ui/coin-card';
import TransactionTable from '@/components/transaction/transaction-table';
import VoteList from '@/components/vote/vote-list';
import MemberList from '@/components/members/members-list';
import { NostrTribe } from '@/types';
import BitcoinImage from '@/assets/images/coin/bitcoin.svg';
import {
  getNostrTagValue,
  shortenStr,
  satsToFormattedDollarString,
} from '@/utils/utils';
import useAddress from '@/hooks/useAddress';
import useBitcoinPrice from '@/hooks/useBitcoinPrice';

export default function ModernScreen({ tribe }: { tribe?: NostrTribe }) {
  const getAddress = () => {
    if (!tribe) {
      // TODO: REMOVE
      return 'tb1qp23xcmwrhwh8gu7jm6826xcfck7c8t00zgyypn';
    }

    return getNostrTagValue('a', tribe.tags) || '';
  };

  const address = getAddress();
  const { balance, sats } = useAddress(address);
  const { price } = useBitcoinPrice();

  const usdBalance = satsToFormattedDollarString(sats, price);

  const treasury = {
    id: '0',
    name: 'Bitcoin',
    symbol: 'BTC',
    balance,
    usdBalance,
    logo: BitcoinImage,
    color: '#FDEDD4',
    address: shortenStr(address),
  };

  return (
    <>
      <div className="flex flex-wrap">
        <div className="mb-8 w-full sm:mb-0 sm:w-1/2 sm:ltr:pr-6 sm:rtl:pl-6 md:w-[calc(100%-256px)] lg:w-[calc(100%-288px)] 2xl:w-[calc(100%-320px)] 3xl:w-[calc(100%-358px)]">
          {!!treasury && <CoinSlider coins={[treasury]} />}
        </div>
      </div>

      <div className="my-8 sm:my-10">
        <div className="rounded-tl-lg rounded-tr-lg bg-white px-4 pt-6 dark:bg-light-dark md:px-8 md:pt-8">
          <div className="flex flex-col items-center justify-between border-b border-dashed border-gray-200 pb-5 dark:border-gray-700 md:flex-row">
            <h2 className="mb-3 shrink-0 text-lg font-medium uppercase text-black dark:text-white sm:text-xl md:mb-0 md:text-2xl">
              Members
            </h2>
          </div>
        </div>

        <MemberList tribe={tribe} />
      </div>

      <div className="my-8 sm:my-10">
        <div className="rounded-tl-lg rounded-tr-lg bg-white px-4 pt-6 dark:bg-light-dark md:px-8 md:pt-8">
          <div className="flex flex-col items-center justify-between border-b border-dashed border-gray-200 pb-5 dark:border-gray-700 md:flex-row">
            <h2 className="mb-3 shrink-0 text-lg font-medium uppercase text-black dark:text-white sm:text-xl md:mb-0 md:text-2xl">
              Statements
            </h2>
          </div>
        </div>

        <VoteList voteStatus={'past'} />
      </div>

      <div className="my-8 sm:my-10">
        <TransactionTable />
      </div>
    </>
  );
}
