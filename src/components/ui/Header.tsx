'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LiveClock from './LiveClock';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: 'INDEX', path: '/' },
    { label: 'SCANNER', path: '/scanner' },
    { label: 'MAP', path: '/map' },
    { label: 'PASSPORT', path: '/passport' },
    { label: 'EVIDENCE', path: '/evidence' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F4F2EC]/95 border-b-2 border-black px-6 py-5 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider select-none shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-1 hover:opacity-85 transition-opacity">
          <span className="font-extrabold tracking-widest text-sm text-[#050505]">LEAKMAP</span>
          <span className="text-[#3B00FF] text-lg leading-none select-none">•</span>
        </Link>
      </div>

      <nav className="hidden lg:flex items-center gap-8">
        {navItems.map((item) => {
          // Exact path matching
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative py-1 flex items-center gap-1 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-[#050505] font-black opacity-100'
                  : 'text-[#77776F] font-bold opacity-75 hover:text-[#050505] hover:opacity-100'
              }`}
            >
              <span>↳ {item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#3B00FF] rounded-full inline-block animate-pulse shrink-0" />
              )}
              {/* Underline slide-in effect */}
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#3B00FF] transition-transform duration-200 origin-left ${
                isActive ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
              }`} />
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4 text-black">
        <div className="hidden sm:block text-[10px] text-[#77776F] font-semibold tracking-wide">
          DR_LOC: IN // LAT 20.59N LON 78.96E
        </div>
        <div className="font-bold border-2 border-black px-3 py-1 bg-white shadow-[2px_2px_0px_#050505]">
          <LiveClock />
        </div>
      </div>
    </header>
  );
}
