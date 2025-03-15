"use client";

import React from "react";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <table
      className={`w-full border-collapse ${className ?? ""}`}
      {...props}
    >
      {children}
    </table>
  );
}

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableHead({ children, className, ...props }: TableHeadProps) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableHeader({ children, className, ...props }: TableHeaderProps) {
  return (
    <th
      className={`px-4 py-2 font-semibold text-left border-b border-gray-200 dark:border-gray-700 ${className ?? ""}`}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  href?: string;
}

/**
 * If you want row hover styles (like bg-blue-600 text-white), 
 * pass them via `className` on TableRow.
 * For example:
 * <TableRow className="transition-colors hover:bg-blue-600 hover:text-white" ...>
 */
export function TableRow({ children, href, className, ...props }: TableRowProps) {
  const handleClick = () => {
    if (href) window.location.href = href;
  };

  return (
    <tr
      onClick={href ? handleClick : undefined}
      // Removed default hover styling so you can pass your own in className
      className={`cursor-pointer ${className ?? ""}`}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td
      className={`px-4 py-2 border-b border-gray-200 dark:border-gray-700 ${className ?? ""}`}
      {...props}
    >
      {children}
    </td>
  );
}
