import routes from '@/config/routes';
import { HomeIcon } from '@/components/icons/home';
import { VoteIcon } from '@/components/icons/vote-icon';
import { PlusCircle } from '@/components/icons/plus-circle';
import { MenuItem } from '@/types';

export const defaultMenuItems: MenuItem[] = [
  {
    name: 'Home',
    icon: <HomeIcon />,
    href: routes.home,
  },
  {
    name: 'Vote',
    icon: <VoteIcon />,
    href: routes.vote,
    dropdownItems: [
      {
        name: 'Vote with tribe',
        href: routes.proposals,
      },
      {
        name: 'Create proposal',
        href: routes.createProposal,
      },
    ],
  },
  {
    name: 'Create Bitpac',
    icon: <PlusCircle />,
    href: routes.createTribe,
  },
];

// add about page or other
export const otherPagesMenuItems = [];
