import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'ProjectHub — Projects, Teams & Student Collaboration',
  description:
    'ProjectHub helps students who have skills or project ideas find suitable teammates for hackathons, competitions, and college projects.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen flex flex-col font-sans antialiased selection:bg-primary/30">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-12 py-10">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
