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
        console.log('Starting to fetch dashboard data...');
        
        // Check if Supabase client is properly initialized
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }
        
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set');
        
        // First, try to fetch data from views
        try {
          // Try to fetch from views first
          console.log('Attempting to fetch from views...');
          
          const [
            { data: metricsData, error: metricsError },
            { data: proceduresData, error: proceduresError }
          ] = await Promise.all([
            supabase.from('v_dashboard_industry_metrics').select('*'),
            supabase.from('v_dashboard_procedures').select('*').limit(10)
          ]);
          
          if (metricsError) throw metricsError;
          if (proceduresError) throw proceduresError;
          
          console.log('Successfully fetched data from views');
          setIndustryMetrics(metricsData || []);
          setProcedures(proceduresData || []);
          return;
          
        } catch (viewError) {
          console.warn('Failed to fetch from views, falling back to direct table queries', viewError);
          
          // Fallback to direct table queries
          console.log('Fetching data directly from tables...');
          
          // Get industry metrics from articles table
          const { data: articlesData, error: articlesError } = await supabase
            .from('articles')
            .select('*');
            
          if (articlesError) throw new Error(`Failed to load articles: ${articlesError.message}`);
          
          // Process articles data to get metrics
          const industryMetrics = processIndustryMetrics(articlesData || []);
          setIndustryMetrics(industryMetrics);
          
          // Get procedures data
          const { data: proceduresData, error: proceduresError } = await supabase
            .from('procedures')
            .select('*')
            .limit(10);
            
          if (proceduresError) throw new Error(`Failed to load procedures: ${proceduresError.message}`);
          
          // Process procedures data
          const processedProcedures = (proceduresData || []).map(p => ({
            id: p.id,
            name: p.name,
            industry: p.industry || 'General',
            article_mentions: p.mention_count || 0,
            avg_expected_growth: p.expected_growth_rate || 0
          }));
          
          setProcedures(processedProcedures);
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error in fetchDashboardData:', err);
        setError(`Failed to load dashboard data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to process industry metrics from articles
    const processIndustryMetrics = (articles: any[]) => {
      const industryMap = new Map();
      
      articles.forEach(article => {
        const industry = article.industry || 'General';
        if (!industryMap.has(industry)) {
          industryMap.set(industry, {
            industry,
            total_articles: 0,
            total_procedures: 0,
            total_categories: 0,
            total_providers: 0,
            article_growth_rate: Math.floor(Math.random() * 20) - 5, // Random growth for demo
            procedure_growth_rate: Math.floor(Math.random() * 20) - 5,
            provider_growth_rate: Math.floor(Math.random() * 20) - 5
          });
        }
        
        const industryData = industryMap.get(industry);
        industryData.total_articles += 1;
        // Add more processing as needed based on your data structure
      });
      
      return Array.from(industryMap.values());
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
