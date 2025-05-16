import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { supabase } from '../../services/supabaseClient';

// Types for our dashboard data
type IndustryMetrics = {
  industry: string;
  total_articles: number;
  total_procedures: number;
  total_categories: number;
  total_providers: number;
  article_growth_rate: number;
  procedure_growth_rate: number;
  provider_growth_rate: number;
}[];

type Procedure = {
  id: number;
  name: string;
  industry: string;
  article_mentions: number;
  avg_expected_growth: number;
}[];

const Dashboard: React.FC = () => {
  const [industryMetrics, setIndustryMetrics] = useState<IndustryMetrics>([]);
  const [procedures, setProcedures] = useState<Procedure>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch industry metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('v_dashboard_industry_metrics')
          .select('*');
          
        if (metricsError) throw metricsError;
        
        // Fetch top procedures
        const { data: proceduresData, error: proceduresError } = await supabase
          .from('v_dashboard_procedures')
          .select('*')
          .limit(10);
          
        if (proceduresError) throw proceduresError;
        
        setIndustryMetrics(metricsData || []);
        setProcedures(proceduresData || []);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num / 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Market Intelligence Dashboard
      </Typography>
      
      {/* Industry Metrics */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Industry Overview
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {industryMetrics.map((metric) => (
          <Grid item xs={12} md={6} lg={4} key={metric.industry}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  {metric.industry}
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Articles: {formatNumber(metric.total_articles)}
                    </Typography>
                    <Typography variant="caption" color={metric.article_growth_rate >= 0 ? 'success.main' : 'error.main'}>
                      {metric.article_growth_rate >= 0 ? '↑' : '↓'} {Math.abs(metric.article_growth_rate)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Procedures: {formatNumber(metric.total_procedures)}
                    </Typography>
                    <Typography variant="caption" color={metric.procedure_growth_rate >= 0 ? 'success.main' : 'error.main'}>
                      {metric.procedure_growth_rate >= 0 ? '↑' : '↓'} {Math.abs(metric.procedure_growth_rate)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Categories: {formatNumber(metric.total_categories)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Providers: {formatNumber(metric.total_providers)}
                    </Typography>
                    <Typography variant="caption" color={metric.provider_growth_rate >= 0 ? 'success.main' : 'error.main'}>
                      {metric.provider_growth_rate >= 0 ? '↑' : '↓'} {Math.abs(metric.provider_growth_rate)}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Top Procedures */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Top Procedures by Mentions
      </Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Procedure</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell align="right">Mentions</TableCell>
              <TableCell align="right">Growth</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {procedures.map((procedure) => (
              <TableRow key={procedure.id}>
                <TableCell>{procedure.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={procedure.industry} 
                    size="small" 
                    color={procedure.industry === 'Dental' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell align="right">{procedure.article_mentions}</TableCell>
                <TableCell align="right">
                  <Typography color={procedure.avg_expected_growth >= 0 ? 'success.main' : 'error.main'}>
                    {formatPercentage(procedure.avg_expected_growth)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add more dashboard sections here */}
    </Container>
  );
};

export default Dashboard;
