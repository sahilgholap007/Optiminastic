import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'WalletX - Premium Transaction System',
  description: 'Manage your client wallets and orders with ease.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
