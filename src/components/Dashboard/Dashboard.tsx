import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
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
  TablePagination,
  Button,
  Chip,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Switch
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
  category_id?: number;
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

interface CategoryType {
  id: number;
  name: string;
  procedure_count?: number;
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
  // State management
  const [selectedIndustry, setSelectedIndustry] = useState<'dental' | 'aesthetic'>('dental');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [dentalProcedures, setDentalProcedures] = useState<DentalProcedure[]>([]);
  const [aestheticProcedures, setAestheticProcedures] = useState<AestheticProcedure[]>([]);
  const [dentalCompanies, setDentalCompanies] = useState<Company[]>([]);
  const [aestheticCompanies, setAestheticCompanies] = useState<Company[]>([]);
  const [dentalCategories, setDentalCategories] = useState<CategoryType[]>([]);
  const [aestheticCategories, setAestheticCategories] = useState<CategoryType[]>([]);
  
  // Pagination states
  const [dentalPage, setDentalPage] = useState(0);
  const [aestheticPage, setAestheticPage] = useState(0);
  const [dentalCompanyPage, setDentalCompanyPage] = useState(0);
  const [aestheticCompanyPage, setAestheticCompanyPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [companiesRowsPerPage, setCompaniesRowsPerPage] = useState(5);
  
  // UI states
  const [tabValue, setTabValue] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Derived states
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Computed values based on selected industry
  const currentCompanies = useMemo(() => 
    selectedIndustry === 'dental' ? dentalCompanies : aestheticCompanies,
    [selectedIndustry, dentalCompanies, aestheticCompanies]
  );
  
  const currentCategories = useMemo(() => 
    selectedIndustry === 'dental' ? dentalCategories : aestheticCategories,
    [selectedIndustry, dentalCategories, aestheticCategories]
  );
  
  const currentPage = useMemo(() => 
    selectedIndustry === 'dental' ? dentalPage : aestheticPage,
    [selectedIndustry, dentalPage, aestheticPage]
  );
  
  const currentCompanyPage = useMemo(() => 
    selectedIndustry === 'dental' ? dentalCompanyPage : aestheticCompanyPage,
    [selectedIndustry, dentalCompanyPage, aestheticCompanyPage]
  );

  // Event handlers
  const handleIndustryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIndustry(event.target.checked ? 'aesthetic' : 'dental');
    setSelectedCategory(null);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (selectedIndustry === 'dental') {
      setDentalPage(newPage);
    } else {
      setAestheticPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setDentalPage(0);
    setAestheticPage(0);
  };

  const handleCompanyPageChange = (_event: unknown, newPage: number) => {
    if (selectedIndustry === 'dental') {
      setDentalCompanyPage(newPage);
    } else {
      setAestheticCompanyPage(newPage);
    }
  };

  const handleCompanyRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompaniesRowsPerPage(parseInt(event.target.value, 10));
    setDentalCompanyPage(0);
    setAestheticCompanyPage(0);
  };

  // Fetch companies data
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

  // Fetch categories data
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { data: dentalCatData, error: dentalCatError } = await supabase
        .from('dental_procedure_categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (dentalCatError) throw dentalCatError;
      setDentalCategories(dentalCatData || []);

      const { data: aestheticCatData, error: aestheticCatError } = await supabase
        .from('aesthetic_categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (aestheticCatError) throw aestheticCatError;
      setAestheticCategories(aestheticCatData || []);
    } catch (err: any) {
      setError(`Failed to load categories: ${err.message}`);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch procedures data
  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const { data: dentalData, error: dentalError } = await supabase
        .from('dental_procedures')
        .select('*')
        .order('name', { ascending: true });
      
      if (dentalError) throw dentalError;
      setDentalProcedures(dentalData || []);

      const { data: aestheticData, error: aestheticError } = await supabase
        .from('aesthetic_procedures')
        .select('*')
        .order('name', { ascending: true });
      
      if (aestheticError) throw aestheticError;
      setAestheticProcedures(aestheticData || []);
    } catch (err: any) {
      setError(`Failed to load procedures: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchProcedures(),
          fetchCategories(),
          fetchCompanies()
        ]);
      } catch (err: any) {
        setError(`Failed to load data: ${err.message}`);
      }
    };

    fetchData();
  }, []);

  // Filter procedures based on selected category
  const filteredProcedures = useMemo(() => {
    if (selectedIndustry === 'dental') {
      return selectedCategory
        ? dentalProcedures.filter(p => 
            p.category_id === selectedCategory || 
            p.procedure_category_id === selectedCategory
          )
        : dentalProcedures;
    } else {
      return selectedCategory
        ? aestheticProcedures.filter(p => p.category_id === selectedCategory)
        : aestheticProcedures;
    }
  }, [selectedIndustry, selectedCategory, dentalProcedures, aestheticProcedures]);

  // Get paginated records
  const paginatedProcedures = useMemo(() => 
    filteredProcedures.slice(
      currentPage * rowsPerPage,
      (currentPage + 1) * rowsPerPage
    ),
    [filteredProcedures, currentPage, rowsPerPage]
  );

  const paginatedCompanies = useMemo(() => 
    currentCompanies.slice(
      currentCompanyPage * companiesRowsPerPage,
      (currentCompanyPage + 1) * companiesRowsPerPage
    ),
    [currentCompanies, currentCompanyPage, companiesRowsPerPage]
  );

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading all procedures...</Typography>
      </Box>
    );
  }

  // Error state
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

  // Main render
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ 
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        p: { xs: 1, sm: 2, md: 3 },
        boxSizing: 'border-box'
      }}>
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
                  onChange={handleIndustryChange}
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

        {/* Categories Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedIndustry === 'dental' ? 'Dental Procedure Categories' : 'Aesthetic Procedure Categories'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {currentCategories.map((category) => (
                    <Chip 
                      key={category.id}
                      label={`${category.name} (${category.procedure_count || 0})`}
                      onClick={() => handleCategorySelect(category.id)}
                      color={selectedCategory === category.id ? 'primary' : 'default'}
                      variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                  {selectedCategory && (
                    <Chip 
                      label="Clear Filter"
                      onClick={() => handleCategorySelect(null)}
                      color="secondary"
                      variant="outlined"
                      sx={{ m: 0.5 }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Procedures Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedIndustry === 'dental' ? 'Dental Procedures' : 'Aesthetic Procedures'}
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Cost (USD)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Growth (%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedProcedures.map((procedure, index) => (
                        <TableRow key={`${selectedIndustry}-${procedure.id || index}`} hover>
                          <TableCell>{procedure.name || procedure.procedure_name || 'N/A'}</TableCell>
                          <TableCell>{procedure.category || 'N/A'}</TableCell>
                          <TableCell>{procedure.average_cost_usd !== undefined ? `$${procedure.average_cost_usd}` : 'N/A'}</TableCell>
                          <TableCell>{procedure.yearly_growth_percentage !== undefined ? `${procedure.yearly_growth_percentage}%` : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredProcedures.length}
                  page={currentPage}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Companies Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedIndustry === 'dental' ? 'Dental Companies' : 'Aesthetic Companies'}
                </Typography>
                {companiesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <CircularProgress size={40} thickness={4} />
                    <Typography variant="body1" sx={{ ml: 2 }}>Loading {selectedIndustry} companies...</Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Website</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedCompanies.map((company: Company, index: number) => (
                            <TableRow key={`${selectedIndustry}-${company.id || index}`} hover>
                              <TableCell>{company.name || 'N/A'}</TableCell>
                              <TableCell>{company.description || 'N/A'}</TableCell>
                              <TableCell>
                                {company.website_url ? (
                                  <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                                    {company.website || 'Visit Website'}
                                  </a>
                                ) : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      component="div"
                      count={currentCompanies.length}
                      page={currentCompanyPage}
                      onPageChange={handleCompanyPageChange}
                      rowsPerPage={companiesRowsPerPage}
                      onRowsPerPageChange={handleCompanyRowsPerPageChange}
                      rowsPerPageOptions={[5, 10, 25]}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
