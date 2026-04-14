'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-6xl mx-auto glass px-6 py-3 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Wallet className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Wallet<span className="text-primary">X</span>
          </span>
        </div>
        
        <div className="flex gap-4 sm:gap-8">
          <Link 
            href="/" 
            className={`flex items-center gap-2 transition-colors ${pathname === '/' ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link 
            href="/admin" 
            className={`flex items-center gap-2 transition-colors ${pathname === '/admin' ? 'text-primary' : 'text-foreground/70 hover:text-foreground'}`}
          >
            <ShieldCheck size={18} />
            <span className="text-sm font-medium">Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
