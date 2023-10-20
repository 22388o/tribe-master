'use client';

import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useIsDarkMode } from '@/lib/hooks/use-is-dark-mode';
import { useLayout } from '@/lib/hooks/use-layout';
import lightLogo from '@/assets/images/tribeLogo-orange.png';
import lightTextLogo from '@/assets/images/tribeTextLogo-orange.png';
import darkLogo from '@/assets/images/tribeLogo-white.png';
import darkTextLogo from '@/assets/images/tribeTextLogo-white.png';

import routes from '@/config/routes';
import { LAYOUT_OPTIONS } from '@/lib/constants';
import cn from 'classnames';

interface LogoPropTypes {
  className?: string;
}

export default function Logo({ className }: LogoPropTypes) {
  const { layout } = useLayout();
  const isMounted = useIsMounted();
  const { isDarkMode } = useIsDarkMode();
  return (
    isMounted && (
      <AnchorLink
        href={{
          pathname: routes.home,
        }}
        className={cn('flex w-28 outline-none sm:w-32 4xl:w-36', className)}
      >
        <span className="relative flex overflow-hidden">
          {isDarkMode && (
            <div>
              <Image
                src={darkLogo}
                alt="Tribe"
                height={62}
                // style={{ filter: 'brightness(0)' }}
                priority
              />
              <Image 
                src={darkTextLogo} 
                alt="Tribe" 
                priority 
                width={62}
                // style={{ filter: 'brightness(0)' }} 
                />
            </div>
          )}
          {!isDarkMode && (
            <div>
              <Image
                src={lightLogo}
                alt="Tribe"
                height={62}
                priority
                style={{ filter: 'brightness(0)' }}
              />
               <Image 
                src={lightTextLogo} 
                alt="Tribe" 
                priority 
                width={62}
                style={{ filter: 'brightness(0)' }} />
            </div>
          )}
        </span>
      </AnchorLink>
    )
  );
}
