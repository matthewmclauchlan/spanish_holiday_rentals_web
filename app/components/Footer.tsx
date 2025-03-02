"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-8 text-center">
        <p className="text-sm text-gray-600">
          &copy; {new Date().getFullYear()} Spanish Rentals. All rights reserved.
        </p>
        <div className="mt-4 space-x-6">
          <Link href="/about" className="text-sm text-gray-600 hover:text-orange-500 transition">
            About
          </Link>
          <Link href="/terms" className="text-sm text-gray-600 hover:text-orange-500 transition">
            Terms
          </Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-orange-500 transition">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
