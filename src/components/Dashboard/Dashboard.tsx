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
  Switch,
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

interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  website_url?: string;
  headquarters?: string;
  logo_url?: string;
  social_links?: any;
  founded_year?: number;
  ceo?: string;
  employee_count?: number;
  num_employees?: number;
  company_category_id?: number;
  dental_category_id?: number;
  aesthetic_category_id?: number;
  key_products?: string;
  specialties?: string[];
  products?: string[];
  market_share_pct?: number;
  market_size_2025_usd_billion?: number;
  projected_growth_pct?: number;
  revenue?: string;
  last_year_sales_usd_million?: number;
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
  const [dentalCompanies, setDentalCompanies] = useState<Company[]>([]);
  const [aestheticCompanies, setAestheticCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [companiesLoading, setCompaniesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<'dental' | 'aesthetic'>('dental');

  // Pagination state
  const [dentalPage, setDentalPage] = useState(0);
  const [dentalRowsPerPage, setDentalRowsPerPage] = useState(10);
  const [aestheticPage, setAestheticPage] = useState(0);
  const [aestheticRowsPerPage, setAestheticRowsPerPage] = useState(10);
  const [dentalCompanyPage, setDentalCompanyPage] = useState(0);
  const [dentalCompanyRowsPerPage, setDentalCompanyRowsPerPage] = useState(10);
  const [aestheticCompanyPage, setAestheticCompanyPage] = useState(0);
  const [aestheticCompanyRowsPerPage, setAestheticCompanyRowsPerPage] = useState(10);

  // Fetch companies
  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const { data: dentalData, error: dentalError } = await supabase
        .from('dental_companies')
        .select('*')
        .order('name', { ascending: true });
      if (dentalError) throw dentalError;
      setDentalCompanies(dentalData || []);

      const { data: aestheticData, error: aestheticError } = await supabase
        .from('aesthetic_companies')
        .select('*')
        .order('name', { ascending: true });
      if (aestheticError) throw aestheticError;
      setAestheticCompanies(aestheticData || []);
    } catch (err: any) {
      setError(`Failed to load companies: ${err.message}`);
    } finally {
      setCompaniesLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try multiple possible table names with detailed error logging
        console.log('Attempting to fetch dental procedures...');
        let dentalResponse = await supabase.from('dental_procedures').select('*');
        if (dentalResponse.error) {
          console.log('Error with dental_procedures table, trying v_dental_procedures view...');
          dentalResponse = await supabase.from('v_dental_procedures').select('*');
          if (dentalResponse.error) {
            console.log('Error with v_dental_procedures view, trying all_procedures with filtering...');
            dentalResponse = await supabase.from('all_procedures').select('*').eq('industry', 'dental');
          }
        }
        console.log('Attempting to fetch aesthetic procedures...');
        let aestheticResponse = await supabase.from('aesthetic_procedures').select('*');
        if (aestheticResponse.error) {
          console.log('Error with aesthetic_procedures table, trying v_aesthetic_procedures view...');
          aestheticResponse = await supabase.from('aesthetic_procedures_view').select('*');
          if (aestheticResponse.error) {
            console.log('Error with aesthetic_procedures_view, trying all_procedures with filtering...');
            aestheticResponse = await supabase.from('all_procedures').select('*').eq('industry', 'aesthetic');
          }
        }
        if (dentalResponse.error) throw new Error(`Dental procedures: ${dentalResponse.error.message}`);
        if (aestheticResponse.error) throw new Error(`Aesthetic procedures: ${aestheticResponse.error.message}`);
        console.log('Dental data:', dentalResponse.data);
        console.log('Aesthetic data:', aestheticResponse.data);
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
        await fetchCompanies();
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

  // Company pagination handlers
  const handleDentalCompanyChangePage = (_: unknown, newPage: number) => {
    setDentalCompanyPage(newPage);
  };

  const handleDentalCompanyChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDentalCompanyRowsPerPage(parseInt(event.target.value, 10));
    setDentalCompanyPage(0);
  };

  const handleAestheticCompanyChangePage = (_: unknown, newPage: number) => {
    setAestheticCompanyPage(newPage);
  };

  const handleAestheticCompanyChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAestheticCompanyRowsPerPage(parseInt(event.target.value, 10));
    setAestheticCompanyPage(0);
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

  const paginatedDentalCompanies = dentalCompanies.slice(
    dentalCompanyPage * dentalCompanyRowsPerPage,
    dentalCompanyPage * dentalCompanyRowsPerPage + dentalCompanyRowsPerPage
  );

  const paginatedAestheticCompanies = aestheticCompanies.slice(
    aestheticCompanyPage * aestheticCompanyRowsPerPage,
    aestheticCompanyPage * aestheticCompanyRowsPerPage + aestheticCompanyRowsPerPage
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

      {/* Industry Toggle Switch */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Card elevation={3} sx={{ px: 4, py: 2, borderRadius: 2 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: selectedIndustry === 'dental' ? 'bold' : 'normal',
                  color: selectedIndustry === 'dental' ? '#2196f3' : 'text.secondary'
                }}
              >
                Dental
              </Typography>
            </Grid>
            <Grid item>
              <Switch
                checked={selectedIndustry === 'aesthetic'}
                onChange={(e) => setSelectedIndustry(e.target.checked ? 'aesthetic' : 'dental')}
                color="primary"
              />
            </Grid>
            <Grid item>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: selectedIndustry === 'aesthetic' ? 'bold' : 'normal',
                  color: selectedIndustry === 'aesthetic' ? '#f50057' : 'text.secondary'
                }}
              >
                Aesthetic
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold', 
                color: selectedIndustry === 'dental' ? '#2196f3' : '#f50057' 
              }}>
                {selectedIndustry === 'dental' ? 'Dental' : 'Aesthetic'} Procedures
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">
                Total: {selectedIndustry === 'dental' ? dentalProcedures.length : aestheticProcedures.length} procedures
              </Typography>
              <Typography variant="body1">
                Categories: {selectedIndustry === 'dental' ? 
                  new Set(dentalProcedures.map(p => p.category)).size : 
                  new Set(aestheticProcedures.map(p => p.category)).size}
              </Typography>
              <Typography variant="body1">
                Data completeness: {selectedIndustry === 'dental' ? '30-40%' : '10-98% (varies by field)'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={4}>
        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {selectedIndustry === 'dental' ? 'Dental' : 'Aesthetic'} Data
          </Typography>
        </Box>

        {/* Procedures Table */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Procedures</Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  {selectedIndustry === 'dental' && (
                    <TableCell sx={{ fontWeight: 'bold' }}>Clinical Category</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 'bold' }}>Cost (USD)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Growth %</TableCell>
                  {selectedIndustry === 'dental' ? (
                    <>
                      <TableCell sx={{ fontWeight: 'bold' }}>Complexity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Satisfaction</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ fontWeight: 'bold' }}>Downtime</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Body Area</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Sessions</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedIndustry === 'dental' ? (
                  paginatedDentalProcedures.map((procedure, index) => (
                    <TableRow key={`dental-${procedure.id || index}`} hover>
                      <TableCell>{safeRender(procedure.name)}</TableCell>
                      <TableCell>{safeRender(procedure.category)}</TableCell>
                      <TableCell>{safeRender(procedure.clinical_category)}</TableCell>
                      <TableCell>{procedure.average_cost_usd ? `$${procedure.average_cost_usd.toLocaleString()}` : '-'}</TableCell>
                      <TableCell>{procedure.yearly_growth_percentage ? `${procedure.yearly_growth_percentage.toFixed(1)}%` : '-'}</TableCell>
                      <TableCell>{safeRender(procedure.complexity)}</TableCell>
                      <TableCell>{procedure.patient_satisfaction_score || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  paginatedAestheticProcedures.map((procedure, index) => (
                    <TableRow key={`aesthetic-${procedure.id || index}`} hover>
                      <TableCell>{safeRender(procedure.name)}</TableCell>
                      <TableCell>{safeRender(procedure.category)}</TableCell>
                      <TableCell>{procedure.average_cost_usd ? `$${procedure.average_cost_usd.toLocaleString()}` : '-'}</TableCell>
                      <TableCell>{procedure.yearly_growth_percentage ? `${procedure.yearly_growth_percentage.toFixed(1)}%` : '-'}</TableCell>
                      <TableCell>{safeRender(procedure.downtime)}</TableCell>
                      <TableCell>{safeRender(procedure.body_areas_applicable)}</TableCell>
                      <TableCell>{procedure.number_of_sessions || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={selectedIndustry === 'dental' ? dentalProcedures.length : aestheticProcedures.length}
            rowsPerPage={selectedIndustry === 'dental' ? dentalRowsPerPage : aestheticRowsPerPage}
            page={selectedIndustry === 'dental' ? dentalPage : aestheticPage}
            onPageChange={selectedIndustry === 'dental' ? handleDentalChangePage : handleAestheticChangePage}
            onRowsPerPageChange={selectedIndustry === 'dental' ? handleDentalChangeRowsPerPage : handleAestheticChangeRowsPerPage}
            sx={{ borderTop: '1px solid #e0e0e0' }}
          />
        </Box>

        {/* Companies Table */}
        <Box sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Companies</Typography>
          {companiesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress size={40} thickness={4} />
              <Typography variant="body1" sx={{ ml: 2 }}>Loading {selectedIndustry} companies...</Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Website</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedIndustry === 'dental' ? paginatedDentalCompanies : paginatedAestheticCompanies)
                      .map((company: Company, index: number) => (
                        <TableRow key={`${selectedIndustry}-${company.id || index}`} hover>
                          <TableCell>{company.name || 'N/A'}</TableCell>
                          <TableCell>{company.description || 'N/A'}</TableCell>
                          <TableCell>{company.website ? (
                            <a href={company.website} target="_blank" rel="noopener noreferrer">{company.website}</a>
                          ) : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 20, 40, 100]}
                component="div"
                count={selectedIndustry === 'dental' ? dentalCompanies.length : aestheticCompanies.length}
                rowsPerPage={selectedIndustry === 'dental' ? dentalCompanyRowsPerPage : aestheticCompanyRowsPerPage}
                page={selectedIndustry === 'dental' ? dentalCompanyPage : aestheticCompanyPage}
                onPageChange={selectedIndustry === 'dental' ? handleDentalCompanyChangePage : handleAestheticCompanyChangePage}
                onRowsPerPageChange={selectedIndustry === 'dental' ? handleDentalCompanyChangeRowsPerPage : handleAestheticCompanyChangeRowsPerPage}
                sx={{ borderTop: '1px solid #e0e0e0' }}
              />
            </>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default Dashboard;
