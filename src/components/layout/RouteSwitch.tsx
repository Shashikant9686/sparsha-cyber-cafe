'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Renders adminContent on any /admin route, publicContent everywhere else.
 * Used in layout.tsx to show the frozen Header/FooterLegacy on admin pages
 * while the public site gets the redesigned Header/Footer.
 */
export default function RouteSwitch({
  adminContent,
  publicContent,
}: {
  adminContent: ReactNode;
  publicContent: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  return isAdmin ? adminContent : publicContent;
}