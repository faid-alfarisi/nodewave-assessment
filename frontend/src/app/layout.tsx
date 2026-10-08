import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'NodeWave — Enterprise Deliverables & Operational Backbone',
  description: 'Enterprise task management with state-based permissions, inter-task dependencies, and immutable audit logs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-[#50B1D2]/30 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
