import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Results = ({ results }) => {
  // Check if results is defined and is an object
  if (!results || typeof results !== 'object' || Object.keys(results).length === 0) {
    return <h2 className="text-xl">No results available</h2>;
  }
  
  // Transform the results object into an array of objects
  const data = Object.entries(results).map(([user, points]) => ({ user, points }));
  
  // Get the first 10 users for the bar chart
  const top10Data = data.slice(0, 10);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  
  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };
  
  // Paginated data
  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Results</h1>
      
      <div className="mb-8">
        <BarChart
          width={600}
          height={400}
          data={top10Data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="user" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="points" fill="#8884d8" name="Points" />
        </BarChart>
      </div>
      
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
            {paginatedData.map((row, index) => (
              <tr key={row.user} className="border-t">
                <td className="px-4 py-2">{page * rowsPerPage + index + 1}</td>
                <td className="px-4 py-2">{row.user}</td>
                <td className="px-4 py-2 text-right">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, data.length)} of {data.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleChangePage(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handleChangePage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= data.length}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
