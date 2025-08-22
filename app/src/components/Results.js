import React from 'react';

// Replace these URLs with the correct paths to your medal images
const medalImages = {
    0: `${process.env.BASE_PATH}/win-first.png`,
    1: `${process.env.BASE_PATH}/win-second.png`,
    2: `${process.env.BASE_PATH}/win-third.png`
};

const winImage = `${process.env.BASE_PATH}/win.png`

// Helper function to convert milliseconds to hours and minutes format
const formatTime = (milliseconds) => {
  if (milliseconds === 0) return '0m';

  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = '';
  if (hours > 0) {
    result += `${hours}h `;
  }
  if (minutes > 0) {
    result += `${minutes}m`;
  } else if (hours === 0 && remainingSeconds > 0) {
    result += `${remainingSeconds}s`;
  }

  return result.trim();
};

const Results = ({ results, whoami, leaderboardType }) => {
  // Check if results is defined
  if (!results || (Array.isArray(results) && results.length === 0) || (typeof results === 'object' && Object.keys(results).length === 0)) {
    return <h2 className="text-xl">No results available</h2>;
  }
  
  let sortedData;
  
  if (leaderboardType === 'timed') {
    // For timed leaderboard, results is an array of user objects with count and delta
    sortedData = results.map(user => ({
      user: user.name || user._id,
      count: user.count || 0,
      delta: user.delta?.$numberLong ? parseInt(user.delta.$numberLong) : (user.delta || 0)
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count; // Higher count is better
      }
      return a.delta - b.delta; // Lower delta (time) is better
    });
  } else {
    // For score leaderboard, results is an object with user -> points mapping
    sortedData = Object.entries(results)
      .map(([user, points]) => ({ user, points }))
      .sort((a, b) => b.points - a.points);
  }
  
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
              {leaderboardType === 'timed' ? (
                <>
                  <th className="px-4 py-2 text-right">Exercises</th>
                  <th className="px-4 py-2 text-right">Time</th>
                </>
              ) : (
                <th className="px-4 py-2 text-right">Points</th>
              )}
            </tr>
          </thead>
          <tbody>
            {topTen.map((row, index) => (
              <tr key={row.user} className="border-t">
                <td className="px-4 py-2 text-center">
                  {index < 3 ? (
                    <img 
                      src={medalImages[index]} 
                      alt={`${index + 1}`} 
                      className="w-6 h-6 inline" 
                    />
                  ) : (
                    <>
                      <img 
                        src={winImage} 
                        alt="win" 
                        className="w-6 h-6 inline" 
                      /> {index + 1}
                    </>
                  )}
                </td>
                <td className="px-4 py-2">
                  {row.user === whoami ? `${row.user} (You)` : row.user}
                </td>
                {leaderboardType === 'timed' ? (
                  <>
                    <td className="px-4 py-2 text-right">{row.count}</td>
                    <td className="px-4 py-2 text-right">{formatTime(row.delta)}</td>
                  </>
                ) : (
                  <td className="px-4 py-2 text-right">{row.points}</td>
                )}
              </tr>
            ))}
            {/* If whoami is not in the top 10, add a separator and a row with whoami's result */}
            {whoamiRow && topTen.findIndex(row => row.user === whoami) === -1 && (
              <>
                <tr className="border-t">
                  <td className="px-4 py-2" colSpan={leaderboardType === 'timed' ? "4" : "3"}>
                    <hr className="my-2" />
                  </td>
                </tr>
                <tr className="border-t bg-gray-100">
                  <td className="px-4 py-2 text-center">
                    {whoamiRankIndex < 3 ? (
                      <img 
                        src={medalImages[whoamiRankIndex]} 
                        alt={`${whoamiRankIndex + 1}`} 
                        className="w-6 h-6 inline mr-1" 
                      />
                    ) : (
                      <img 
                        src={winImage} 
                        alt="win" 
                        className="w-6 h-6 inline mr-1" 
                      />
                    )}
                    {whoamiRankIndex + 1}
                  </td>
                  <td className="px-4 py-2">{whoamiRow.user} (You)</td>
                  {leaderboardType === 'timed' ? (
                    <>
                      <td className="px-4 py-2 text-right">{whoamiRow.count}</td>
                      <td className="px-4 py-2 text-right">{formatTime(whoamiRow.delta)}</td>
                    </>
                  ) : (
                    <td className="px-4 py-2 text-right">{whoamiRow.points}</td>
                  )}
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
