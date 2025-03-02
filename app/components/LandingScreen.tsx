// /app/components/LandingScreen.tsx
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingScreen() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/images/hero.png"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Hero content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold drop-shadow-lg">
            Discover Your Perfect Holiday Home
          </h1>
          <p className="mt-4 text-xl md:text-2xl max-w-2xl mx-auto drop-shadow">
            Book unique properties with ease—whether on the web or our native app.
          </p>
          <div className="mt-8 flex space-x-4">
            <Link
              href="/signup"
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition"
            >
              Get Started
            </Link>
            {/* Simple Log In button for testing navigation */}
            <Link
              href="/signin"
              className="inline-block bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
            Why Choose Spanish Holiday Rentals?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow">
              <Image
                src="/assets/images/feature1.png"
                alt="Curated Listings"
                width={400}
                height={250}
                className="rounded-md"
              />
              <h3 className="mt-4 text-2xl font-semibold text-gray-800">
                Curated Listings
              </h3>
              <p className="mt-2 text-gray-600">
                Hand-picked holiday homes tailored to your needs.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <Image
                src="/assets/images/feature2.png"
                alt="Easy Booking"
                width={400}
                height={250}
                className="rounded-md"
              />
              <h3 className="mt-4 text-2xl font-semibold text-gray-800">
                Easy Booking
              </h3>
              <p className="mt-2 text-gray-600">
                A seamless booking experience for your convenience.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <Image
                src="/assets/images/feature3.png"
                alt="Secure Payments"
                width={400}
                height={250}
                className="rounded-md"
              />
              <h3 className="mt-4 text-2xl font-semibold text-gray-800">
                Secure Payments
              </h3>
              <p className="mt-2 text-gray-600">
                Safe and secure payment options for peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Ready to start your dream vacation?
          </h2>
          <Link
            href="/signup"
            className="inline-block bg-orange-500 text-white px-8 py-4 rounded-full text-xl font-semibold hover:bg-orange-600 transition"
          >
            Sign Up Today
          </Link>
        </div>
      </section>
    </div>
  );
}
