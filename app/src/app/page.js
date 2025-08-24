'use client';

import dynamic from 'next/dynamic';
import React, { useState, useRef, useEffect } from 'react';
import ListingAndReviews from '@/components/ListingAndReviews';
import Filters from '@/components/Filters';
import ListingStatistics from '@/components/ListingStatistics';

const ListingAndReviewsMap = dynamic(
  () => import('@/components/ListingAndReviewsMap'),
  { ssr: false }
);

export default function Home() {
  const [selectedFacets, setSelectedFacets] = useState({
    amenities: [],
    propertyType: "",
    beds: ""
  });
  const [listShown, setListShown] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(true);
  const [isCheckingServer, setIsCheckingServer] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleListMap = () => setListShown(!listShown);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // Check server connectivity on component mount
  useEffect(() => {
    const checkServerConnectivity = async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL}/api/results/whoami`);
        if (!response.ok) {
          throw new Error('Server not responding');
        }
        await response.json();
        setServerAvailable(true);
      } catch (error) {
        console.error('Server connectivity check failed:', error);
        setServerAvailable(false);
      } finally {
        setIsCheckingServer(false);
      }
    };

    checkServerConnectivity();
  }, []);


  // Show loading state while checking server
  if (isCheckingServer) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking server connectivity...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error banner if server is not available
  if (!serverAvailable) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-8 rounded-lg mb-8 mx-4 mt-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Server Connection Error</h2>
              <p className="text-lg mb-4">
                Unable to connect to the server.<br />
                Please open <b>VS Code</b> and start the server to continue.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex gap-6">
        {/* Left Sidebar for Filters */}
        <div className={`${sidebarCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 bg-white border border-gray-200 rounded-lg shadow-sm h-fit sticky top-4`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" 
                  style={{display: "block", fill: "none", height: "18px", width: "18px", stroke: "currentColor", strokeWidth: 2, overflow: "visible"}}
                  aria-hidden="true" role="presentation" focusable="false">
                  <path fill="none" d="M7 16H3m26 0H15M29 6h-4m-8 0H3m26 20h-4M7 16a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM17 6a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm0 20a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm0 0H3"></path>
                </svg>
                Filters
              </h2>
            )}
            <button 
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              )}
            </button>
          </div>

          {/* Sidebar Content */}
          {!sidebarCollapsed && (
            <div className="max-h-[80vh] overflow-y-auto">
              <Filters
                selectedFacets={selectedFacets}
                setSelectedFacets={setSelectedFacets}
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toggle Buttons */}
          <div className="mb-4">
            <button 
              onClick={toggleListMap}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-20 px-5 py-3.5 rounded-3xl flex items-center gap-2 bg-[#222222] text-white hover:scale-105 transition-transform text-sm"
            >
              {listShown ? (
                <div className="flex items-center gap-2">
                  Show map
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 32 32" 
                    aria-hidden="true" 
                    role="presentation" 
                    focusable="false" 
                    style={{display: "block", height: "16px", width: "16px", fill: "white"}}
                  >
                    <path d="M31.25 3.75a2.29 2.29 0 0 0-1.01-1.44A2.29 2.29 0 0 0 28.5 2L21 3.67l-10-2L2.5 3.56A2.29 2.29 0 0 0 .7 5.8v21.95a2.28 2.28 0 0 0 1.06 1.94A2.29 2.29 0 0 0 3.5 30L11 28.33l10 2 8.49-1.89a2.29 2.29 0 0 0 1.8-2.24V4.25a2.3 2.3 0 0 0-.06-.5zM12.5 25.98l-1.51-.3L9.5 26H9.5V4.66l1.51-.33 1.49.3v21.34zm10 1.36-1.51.33-1.49-.3V6.02l1.51.3L22.5 6h.01v21.34z" />
                  </svg>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Show list
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" role="presentation" focusable="false" style={{display: "block", height: "16px", width: "16px", fill: "white"}}>
                    <path fillRule="evenodd" d="M2.5 11.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM15 12v2H6v-2h9zM2.5 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM15 7v2H6V7h9zM2.5 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM15 2v2H6V2h9z"></path>
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Statistics Section */}
          {listShown && (
            <div className="mb-4">
              <ListingStatistics />
            </div>
          )}

          {/* Main Content Area */}
          <div className="mt-4">
            {listShown ? (
              <ListingAndReviews filters={selectedFacets} />
            ) : (
              <ListingAndReviewsMap filters={selectedFacets} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
