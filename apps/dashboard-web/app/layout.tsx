import type { Metadata } from 'next';
import '@safetyos/design-tokens/css';
import './globals.css';
import { AppShell } from '../components/layout/app-shell';

export const metadata: Metadata = {
  title: 'SafetyOS — Command Console',
  description: 'Enterprise-grade AI-powered Industrial Safety Intelligence Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
