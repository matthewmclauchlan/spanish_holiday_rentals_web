"use client";

import React from "react";
import Link from "next/link";

// Container for the entire Pagination control group
interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export function Pagination({ children, className, ...props }: PaginationProps) {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
}

// Container for multiple page links
interface PaginationListProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}
export function PaginationList({ children, className, ...props }: PaginationListProps) {
  return (
    <ul className={`flex items-center gap-1 ${className ?? ""}`} {...props}>
      {children}
    </ul>
  );
}

// Single page link with next/link
interface PaginationPageProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  current?: boolean;
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}
export function PaginationPage({
  current,
  href,
  children,
  className,
  onClick,
  ...props
}: PaginationPageProps) {
  return (
    <li>
      <Link href={href} legacyBehavior>
        <a
          onClick={onClick}
          {...props}
          className={`
            px-3 py-1 rounded transition-colors
            ${
              current
                ? // Current page
                  "bg-blue-700 text-white"
                : // Other pages
                  "bg-blue-600 text-white hover:bg-blue-700"
            }
            ${className ?? ""}
          `}
        >
          {children}
        </a>
      </Link>
    </li>
  );
}

// Shared control for Prev/Next
interface PaginationControlProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
function PaginationControl({
  href,
  disabled,
  children,
  onClick,
  className,
  ...props
}: PaginationControlProps) {
  if (disabled) {
    // Disabled style
    return (
      <span
        className={`
          px-3 py-1 rounded transition-colors
          bg-blue-600 text-white opacity-50 pointer-events-none
          ${className ?? ""}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
  // Enabled style
  return (
    <Link href={href} legacyBehavior>
      <a
        onClick={onClick}
        className={`
          px-3 py-1 rounded transition-colors
          bg-blue-600 text-white hover:bg-blue-700
          ${className ?? ""}
        `}
        {...props}
      >
        {children}
      </a>
    </Link>
  );
}

// Prev button
export function PaginationPrevious({ href, disabled, onClick, className, ...props }: PaginationControlProps) {
  return (
    <PaginationControl href={href} disabled={disabled} onClick={onClick} className={className} {...props}>
      Prev
    </PaginationControl>
  );
}

// Next button
export function PaginationNext({ href, disabled, onClick, className, ...props }: PaginationControlProps) {
  return (
    <PaginationControl href={href} disabled={disabled} onClick={onClick} className={className} {...props}>
      Next
    </PaginationControl>
  );
}

// Optional gap indicator e.g. 1 ... 5
export function PaginationGap() {
  return <span className="px-3 py-1 text-gray-300">…</span>;
}
