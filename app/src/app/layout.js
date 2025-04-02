'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

function RouteHandler() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // If we're accessing a direct URL, ensure the router initializes correctly
    if (window.location.pathname.startsWith(`${process.env.BASE_PATH}/`)) {
      const route = window.location.pathname.replace(process.env.BASE_PATH, '');
      if (route !== pathname) {
        router.push(route || '/');
      }
    }
  }, [pathname, router]);
  
  return null;
}

export default function RootLayout(props) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href={`${process.env.BASE_PATH}/favicon.ico`} />
      </head>
      <body className="min-h-screen flex flex-col vsc-initialized">
        <RouteHandler />
        <Header />
        <main className="flex-grow">
          {props.children}
        </main>
        <Footer />
      </body>
    </html>
  );
}