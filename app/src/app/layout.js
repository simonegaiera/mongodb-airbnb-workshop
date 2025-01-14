import * as React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/app/globals.css';

export default function RootLayout(props) {
  return (
    <html lang="en">
        <head>
          <link rel="shortcut icon" href={`${process.env.BASE_PATH}/favicon.ico`} />
        </head>
      <body className="min-h-screen flex flex-col vsc-initialized">
        <Header />
        <main className="flex-grow">
          {props.children}
        </main>
        <Footer />
      </body>
    </html>
  );
}