import type { Metadata } from 'next';
import '@safetyos/design-tokens/css';
import './globals.css';

export const metadata: Metadata = {
  title: 'SafetyOS — Admin & Security Control Console',
  description: 'Enterprise Tenant Provisioning, OPA Security Policies, and System Governance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0B0D] text-[#E4E7ED] min-h-screen">
        {children}
      </body>
    </html>
  );
}
