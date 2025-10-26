"use client";

import { usePathname } from 'next/navigation';
import SideBar from './SideBar';

export default function ConditionalSideBar({ isSignIn, username }: { isSignIn: boolean, username: string }) {
  const pathname = usePathname();
  if (pathname === '/welcome') return null;
  return <SideBar isSignIn={isSignIn} username={username} />;
}