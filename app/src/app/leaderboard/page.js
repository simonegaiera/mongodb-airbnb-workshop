"use client";

import React, { useEffect, useState } from 'react';
import Results from '@/components/Results';
import ResultsSplit from '@/components/ResultsSplit';

const Leaderboard = () => {
  const [results, setResults] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.BASE_URL}/api/results`)
      .then(response => response.json())
      .then(data => {
        setResults(data.results);
        setData(data.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  if (!results || !data) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="my-8">
        <Results results={results} />
      </div>
      <div>
        <ResultsSplit data={data} />
      </div>
    </div>
  );
};

export default Leaderboard;
