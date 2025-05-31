"use client";
import { usePathname } from 'next/navigation';

import Navbar from '@/components/Navbar'; // Adjust path accordingly

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const hideNavbar = pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
}
