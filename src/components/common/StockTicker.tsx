import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface StockTickerProps {
  tickers?: string[];
  interval?: number; // in ms
}

const DEFAULT_TICKERS = ['AAPL', 'GOOG', 'AMZN', 'MSFT', 'TSLA'];

const StockTicker: React.FC<StockTickerProps> = ({ tickers = DEFAULT_TICKERS, interval = 3000 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % tickers.length);
    }, interval);
    return () => clearInterval(id);
  }, [tickers, interval]);

  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
        {tickers[index]}
      </Typography>
    </Box>
  );
};

export default StockTicker;
