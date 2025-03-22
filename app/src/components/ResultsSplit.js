import React, { useState } from 'react';

const ResultsSplit = ({ data, whoami }) => {
  const [selectedSections, setSelectedSections] = useState([]);
  const [pageNumbers, setPageNumbers] = useState({});

  // Extract unique sections from the data
  const sections = [...new Set(data.map(item => item._id.section))];

  const handleSectionChange = (section) => {
    setSelectedSections((prevSelected) =>
      prevSelected.includes(section)
        ? prevSelected.filter((s) => s !== section)
        : [...prevSelected, section]
    );
  };

  const handleNextPage = (section, totalUsers) => {
    setPageNumbers((prevPageNumbers) => ({
      ...prevPageNumbers,
      [section]: (prevPageNumbers[section] || 1) + 1,
    }));
  };

  const handlePreviousPage = (section) => {
    setPageNumbers((prevPageNumbers) => ({
      ...prevPageNumbers,
      [section]: Math.max((prevPageNumbers[section] || 1) - 1, 1),
    }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Results</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        {sections.map((section) => (
          <label
            key={section}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedSections.includes(section)}
              onChange={() => handleSectionChange(section)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">{section}</span>
          </label>
        ))}
      </div>

      {data
        .filter(item => selectedSections.length === 0 || selectedSections.includes(item._id.section))
        .map((item, index) => {
          const currentPage = pageNumbers[item._id.section] || 1;
          const startIndex = (currentPage - 1) * 10;
          const endIndex = startIndex + 10;
          const usersToShow = item.users.slice(startIndex, endIndex);
          const totalUsers = item.users.length;
          const hasNextPage = totalUsers > currentPage * 10;
          
          // Find the index (in the whole users array) where the logged-in user appears
          const meIndex = item.users.findIndex(
            user => user.user === whoami || user.username === whoami
          );
          const mePage = meIndex !== -1 ? Math.floor(meIndex / 10) + 1 : null;
  
          return (
            <div key={index} className="bg-white rounded-lg shadow-md mb-6 p-6">
              <h2 className="text-xl font-semibold">{item._id.section}</h2>
              <h3 className="text-lg text-gray-600 mb-4">{item._id.name}</h3>
  
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">User</th>
                      <th className="px-4 py-2">Username</th>
                      <th className="px-4 py-2 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersToShow.map((user, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">
                          {user.user || '-'}
                        </td>
                        <td className="px-4 py-2">
                          {user.username}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {user.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
  
              <div className="flex justify-end mt-4 space-x-2">
                {meIndex !== -1 && mePage !== currentPage && (
                  <button 
                    onClick={() => setPageNumbers(prev => ({
                      ...prev,
                      [item._id.section]: mePage
                    }))}
                    className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
                  >
                    You
                  </button>
                )}
                <button 
                  onClick={() => handlePreviousPage(item._id.section)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-white bg-gray-500 rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"}`}
                >
                  Previous
                </button>
                <button 
                  onClick={() => handleNextPage(item._id.section, totalUsers)}
                  disabled={!hasNextPage}
                  className={`px-4 py-2 text-white bg-gray-500 rounded ${!hasNextPage ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"}`}
                >
                  Next
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default ResultsSplit;
