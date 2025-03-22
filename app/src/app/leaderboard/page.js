"use client";

import React, { useEffect, useState } from 'react';
import Results from '@/components/Results';
import ResultsSplit from '@/components/ResultsSplit';

const Leaderboard = () => {
  const [results, setResults] = useState(null);
  const [data, setData] = useState(null);
  const [whoami, setWhoAmi] = useState(null);
  const [showData, setShowData] = useState(false);

  useEffect(() => {
    fetch(`${process.env.BASE_URL}/api/results`)
      .then(response => response.json())
      .then(data => {
        setResults(data.results);
        setData(data.data);
        setWhoAmi(data.whoami);
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
        <Results results={results} whoami={whoami} />
      </div>
      <div className="mb-4">
        <span className="mr-4">Show All Results:</span>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="showData"
            value="yes"
            checked={showData === true}
            onChange={() => setShowData(true)}
            className="form-radio"
          />
          <span className="ml-2">Yes</span>
        </label>
        <label className="inline-flex items-center ml-4">
          <input
            type="radio"
            name="showData"
            value="no"
            checked={showData === false}
            onChange={() => setShowData(false)}
            className="form-radio"
          />
          <span className="ml-2">No</span>
        </label>
      </div>
      {showData && (
        <div>
          <ResultsSplit data={data} whoami={whoami} />
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
