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
    <header className="bg-white">
      {/* Top section with logo and user info */}
      <div className="container mx-auto px-4 py-4 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
        <div className="flex items-center justify-center space-x-4">
          <Link href={`/`} className="flex items-center space-x-3">
            <img
              className="h-12 w-auto"
              src={`${process.env.BASE_PATH}/mongobnb.png`}
              alt="Company Logo"
            />
          </Link>
          
          <div className="flex items-center gap-3 bg-pink-50 px-4 py-2 rounded-full motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgb(255, 56, 92)'}}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-semibold" style={{color: 'rgb(200, 45, 75)'}}>
              Welcome, {username}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar section */}
      <div className="mb-6">
        <div className="container mx-auto px-4">
          <nav className="bg-gray-200 rounded-lg flex items-center justify-center space-x-1">
            <Link 
              href={`/`} 
              className="px-6 py-3 text-gray-700 font-medium rounded-t-lg hover:bg-gray-300 transition-colors duration-200 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]"
            >
              🏠 Home
            </Link>
            <Link 
              href={`/search`} 
              className="px-6 py-3 text-gray-700 font-medium rounded-t-lg hover:bg-gray-300 transition-colors duration-200 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]"
            >
              🔍 Search
            </Link>
            <Link 
              href={`/chatbot`} 
              className="px-6 py-3 text-gray-700 font-medium rounded-t-lg hover:bg-gray-300 transition-colors duration-200 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]"
            >
              💬 Chatbot
            </Link>
            <Link 
              href={`/leaderboard`} 
              className="px-6 py-3 text-gray-700 font-medium rounded-t-lg hover:bg-gray-300 transition-colors duration-200 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]"
            >
              🏆 Leaderboard
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
