'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, databases, config, getPropertyById, getImageUrl } from "../../../lib/appwrite";
import { Query, Models } from "appwrite";
import Link from "next/link";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/Table";
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from "../../../components/Pagination";
import { ExtendedUser } from "../../../context/AuthContext";

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
            Query.equal("userId", loggedInUser.$id),
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
          setError("Unable to load data.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndBookings();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {`Error: ${error}`}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 p-4 text-white">
        Your Bookings
      </h1>
      {!user ? (
        <div className="p-4">
          <p className="text-white">
            You need to log in to view your bookings.
          </p>
          <Link href="/signin" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-4">
          <p className="text-white">No trips booked... yet!</p>
          <button
            onClick={() => router.push("/explore")}
            className="text-blue-500 hover:underline"
          >
            Start searching
          </button>
          <p className="text-white">
            Can’t find your reservation here?{" "}
            <Link
              href="/help/how-to-get-started-with-spanish-holiday-rentals"
              className="text-blue-500 hover:underline"
            >
              Visit the Help Center
            </Link>
          </p>
        </div>
      ) : (
        <>
          {/* Table rendered directly on the page with horizontal white lines for row separation */}
          <div className="overflow-x-auto p-4">
            <Table className="w-full">
              <TableHead>
                <TableRow className="border-b border-white">
                  <TableHeader className="text-white">Property</TableHeader>
                  <TableHeader className="text-white">Booking Reference</TableHeader>
                  <TableHeader className="text-white">Payment</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow
                    key={booking.$id}
                    href={`/guest/account/bookings/${booking.$id}`}
                    className="transition-colors hover:bg-blue-600 hover:text-white cursor-pointer border-b border-white"
                  >
                    <TableCell className="text-white">
                      <div className="flex items-center gap-4">
                        {booking.property?.mainImage ? (
                          <Image
                            src={getImageUrl(booking.property.mainImage)}
                            alt={booking.property.name}
                            width={100}
                            height={100}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
                        )}
                        <div className="font-medium">
                          {booking.property?.name || "Unknown Property"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {booking.bookingReference}
                    </TableCell>
                    <TableCell className="text-white">
                      €{booking.totalPrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination directly below the table */}
          <div className="p-4">
            <Pagination className="mt-6 flex items-center gap-2">
              <PaginationPrevious
                href={`?page=${currentPage - 1}`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="bg-blue-600 border border-blue-700 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Prev
              </PaginationPrevious>

              <PaginationList className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map((page) => (
                  <PaginationPage
                    key={page}
                    href={`?page=${page}`}
                    current={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded transition-colors ${
                      page === currentPage
                        ? "bg-blue-700 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {page}
                  </PaginationPage>
                ))}
              </PaginationList>

              <PaginationNext
                href={`?page=${currentPage + 1}`}
                disabled={currentPage >= Math.ceil(total / pageSize)}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(total / pageSize)))
                }
                className="bg-blue-600 border border-blue-700 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Next
              </PaginationNext>
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
}
