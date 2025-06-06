import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
import Navigation from '@/components/layout/navigation';

export const metadata: Metadata = {
  title: 'HRMS - Human Resource Management System',
  description: 'Modern HR management solution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <AuthProvider>
          <Navigation>{children}</Navigation>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
