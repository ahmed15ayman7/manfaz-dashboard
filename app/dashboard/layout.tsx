'use client';

import { Topbar } from '@/components/dashboard/topbar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Providers } from '@/components/providers';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex h-screen overflow-hidden w-[100vw]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden w-[calc(100%-280px)] mr-[280px]">
          <Topbar onDrawerToggle={() => { }} />
          <main className="flex-1 overflow-y-auto bg-background p-4">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
} 