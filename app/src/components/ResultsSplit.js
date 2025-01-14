import React, { useState } from 'react';

const ResultsSplit = ({ data }) => {
  const [selectedSections, setSelectedSections] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState({});

  // Extract unique sections from the data
  const sections = [...new Set(data.map(item => item._id.section))];

  const handleSectionChange = (section) => {
    setSelectedSections((prevSelected) =>
      prevSelected.includes(section) 
        ? prevSelected.filter((s) => s !== section)
        : [...prevSelected, section]
    );
  };

  const toggleShowMore = (section) => {
    setVisibleUsers((prevVisibleUsers) => ({
      ...prevVisibleUsers,
      [section]: prevVisibleUsers[section] ? prevVisibleUsers[section] + 5 : 10,
    }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">
        Data
      </h1>

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
          const visibleCount = visibleUsers[item._id.section] || 5;
          const usersToShow = item.users.slice(0, visibleCount);

          return (
            <div key={index} className="bg-white rounded-lg shadow-md mb-6 p-6">
              <h2 className="text-xl font-semibold">{item._id.section}</h2>
              <h3 className="text-lg text-gray-600 mb-4">{item._id.name}</h3>
              <ul className="space-y-2">
                {usersToShow.map((user, idx) => (
                  <li key={idx} className="py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-800">{user.username}: {user.points} points</span>
                  </li>
                ))}
              </ul>
              {item.users.length > visibleCount && (
                <button 
                  onClick={() => toggleShowMore(item._id.section)}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Show More
                </button>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default ResultsSplit;
