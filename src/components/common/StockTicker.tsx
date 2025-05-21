import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { supabase } from '../../services/supabaseClient';

export interface StockTickerProps {
  tickers?: string[];
  interval?: number; // in ms
}

const DEFAULT_TICKERS = ['AAPL', 'GOOG', 'AMZN', 'MSFT', 'TSLA'];

const StockTicker: React.FC<StockTickerProps> = ({ tickers, interval = 3000 }) => {
  const [symbols, setSymbols] = useState<string[]>(tickers || []);
  const [index, setIndex] = useState(0);

  // Fetch ticker symbols from Supabase if none provided
  useEffect(() => {
    if (tickers && tickers.length > 0) {
      setSymbols(tickers);
      return;
    }

    const load = async () => {
      try {
        const { data: dental } = await supabase
          .from('dental_companies')
          .select('stock_ticker,ticker_symbol,ticker,symbol');
        const { data: aesthetic } = await supabase
          .from('aesthetic_companies')
          .select('stock_ticker,ticker_symbol,ticker,symbol');
        const records = [...(dental || []), ...(aesthetic || [])];
        const syms = records
          .map((r: any) => r.stock_ticker || r.ticker_symbol || r.ticker || r.symbol)
          .filter(Boolean);
        setSymbols(syms.length ? syms : DEFAULT_TICKERS);
      } catch (err) {
        console.error('Failed to fetch ticker symbols', err);
        setSymbols(DEFAULT_TICKERS);
      }
    };
    load();
  }, [tickers]);

  // Cycle through ticker symbols
  useEffect(() => {
    if (symbols.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % symbols.length);
    }, interval);
    return () => clearInterval(id);
  }, [symbols, interval]);

  if (symbols.length === 0) return null;

  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
        {symbols[index]}
      </Typography>
    </Box>
  );
};

export default StockTicker;
