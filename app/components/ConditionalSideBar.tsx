"use client";

import { usePathname } from 'next/navigation';
import SideBar from './SideBar';

export default function ConditionalSideBar({ 
  isSignIn, 
  username,
  studentId,
  fullName,
  welcomeEnabled = true
}: { 
  isSignIn: boolean; 
  username: string;
  studentId: string;
  fullName: string;
  welcomeEnabled?: boolean;
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
    welcomeEnabled={welcomeEnabled}
  />;
}