'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Header = () => {
  const [username, setUsername] = useState('Stays');

  useEffect(() => {
    fetch(`${process.env.BASE_URL}/api/results/whoami`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUsername(data.name);
      })
      .catch(error => {
        console.error('Error fetching username:', error);
        // fallback remains "Stays"
      });
  }, []);

  return (
    <header>
      <nav className="container mx-auto pt-2 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={`${process.env.BASE_PATH}/`}>
              <img
                className="h-9"
                src={`${process.env.BASE_PATH}/mongobnb.png`}
                alt="Company Logo"
              />
            </Link>
          </div>

          <div className="text-gray-900 text-sm font-semibold motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
            {username}
          </div>

          <div className="flex space-x-1">
            <Link href={`/`} className="px-4 py-2 text-gray-900 rounded-md hover:bg-white/5 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
              Home
            </Link>
            <Link href={`/search`} className="px-4 py-2 text-gray-900 rounded-md hover:bg-white/5 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
              Search
            </Link>
            <Link href={`/leaderboard`} className="px-4 py-2 text-gray-900 rounded-md hover:bg-white/5 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
              Leaderboard
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
