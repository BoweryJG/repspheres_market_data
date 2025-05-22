import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { supabase } from '../../services/supabaseClient';

export interface StockTickerProps {
  tickers?: string[];
  interval?: number; // in ms
}

const DEFAULT_TICKERS = ['AAPL', 'GOOG', 'AMZN', 'MSFT', 'TSLA'];

interface TickerData {
  ticker: string;
  price?: number;
}

const StockTicker: React.FC<StockTickerProps> = ({ tickers = DEFAULT_TICKERS, interval = 3000 }) => {
  const [index, setIndex] = useState(0);
  const [internalTickers, setInternalTickers] = useState<string[]>(tickers);
  const [stockData, setStockData] = useState<TickerData[]>([]);

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

  // Fetch real-time stock prices for the current list of tickers
  useEffect(() => {
    if (internalTickers.length === 0) return;

    const fetchPrices = async () => {
      try {
        const symbols = internalTickers.join(',');
        const resp = await fetch(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`
        );
        const json = await resp.json();
        if (json.quoteResponse && json.quoteResponse.result) {
          const data: TickerData[] = json.quoteResponse.result.map((r: any) => ({
            ticker: r.symbol,
            price: r.regularMarketPrice,
          }));
          setStockData(data);
        }
      } catch (err) {
        console.error('Error fetching stock prices:', err);
      }
    };

    fetchPrices();
  }, [internalTickers]);

  useEffect(() => {
    const items = stockData.length > 0 ? stockData : internalTickers;
    if (items.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, interval);
    return () => clearInterval(id);
  }, [stockData, internalTickers, interval]);

  const display = stockData.length > 0
    ? `${stockData[index].ticker}: $${
        stockData[index].price !== undefined
          ? stockData[index].price.toFixed(2)
          : 'N/A'
      }`
    : internalTickers[index];

  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
        {display}
      </Typography>
    </Box>
  );
};

export default StockTicker;
