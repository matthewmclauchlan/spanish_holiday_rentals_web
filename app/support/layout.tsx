'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

function SupportSidebar() {
  return (
    <aside className="w-full md:w-1/4 bg-gray-100 dark:bg-gray-800 p-4">
      <header className="mb-6">
        <Link href="/support">
          <div className="flex items-center gap-2 p-4 cursor-pointer">
            <Image
              src="/assets/icons/support-logo.png"
              alt="Support Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="font-bold text-lg">SHR Supportal</span>
          </div>
        </Link>
      </header>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link
              href="/support/conversations"
              className="block text-gray-800 dark:text-gray-200 hover:text-blue-600"
            >
              Conversations
            </Link>
          </li>
          <li>
            <Link
              href="/support/tickets"
              className="block text-gray-800 dark:text-gray-200 hover:text-blue-600"
            >
              Tickets
            </Link>
          </li>
          <li>
            <Link
              href="/support/analytics"
              className="block text-gray-800 dark:text-gray-200 hover:text-blue-600"
            >
              Analytics
            </Link>
          </li>
        </ul>
      </nav>
      <footer className="mt-8">
        <Link
          href="/support/settings"
          className="block text-gray-800 dark:text-gray-200 hover:text-blue-600"
        >
          Settings
        </Link>
      </footer>
    </aside>
  );
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <SupportSidebar />
        <main className="flex-1 p-4 bg-white dark:bg-gray-900">{children}</main>
      </div>
    </div>
  );
}
