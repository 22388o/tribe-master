import ModernLayout from '@/layouts/modern/layout';

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ModernLayout>{children}</ModernLayout>;
}
