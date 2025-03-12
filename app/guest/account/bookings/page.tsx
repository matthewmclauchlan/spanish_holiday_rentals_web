'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, config, getPropertyById, getImageUrl } from '../../../lib/appwrite';
import { Query, Models } from 'appwrite';
import Link from 'next/link';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/Table';
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '../../../components/Pagination';
import { ExtendedUser } from '../../../context/AuthContext';

interface Booking extends Models.Document {
  bookingReference: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  propertyId: string;
}

interface Property {
  $id: string;
  name: string;
  mainImage?: string;
}

interface BookingWithProperty extends Booking {
  property?: Property;
}

export default function BookingsPage() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [bookings, setBookings] = useState<BookingWithProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [total, setTotal] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserAndBookings() {
      try {
        const loggedInUser = await account.get();
        setUser(loggedInUser as ExtendedUser);

        const offset = (currentPage - 1) * pageSize;
        const response = await databases.listDocuments<Booking>(
          config.databaseId,
          config.bookingsCollectionId,
          [
            Query.equal('userId', loggedInUser.$id),
            Query.limit(pageSize),
            Query.offset(offset),
          ]
        );
        setTotal(response.total);

        const bookingsWithProperty: BookingWithProperty[] = await Promise.all(
          response.documents.map(async (booking) => {
            try {
              const propertyDoc = await getPropertyById(booking.propertyId);
              return {
                ...booking,
                property: propertyDoc ? (propertyDoc as unknown as Property) : undefined,
              } as BookingWithProperty;
            } catch {
              return booking as BookingWithProperty;
            }
          })
        );
        setBookings(bookingsWithProperty);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unable to load data.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndBookings();
  }, [currentPage]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Your Bookings</h1>
      {!user ? (
        <div>
          <p>You need to log in to view your bookings.</p>
          <Link href="/signin">Sign In</Link>
        </div>
      ) : bookings.length === 0 ? (
        <div>
          <p>No trips booked... yet!</p>
          <button
            onClick={() => router.push('/explore')}
            className="text-blue-600 hover:underline"
          >
            Start searching
          </button>
          <p>
            Can’t find your reservation here?{' '}
            <Link
              href="/help/how-to-get-started-with-spanish-holiday-rentals"
              className="text-blue-600 hover:underline"
            >
              Visit the Help Center
            </Link>
          </p>
        </div>
      ) : (
        <>
          <Table className="[--gutter:1.5rem]">
            <TableHead>
              <TableRow>
                <TableHeader>Property</TableHeader>
                <TableHeader>Booking Reference</TableHeader>
                <TableHeader>Payment</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.$id} href={`/guest/account/bookings/${booking.$id}`}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      {booking.property?.mainImage ? (
                        <Image
                          src={getImageUrl(booking.property.mainImage)}
                          alt={booking.property.name}
                          width={100}
                          height={100}
                          className="rounded-md"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
                      )}
                      <div className="font-medium text-gray-800 dark:text-white">
                        {booking.property?.name || "Unknown Property"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-800 dark:text-white">
                    {booking.bookingReference}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    €{booking.totalPrice.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination className="mt-6">
            <PaginationPrevious
              href={`?page=${currentPage - 1}`}
              disabled={currentPage === 1}
            >
              Prev
            </PaginationPrevious>
            <PaginationList>
              {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map((page) => (
                <PaginationPage
                  key={page}
                  href={`?page=${page}`}
                  current={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationPage>
              ))}
            </PaginationList>
            <PaginationNext
              href={`?page=${currentPage + 1}`}
              disabled={currentPage >= Math.ceil(total / pageSize)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </PaginationNext>
          </Pagination>
        </>
      )}
    </div>
  );
}
