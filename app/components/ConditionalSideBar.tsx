"use client";

import { usePathname } from 'next/navigation';
import SideBar from './SideBar';

export default function ConditionalSideBar({ 
  isSignIn, 
  username,
  studentId,
  fullName
}: { 
  isSignIn: boolean; 
  username: string;
  studentId: string;
  fullName: string;
}) {
  const pathname = usePathname();
  
  // Ẩn sidebar ở trang welcome và login
  if (pathname === '/welcome' || pathname === '/login') {
    return null;
  }
  
  return <SideBar 
    isSignIn={isSignIn} 
    username={username}
    studentId={studentId}
    fullName={fullName}
  />;
}