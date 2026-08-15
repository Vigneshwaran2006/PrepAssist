import type { Metadata } from 'next';
import './globals.css';
import AuthInitializer from '@/components/auth/AuthInitializer';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmProvider } from '@/components/ui/ConfirmProvider';

export const metadata: Metadata = {
  title: 'PrepAssist — AI-Powered Placement Preparation',
  description:
    'AI-powered placement preparation platform for campus and off-campus recruitment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          <ConfirmProvider>
            <AuthInitializer />
            {children}
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}