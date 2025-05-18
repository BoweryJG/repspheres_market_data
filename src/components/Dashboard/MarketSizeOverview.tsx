import React, { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface Procedure {
  id: number;
  name?: string;
  procedure_name?: string;
  category?: string;
  clinical_category?: string;
  yearly_growth_percentage?: number;
  market_size_usd_millions?: number;
  [key: string]: any;
}

interface MarketSizeOverviewProps {
  dentalProcedures: Procedure[];
  aestheticProcedures: Procedure[];
  selectedIndustry: 'dental' | 'aesthetic';
}

// Utility function to format market size
export const formatMarketSize = (sizeInMillions: number | null | undefined): string => {
  if (sizeInMillions == null) return 'N/A';
  
  if (sizeInMillions >= 1000) {
    return `$${(sizeInMillions / 1000).toFixed(1)}B`;
  } else {
    return `$${sizeInMillions.toFixed(0)}M`;
  }
};

// Utility function to format growth rate
const formatGrowthRate = (rate: number | null | undefined): string => {
  if (rate == null) return 'N/A';
  return `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`;
};

export const MarketSizeOverview: React.FC<MarketSizeOverviewProps> = ({ 
  dentalProcedures, 
  aestheticProcedures, 
  selectedIndustry 
}) => {
  const currentProcedures = useMemo(() => 
    selectedIndustry === 'dental' ? dentalProcedures : aestheticProcedures,
    [selectedIndustry, dentalProcedures, aestheticProcedures]
  );
  
  // Calculate total market size
  const totalMarketSize = useMemo(() => 
    currentProcedures.reduce((sum, p) => sum + (p.market_size_usd_millions || 0), 0),
    [currentProcedures]
  );
  
  // Calculate average growth rate
  const averageGrowthRate = useMemo(() => {
    const procedures = currentProcedures.filter(p => p.yearly_growth_percentage != null);
    if (procedures.length === 0) return null;
    return procedures.reduce((sum, p) => sum + (p.yearly_growth_percentage || 0), 0) / procedures.length;
  }, [currentProcedures]);
  
  // Calculate category market sizes
  const categoryMarketSizes = useMemo(() => {
    const categories = new Map<string, number>();
    
    currentProcedures.forEach(p => {
      const category = p.category || p.clinical_category || 'Unknown';
      const size = p.market_size_usd_millions || 0;
      categories.set(category, (categories.get(category) || 0) + size);
    });
    
    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 categories
  }, [currentProcedures]);

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Market Size Overview - {selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)} Industry
        </Typography>
        
        <Grid container spacing={3}>
          {/* Total Market Size */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Total Market Size</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                {formatMarketSize(totalMarketSize)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across {currentProcedures.length} procedures
              </Typography>
            </Paper>
          </Grid>
          
          {/* Avg Growth Rate */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Average Growth Rate</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                {formatGrowthRate(averageGrowthRate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Year-over-year growth
              </Typography>
            </Paper>
          </Grid>
          
          {/* Largest Market */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Largest Market Category</Typography>
              </Box>
              <Typography variant="h5" sx={{ mt: 1, mb: 1 }}>
                {categoryMarketSizes.length > 0 ? categoryMarketSizes[0][0] : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {categoryMarketSizes.length > 0 ? formatMarketSize(categoryMarketSizes[0][1]) : 'N/A'}
              </Typography>
            </Paper>
          </Grid>
          
          {/* Category Breakdown */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Top Categories by Market Size
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {categoryMarketSizes.map(([category, size]) => (
                <Chip 
                  key={category}
                  label={`${category}: ${formatMarketSize(size)}`}
                  color="primary" 
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MarketSizeOverview;
