import React, { useState } from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Checkbox, FormControlLabel, FormGroup, Button } from '@mui/material';

const ResultsSplit = ({ data }) => {
  const [selectedSections, setSelectedSections] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState({});

  // Extract unique sections from the data
  const sections = [...new Set(data.map(item => item._id.section))];

  const handleSectionChange = (event) => {
    const { value, checked } = event.target;
    setSelectedSections((prevSelected) =>
      checked ? [...prevSelected, value] : prevSelected.filter((section) => section !== value)
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
      <Typography variant="h4" gutterBottom>
        Data
      </Typography>

      <FormGroup row style={{ marginBottom: '16px' }}>
        {sections.map((section) => (
          <FormControlLabel
            key={section}
            control={
              <Checkbox
                checked={selectedSections.includes(section)}
                onChange={handleSectionChange}
                value={section}
              />
            }
            label={section}
          />
        ))}
      </FormGroup>

      {data
        .filter(item => selectedSections.length === 0 || selectedSections.includes(item._id.section))
        .map((item, index) => {
          const visibleCount = visibleUsers[item._id.section] || 5;
          const usersToShow = item.users.slice(0, visibleCount);

          return (
            <Paper key={index} style={{ marginBottom: '16px', padding: '16px' }}>
              <Typography variant="h6">{item._id.section}</Typography>
              <Typography variant="subtitle1">{item._id.name}</Typography>
              <List>
                {usersToShow.map((user, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={`${user.username}: ${user.points} points`} />
                  </ListItem>
                ))}
              </List>
              {item.users.length > visibleCount && (
                <Button onClick={() => toggleShowMore(item._id.section)}>
                  Show More
                </Button>
              )}
            </Paper>
          );
        })}
    </div>
  );
};

export default ResultsSplit;
