import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { fetchStockQuotes, StockQuote } from '../../services/stockService';
import { companyTickerMap } from '../../utils/companyTickerMap';

interface StockTickerProps {
  companies: { name: string }[];
}

const StockTicker: React.FC<StockTickerProps> = ({ companies }) => {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const symbols = companies
      .map(c => companyTickerMap[c.name])
      .filter(Boolean);

    const unique = Array.from(new Set(symbols));
    const selected = unique.sort(() => 0.5 - Math.random()).slice(0, 5);

    if (selected.length) {
      fetchStockQuotes(selected)
        .then(setQuotes)
        .catch(() => {});
    }
  }, [companies]);

  useEffect(() => {
    if (!quotes.length) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(id);
  }, [quotes]);

  if (!quotes.length) return null;
  const q = quotes[index];
  const color = (q.changePercent || 0) >= 0 ? 'success.main' : 'error.main';

  return (
    <Box sx={{ mt: 0.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 0.5 }}>
        Live Stock
      </Typography>
      <Typography component="span" variant="caption" sx={{ color }}>
        {q.symbol}: {q.price?.toFixed(2)} ({q.changePercent?.toFixed(2)}%)
      </Typography>
    </Box>
  );
};

export default StockTicker;
