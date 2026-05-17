import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';
import { AuthProvider } from '../components/auth/AuthProvider';

export const metadata: Metadata = {
  title: "FreshTrack — Smart Food Expiry Tracker",
  description: "Track and manage your kitchen inventory with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster position="top-right" richColors />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

