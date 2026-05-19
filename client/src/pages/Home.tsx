// Home.tsx — redirects to Executive Overview
import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Home() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation('/'); }, []);
  return null;
}
