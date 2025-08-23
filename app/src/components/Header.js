'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Header = () => {
  const [username, setUsername] = useState('Server Connection Error');

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
            <Link href={`/`}>
              <img
                className="h-9"
                src={`${process.env.BASE_PATH}/mongobnb.png`}
                alt="Company Logo"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm text-blue-700 font-medium">
              {username}
            </span>
          </div>

          <div className="flex space-x-1">
            <Link href={`/`} className="px-4 py-2 text-gray-900 rounded-md hover:bg-white/5 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
              Home
            </Link>
            <Link href={`/search`} className="px-4 py-2 text-gray-900 rounded-md hover:bg-white/5 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
              Search
            </Link>
            <Link href={`/chatbot`} className="px-4 py-2 text-gray-900 rounded-md hover:bg-white/5 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
              Chatbot
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
