import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <table className={`w-full border-collapse ${className || ''}`} {...props}>
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
      className={`px-4 py-2 font-semibold text-left border-b border-gray-200 ${className || ''}`}
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

export function TableRow({ children, href, className, ...props }: TableRowProps) {
  const handleClick = () => {
    if (href) window.location.href = href;
  };

  return (
    <tr
      onClick={href ? handleClick : undefined}
      className={`cursor-pointer hover:bg-gray-50 ${className || ''}`}
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
    <td className={`px-4 py-2 border-b border-gray-200 ${className || ''}`} {...props}>
      {children}
    </td>
  );
}
