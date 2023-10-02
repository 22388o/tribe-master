import { Suspense } from 'react';
import cn from 'classnames';
import ParamTab, { TabPanel } from '@/components/ui/param-tab';
import Loader from '@/components/ui/loader';
import CreateTribeTRForm from './create-tribe-form-tr';

const tabMenu = [
  {
    title: 'Nostr',
    path: 'nostr',
    disabled: false,
  },
  {
    title: 'Bitcoin TR Address',
    path: 'pubkeys',
    disabled: true,
  },
  {
    title: 'Ordinals',
    path: 'ordinals',
    disabled: true,
  },
];

export default function ProfileTab() {
  return (
    <Suspense fallback={<Loader variant="blink" />}>
      <ParamTab tabMenu={tabMenu}>
        <TabPanel className="focus:outline-none">
          <div
            className={cn(
              'grid gap-4 xs:grid-cols-2 lg:grid-cols-2 lg:gap-5 xl:gap-6 3xl:grid-cols-3 4xl:grid-cols-4',
              'md:grid-cols-1'
            )}
          >
            <CreateTribeTRForm />
          </div>
        </TabPanel>
        {/* Place holders for upcomming Nostr and ordinals tabs! */}
        <TabPanel className="focus:outline-none"></TabPanel>
        <TabPanel className="focus:outline-none"></TabPanel>
      </ParamTab>
    </Suspense>
  );
}
