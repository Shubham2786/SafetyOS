import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SafetyOS — AI Copilot Workspace',
  description: 'Multi-Agent Reasoning & RAG Knowledge Intelligence Surface',
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
