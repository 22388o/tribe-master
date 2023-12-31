import Image from '@/components/ui/image';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useIsDarkMode } from '@/lib/hooks/use-is-dark-mode';
import lightLogo from '@/assets/images/tribeLogo-orange.png';
import lightTextLogo from '@/assets/images/tribeTextLogo-orange.png';
import darkLogo from '@/assets/images/tribeLogo-white.png';
import darkTextLogo from '@/assets/images/tribeTextLogo-white.png';

const Logo: React.FC<React.SVGAttributes<{}>> = (props) => {
  const isMounted = useIsMounted();
  const { isDarkMode } = useIsDarkMode();

  return (
    <div className="flex cursor-pointer outline-none" {...props}>
      <span className="relative flex overflow-hidden">
        {isMounted && isDarkMode && (
          <div>
            <Image src={darkLogo} alt="Tribe" priority width={28} />
            <Image src={darkTextLogo} alt="Tribe" priority width={28} />
          </div>
        )}
        {isMounted && !isDarkMode && (
          <div>
            <Image src={lightLogo} alt="Tribe" priority width={28} />
            <Image src={lightTextLogo} alt="Tribe" priority width={28} />
          </div>
        )}
      </span>
    </div>
  );
};
``;

export default Logo;
