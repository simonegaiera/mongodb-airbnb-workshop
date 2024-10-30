"use client";

import React, { useEffect, useState } from 'react';
import Results from '@/components/Results';
import ResultsSplit from '@/components/ResultsSplit';
import { Container, CircularProgress, Box } from '@mui/material';

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
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box my={2}>
        <Results results={results} />
      </Box>
      <Box>
        <ResultsSplit data={data} />
      </Box>
    </Container>
  );
};

export default Leaderboard;
