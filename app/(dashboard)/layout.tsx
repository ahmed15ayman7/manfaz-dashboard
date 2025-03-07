'use client';

import { Topbar } from '@/components/dashboard/Topbar';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Providers } from '@/components/Providers';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-background p-4">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
} 