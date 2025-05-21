import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { supabase } from '../../services/supabaseClient';

export interface StockTickerProps {
  tickers?: string[];
  interval?: number; // in ms
}

const DEFAULT_TICKERS = ['AAPL', 'GOOG', 'AMZN', 'MSFT', 'TSLA'];

const StockTicker: React.FC<StockTickerProps> = ({ tickers = DEFAULT_TICKERS, interval = 3000 }) => {
  const [index, setIndex] = useState(0);
  const [internalTickers, setInternalTickers] = useState<string[]>(tickers);

  // Fetch tickers from the companies tables if no tickers were provided
  useEffect(() => {
    if (tickers !== DEFAULT_TICKERS) {
      setInternalTickers(tickers);
      return;
    }

    const fetchTickers = async () => {
      try {
        const allTickers: string[] = [];

        const { data: dentalData, error: dentalError } = await supabase
          .from('dental_companies')
          .select('*');
        if (!dentalError && dentalData) {
          dentalData.forEach((c: any) => {
            const t = c.ticker_symbol || c.ticker || c.stock_ticker || c.symbol;
            if (t) allTickers.push(t);
          });
        }

        const { data: aestheticData, error: aestheticError } = await supabase
          .from('aesthetic_companies')
          .select('*');
        if (!aestheticError && aestheticData) {
          aestheticData.forEach((c: any) => {
            const t = c.ticker_symbol || c.ticker || c.stock_ticker || c.symbol;
            if (t) allTickers.push(t);
          });
        }

        if (allTickers.length > 0) {
          setInternalTickers(allTickers);
        }
      } catch (err) {
        console.error('Error fetching company tickers:', err);
      }
    };

    fetchTickers();
  }, [tickers]);

  useEffect(() => {
    if (internalTickers.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % internalTickers.length);
    }, interval);
    return () => clearInterval(id);
  }, [internalTickers, interval]);

  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
        {internalTickers[index]}
      </Typography>
    </Box>
  );
};

export default StockTicker;
