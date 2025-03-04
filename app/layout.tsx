// /app/layout.tsx
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export const metadata = {
  title: "Spanish Holiday Rentals",
  description: "Airbnb-style app for Spanish holiday rentals and communities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Spanish Holiday Rentals</title>
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          {/* Wrapped children in a container to add margin/padding so content is not full screen */}
          <main className="flex-grow pb-20 container mx-auto px-4">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

