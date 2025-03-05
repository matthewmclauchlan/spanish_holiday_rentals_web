// /app/components/Navbar.tsx
'use client';

import React from 'react';
import { Disclosure, Menu } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const guestNavigation = [
  { name: 'Home', href: '/guest/home' },
  { name: 'Explore', href: '/guest/explore' },
  { name: 'Profile', href: '/guest/profile' },
];

const hostNavigation = [
  { name: 'Dashboard', href: '/host/dashboard' },
  { name: 'Properties', href: '/host/properties' },
  { name: 'Bookings', href: '/host/bookings' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  // Determine if the user is a host by checking for a hostProfile.
  const isHost = user && user.hostProfile;

  // Choose navigation based on user role.
  const navigation = user ? (isHost ? hostNavigation : guestNavigation) : [];

  return (
    <Disclosure as="nav" className="bg-gray-800 relative z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon aria-hidden="true" className="block h-6 w-6" />
                  ) : (
                    <Bars3Icon aria-hidden="true" className="block h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex shrink-0 items-center">
                  <Link href="/">
                    <Image
                      alt="Spanish Holiday Rentals"
                      src="/assets/images/shr_logo.png"
                      width={32}
                      height={32}
                      className="h-8 w-auto"
                    />
                  </Link>
                </div>
                {user && (
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          aria-current={pathname === item.href ? 'page' : undefined}
                          className={classNames(
                            pathname === item.href
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="h-6 w-6" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none">
                      <span className="sr-only">Open user menu</span>
                      {/* Use a static avatar icon */}
                      <Image
                        alt="User avatar"
                        src="/assets/icons/avatar.png"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </Menu.Button>
                  </div>
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                    {user ? (
                      <>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/guest/profile"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/settings"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={signOut}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </>
                    ) : (
                      <>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/signin"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Sign In
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/signup"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Sign Up
                            </Link>
                          )}
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Items>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {user &&
                navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    href={item.href}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={classNames(
                      pathname === item.href
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
