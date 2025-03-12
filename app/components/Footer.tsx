'use client';
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-gray-50 border-t border-gray-200 py-4 dark:bg-gray-900 dark:border-gray-700">
      <div className="container mx-auto px-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} Spanish Rentals. All rights reserved.
        </p>
        <div className="mt-4 space-x-6">
          <Link href="/about" className="text-sm text-gray-600 hover:text-orange-500 transition dark:text-gray-300 dark:hover:text-orange-400">
            About
          </Link>
          <Link href="/terms" className="text-sm text-gray-600 hover:text-orange-500 transition dark:text-gray-300 dark:hover:text-orange-400">
            Terms
          </Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-orange-500 transition dark:text-gray-300 dark:hover:text-orange-400">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
