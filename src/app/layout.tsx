import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Beauty Formula Calculator',
  description: 'Calculate and manage your beauty product formulations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {/* Remove the top navigation bar */}
          {/* <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-8">
                  <a href="/" className="text-gray-900 hover:text-purple-600">Overview</a>
                  <a href="/materials" className="text-gray-900 hover:text-purple-600">Materials</a>
                  <a href="/recipes" className="text-gray-900 hover:text-purple-600">Recipes</a>
                  <a href="/labels" className="text-gray-900 hover:text-purple-600">Labels</a>
                  <a href="/analytics" className="text-gray-900 hover:text-purple-600">Analytics</a>
                  <a href="/history" className="text-gray-900 hover:text-purple-600">History</a>
                  <a href="/inventory" className="text-gray-900 hover:text-purple-600">Inventory</a>
                  <a href="/pricing" className="text-gray-900 hover:text-purple-600">Pricing</a>
                </div>
              </div>
            </div>
          </nav> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
