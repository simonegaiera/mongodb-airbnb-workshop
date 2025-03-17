import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header >
      <nav className="container mx-auto pt-2 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
          <Link href={`${process.env.BASE_PATH}/`}><img
              className="h-9"
              src={`${process.env.BASE_PATH}/mongobnb.png`}
              alt="Company Logo"
            />
            </Link>

          </div>
          <div className="text-gray-900 text-sm font-semibold motion-preset-fade motion-duration-2000 motion-delay-[1000ms]">
            Stays
          </div>
          <div className="flex space-x-1">
            <Link href={`${process.env.BASE_PATH}/search`} className={`px-4 py-2 text-gray-900 rounded-md hover:bg-white/5 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]`}>
              Search
            </Link>
            <Link href={`${process.env.BASE_PATH}/leaderboard`} className={`px-4 py-2 text-gray-900 rounded-md hover:bg-white/5 motion-preset-fade motion-duration-2000 motion-delay-[1000ms]`}>
              Leaderboard
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
