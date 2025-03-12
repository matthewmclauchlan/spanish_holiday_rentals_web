import React from 'react';
import Link from 'next/link';

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Pagination({ children, className, ...props }: PaginationProps) {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

interface PaginationListProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}

export function PaginationList({ children, className, ...props }: PaginationListProps) {
  return (
    <ul className={`flex items-center space-x-1 ${className || ''}`} {...props}>
      {children}
    </ul>
  );
}

interface PaginationPageProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  current?: boolean;
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function PaginationPage({ current, href, children, className, onClick, ...props }: PaginationPageProps) {
  return (
    <li>
      <Link href={href} legacyBehavior>
        <a
          onClick={onClick}
          {...props}
          className={`px-3 py-1 rounded transition ${
            current ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } ${className || ''}`}
        >
          {children}
        </a>
      </Link>
    </li>
  );
}

interface PaginationControlProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function PaginationControl({ href, disabled, children, onClick, className, ...props }: PaginationControlProps) {
  if (disabled) {
    return (
      <span className={`px-3 py-1 rounded bg-gray-200 text-gray-400 ${className || ''}`} {...props}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} legacyBehavior>
      <a
        onClick={onClick}
        {...props}
        className={`px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 ${className || ''}`}
      >
        {children}
      </a>
    </Link>
  );
}

export function PaginationPrevious({ href, disabled, onClick, className, ...props }: PaginationControlProps) {
  return (
    <PaginationControl href={href} disabled={disabled} onClick={onClick} className={className} {...props}>
      Prev
    </PaginationControl>
  );
}

export function PaginationNext({ href, disabled, onClick, className, ...props }: PaginationControlProps) {
  return (
    <PaginationControl href={href} disabled={disabled} onClick={onClick} className={className} {...props}>
      Next
    </PaginationControl>
  );
}

export function PaginationGap() {
  return <span className="px-3 py-1">…</span>;
}
