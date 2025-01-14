import React, { useState } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

const Results = ({ results }) => {
  // Check if results is defined and is an object
  if (!results || typeof results !== 'object' || Object.keys(results).length === 0) {
    return <Typography variant="h6">No results available</Typography>;
  }
  
  // Transform the results object into an array of objects suitable for @mui/x-charts
  const data = Object.entries(results).map(([user, points]) => ({ user, points }));
  
  // Get the first 10 users for the bar chart
  const top10Data = data.slice(0, 10);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Paginated data
  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  return (
    <div>
    <Typography variant="h4" gutterBottom>
    Results
    </Typography>
    
    <BarChart
    xAxis={[{ dataKey: 'user', scaleType: 'band' }]}
    series={[{ dataKey: 'points', label: 'Points' }]}
    height={400}
    width={400} // Ensure this is a number
    dataset={top10Data}
    />
    
    <TableContainer component={Paper} style={{ marginTop: '20px' }}>
    <Table>
    <TableHead>
    <TableRow>
    <TableCell>#</TableCell>
    <TableCell>User</TableCell>
    <TableCell align="right">Points</TableCell>
    </TableRow>
    </TableHead>
    <TableBody>
    {paginatedData.map((row, index) => (
      <TableRow key={row.user}>
      <TableCell component="th" scope="row">
      {page * rowsPerPage + index + 1}
      </TableCell>
      <TableCell>{row.user}</TableCell>
      <TableCell align="right">{row.points}</TableCell>
      </TableRow>
    ))}
    </TableBody>
    </Table>
    <TablePagination
    rowsPerPageOptions={[10]}
    component="div"
    count={data.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    />
    </TableContainer>
    </div>
  );
};

export default Results;
