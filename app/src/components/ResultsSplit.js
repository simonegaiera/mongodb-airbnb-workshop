import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const ResultsSplit = ({ data }) => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Data
      </Typography>
      {data.map((item, index) => (
        <Paper key={index} style={{ marginBottom: '16px', padding: '16px' }}>
          <Typography variant="h6">{item._id.section}</Typography>
          <Typography variant="subtitle1">{item._id.name}</Typography>
          <List>
            {item.users.map((user, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={`${user.username}: ${user.points} points`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
    </div>
  );
};

export default ResultsSplit;
