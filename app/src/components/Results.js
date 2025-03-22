import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Replace these URLs with the correct paths to your medal images
const medalImages = {
    0: `${process.env.BASE_PATH}/win-first.png`,
    1: `${process.env.BASE_PATH}/win-second.png`,
    2: `${process.env.BASE_PATH}/win-third.png`
};

const Results = ({ results, whoami }) => {
  // Check if results is defined and is an object
  if (!results || typeof results !== 'object' || Object.keys(results).length === 0) {
    return <h2 className="text-xl">No results available</h2>;
  }
  
  // Transform the results object into an array and sort descending by points
  const sortedData = Object.entries(results)
    .map(([user, points]) => ({ user, points }))
    .sort((a, b) => b.points - a.points);
  
  // Get the top 10 results
  const topTen = sortedData.slice(0, 10);
  
  // Determine the rank of the whoami user (if exists)
  const whoamiRankIndex = sortedData.findIndex(row => row.user === whoami);
  const whoamiRow = whoamiRankIndex !== -1 ? sortedData[whoamiRankIndex] : null;
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {topTen.map((row, index) => (
              <tr key={row.user} className="border-t">
                <td className="px-4 py-2 text-center">
                  {medalImages[index] ? (
                    <img 
                      src={medalImages[index]} 
                      alt={index === 0 ? '1' : index === 1 ? '2' : '3'} 
                      className="w-6 h-6 inline" 
                    />
                  ) : (
                    index + 1
                  )}
                </td>
                <td className="px-4 py-2">{row.user}</td>
                <td className="px-4 py-2 text-right">{row.points}</td>
              </tr>
            ))}
            {/* If whoami is not in the top 10, add a separator and a row with whoami's result */}
            {whoamiRow && topTen.findIndex(row => row.user === whoami) === -1 && (
              <>
                <tr className="border-t">
                  <td className="px-4 py-2" colSpan="3">
                    <hr className="my-2" />
                  </td>
                </tr>
                <tr className="border-t bg-gray-100">
                  <td className="px-4 py-2 text-center">{whoamiRankIndex + 1}</td>
                  <td className="px-4 py-2">{whoamiRow.user} (You)</td>
                  <td className="px-4 py-2 text-right">{whoamiRow.points}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Results;
