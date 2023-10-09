'use client';

import Image from '@/components/ui/image';
import { StaticImageData } from 'next/image';
import QRCode from 'react-qr-code'; 
import CopyClipboard from './copy-clipboard';

type CoinCardProps = {
  id: string;
  name: string;
  symbol: string;
  logo: StaticImageData;
  balance: string;
  usdBalance: string;
  color?: string;
  address?: string;
};

export function CoinCard({
  name,
  symbol,
  logo,
  balance,
  usdBalance,
  address,
  color = '#FDEDD4',
}: CoinCardProps) {
  return (
    <div
      className="relative flex items-center justify-between rounded-lg p-6 xl:p-8"
      style={{ backgroundColor: color }}
    >
      <div>
        <h4 className="mb-8 text-sm font-medium uppercase tracking-wider text-gray-900">
          {name}
        </h4>
        <div className="relative h-20 lg:h-24 xl:h-28 3xl:h-36">
          <Image src={logo} alt={name} height={112} priority />
        </div>
        <div className="mb-2 mt-8 text-sm font-medium tracking-wider text-gray-900 lg:text-lg 2xl:text-xl 3xl:text-2xl">
          {balance}
          <span className="uppercase"> {symbol}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-medium 2xl:text-sm">
          <span className="tracking-wider text-gray-600">{usdBalance} USD</span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center text-xs font-medium 2xl:text-sm">
        
        <QRCode
          size={220}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          value={address ? address : ''}
          viewBox={`0 0 256 256`}
          bgColor={color}
        />
        {address && <div className='mt-6'><CopyClipboard text={address}></CopyClipboard></div>}
      </div>
    </div>
  );
}

interface CoinSliderProps {
  coins: CoinCardProps[];
}

export default function CoinSlider({ coins }: CoinSliderProps) {
  const sliderBreakPoints = {
    640: {
      slidesPerView: 1,
      spaceBetween: 20,
    },
    1024: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    1280: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    1536: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    1700: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    2200: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
  };

  return (
    <div>
      {coins.map((coin, index: number) => (
        <div key={index}>
          <CoinCard
            id={coin.id}
            name={'Treasury'}
            symbol={coin.symbol}
            logo={coin.logo}
            balance={coin.balance}
            usdBalance={coin.usdBalance}
            color={coin.color}
            address={coin.address}
          />
        </div>
      ))}
    </div>
  );
}
