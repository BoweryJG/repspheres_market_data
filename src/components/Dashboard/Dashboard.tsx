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
  Divider,
  Alert,
  Tabs,
  Tab,
  TablePagination,
  Button
} from '@mui/material';
import { supabase } from '../../services/supabaseClient';

// Define interfaces based on the actual database schema
interface DentalProcedure {
  id: number;
  procedure_name?: string;
  name?: string;
  description?: string;
  expanded_description?: string;
  category_id?: number;
  category?: string;
  procedure_category_id?: number;
  clinical_category?: string;
  clinical_category_id?: number;
  market_size_2025_usd_millions?: number;
  yearly_growth_percentage?: number;
  average_cost_usd?: number;
  complexity?: string;
  procedure_duration_min?: number;
  recovery_time_days?: number;
  patient_satisfaction_score?: number;
  risks?: string;
  contraindications?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface AestheticProcedure {
  id: number;
  procedure_name?: string;
  name?: string;
  description?: string;
  category?: string;
  clinical_category?: string;
  average_cost_usd?: number;
  yearly_growth_percentage?: number;
  downtime?: string;
  number_of_sessions?: number;
  results_duration?: string;
  body_areas_applicable?: string;
  skin_types_applicable?: string;
  patient_satisfaction_score?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

function a11yProps(index: number) {
  return { id: `tab-${index}`, 'aria-controls': `tabpanel-${index}` };
}

const Dashboard: React.FC = () => {
  const [dentalProcedures, setDentalProcedures] = useState<DentalProcedure[]>([]);
  const [aestheticProcedures, setAestheticProcedures] = useState<AestheticProcedure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);

  // Pagination state
  const [dentalPage, setDentalPage] = useState(0);
  const [dentalRowsPerPage, setDentalRowsPerPage] = useState(20);
  const [aestheticPage, setAestheticPage] = useState(0);
  const [aestheticRowsPerPage, setAestheticRowsPerPage] = useState(20);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try multiple possible table names with detailed error logging
        console.log('Attempting to fetch dental procedures...');
        let dentalResponse = await supabase.from('dental_procedures').select('*');
        
        // If the first attempt fails, try the view
        if (dentalResponse.error) {
          console.log('Error with dental_procedures table, trying v_dental_procedures view...');
          dentalResponse = await supabase.from('v_dental_procedures').select('*');
          
          // If that fails too, try all_procedures with filtering
          if (dentalResponse.error) {
            console.log('Error with v_dental_procedures view, trying all_procedures with filtering...');
            dentalResponse = await supabase.from('all_procedures').select('*').eq('industry', 'dental');
          }
        }
        
        console.log('Attempting to fetch aesthetic procedures...');
        let aestheticResponse = await supabase.from('aesthetic_procedures').select('*');
        
        // If the first attempt fails, try the view
        if (aestheticResponse.error) {
          console.log('Error with aesthetic_procedures table, trying v_aesthetic_procedures view...');
          aestheticResponse = await supabase.from('aesthetic_procedures_view').select('*');
          
          // If that fails too, try all_procedures with filtering
          if (aestheticResponse.error) {
            console.log('Error with aesthetic_procedures_view, trying all_procedures with filtering...');
            aestheticResponse = await supabase.from('all_procedures').select('*').eq('industry', 'aesthetic');
          }
        }
        
        // Final error check after all attempts
        if (dentalResponse.error) throw new Error(`Dental procedures: ${dentalResponse.error.message}`);
        if (aestheticResponse.error) throw new Error(`Aesthetic procedures: ${aestheticResponse.error.message}`);
        
        console.log('Dental data:', dentalResponse.data);
        console.log('Aesthetic data:', aestheticResponse.data);
        
        // Normalize field names to handle different schema structures
        const dentalProcs = (dentalResponse.data || []).map(proc => ({
          ...proc,
          id: proc.id || Math.random(),
          name: proc.procedure_name || proc.name || proc.title || '',
          category: proc.category || proc.procedure_category || '',
          clinical_category: proc.clinical_category || proc.specialty || '',
          average_cost_usd: proc.average_cost_usd || proc.cost || proc.price || 0,
          yearly_growth_percentage: proc.yearly_growth_percentage || proc.growth_rate || 0
        }));
        
        const aestheticProcs = (aestheticResponse.data || []).map(proc => ({
          ...proc,
          id: proc.id || Math.random(),
          name: proc.procedure_name || proc.name || proc.title || '',
          category: proc.category || proc.procedure_category || '',
          average_cost_usd: proc.average_cost_usd || proc.cost || proc.cost_range || 0,
          yearly_growth_percentage: proc.yearly_growth_percentage || proc.trend_score || 0,
          downtime: proc.downtime || '',
          body_areas_applicable: proc.body_areas_applicable || proc.body_area || ''
        }));
        
        console.log(`Loaded ${dentalProcs.length} dental procedures`);
        console.log(`Loaded ${aestheticProcs.length} aesthetic procedures`);
        
        setDentalProcedures(dentalProcs);
        setAestheticProcedures(aestheticProcs);
      } catch (e: any) {
        console.error('Error fetching data:', e);
        setError(`Failed to load procedures: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination handlers
  const handleDentalChangePage = (_: unknown, newPage: number) => {
    setDentalPage(newPage);
  };

  const handleDentalChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDentalRowsPerPage(parseInt(event.target.value, 10));
    setDentalPage(0);
  };

  const handleAestheticChangePage = (_: unknown, newPage: number) => {
    setAestheticPage(newPage);
  };

  const handleAestheticChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAestheticRowsPerPage(parseInt(event.target.value, 10));
    setAestheticPage(0);
  };

  // Get paginated records
  const paginatedDentalProcedures = dentalProcedures.slice(
    dentalPage * dentalRowsPerPage,
    dentalPage * dentalRowsPerPage + dentalRowsPerPage
  );

  const paginatedAestheticProcedures = aestheticProcedures.slice(
    aestheticPage * aestheticRowsPerPage,
    aestheticPage * aestheticRowsPerPage + aestheticRowsPerPage
  );

  // Safe rendering function for any field
  const safeRender = (value: any, isPercent = false, decimalPlaces = 1) => {
    if (value === null || value === undefined || value === '') return '-';
    if (isPercent) {
      const numValue = parseFloat(String(value));
      return isNaN(numValue) ? '-' : `${numValue.toFixed(decimalPlaces)}%`;
    }
    return String(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading all procedures...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  // Calculate categories count safely
  const dentalCategories = new Set();
  dentalProcedures.forEach(p => {
    if (p.category) dentalCategories.add(p.category);
  });

  const aestheticCategories = new Set();
  aestheticProcedures.forEach(p => {
    if (p.category) aestheticCategories.add(p.category);
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
        Market Intelligence Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196f3' }}>Dental Procedures</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Total: {dentalProcedures.length} procedures</Typography>
              <Typography variant="body1">Categories: {dentalCategories.size}</Typography>
              <Typography variant="body1">Data completeness: 30-40%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f50057' }}>Aesthetic Procedures</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Total: {aestheticProcedures.length} procedures</Typography>
              <Typography variant="body1">Categories: {aestheticCategories.size}</Typography>
              <Typography variant="body1">Data completeness: 10-98% (varies by field)</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={4}>
        <Tabs 
          value={tabValue} 
          onChange={(_, v) => setTabValue(v)} 
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1rem' },
            bgcolor: '#f5f5f5'
          }}
        >
          <Tab label={`Dental Procedures (${dentalProcedures.length})`} {...a11yProps(0)} />
          <Tab label={`Aesthetic Procedures (${aestheticProcedures.length})`} {...a11yProps(1)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper} elevation={0}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Clinical Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cost (USD)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Growth %</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Complexity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Satisfaction</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDentalProcedures.map((procedure, index) => (
                  <TableRow key={`dental-${procedure.id || index}`} hover>
                    <TableCell>{safeRender(procedure.name)}</TableCell>
                    <TableCell>{safeRender(procedure.category)}</TableCell>
                    <TableCell>{safeRender(procedure.clinical_category)}</TableCell>
                    <TableCell>{procedure.average_cost_usd ? `$${procedure.average_cost_usd.toLocaleString()}` : '-'}</TableCell>
                    <TableCell>{procedure.yearly_growth_percentage ? `${procedure.yearly_growth_percentage.toFixed(1)}%` : '-'}</TableCell>
                    <TableCell>{safeRender(procedure.complexity)}</TableCell>
                    <TableCell>{procedure.patient_satisfaction_score || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 40, 100]}
            component="div"
            count={dentalProcedures.length}
            rowsPerPage={dentalRowsPerPage}
            page={dentalPage}
            onPageChange={handleDentalChangePage}
            onRowsPerPageChange={handleDentalChangeRowsPerPage}
            sx={{ borderTop: '1px solid #e0e0e0' }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} elevation={0}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cost (USD)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Downtime</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Growth %</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Body Area</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sessions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAestheticProcedures.map((procedure, index) => (
                  <TableRow key={`aesthetic-${procedure.id || index}`} hover>
                    <TableCell>{safeRender(procedure.name)}</TableCell>
                    <TableCell>{safeRender(procedure.category)}</TableCell>
                    <TableCell>{procedure.average_cost_usd ? `$${procedure.average_cost_usd.toLocaleString()}` : '-'}</TableCell>
                    <TableCell>{safeRender(procedure.downtime)}</TableCell>
                    <TableCell>{procedure.yearly_growth_percentage ? `${procedure.yearly_growth_percentage.toFixed(1)}%` : '-'}</TableCell>
                    <TableCell>{safeRender(procedure.body_areas_applicable)}</TableCell>
                    <TableCell>{procedure.number_of_sessions || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[20, 50, 100, 220]}
            component="div"
            count={aestheticProcedures.length}
            rowsPerPage={aestheticRowsPerPage}
            page={aestheticPage}
            onPageChange={handleAestheticChangePage}
            onRowsPerPageChange={handleAestheticChangeRowsPerPage}
            sx={{ borderTop: '1px solid #e0e0e0' }}
          />
        </TabPanel>
      </Card>
    </Container>
  );
};

export default Dashboard;
