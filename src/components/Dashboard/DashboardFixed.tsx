import React, { useState, useEffect, useMemo } from 'react';
// Material UI core components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

// Material UI navigation components
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

// Material UI hooks
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// Material UI icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Local imports
import Logo from '../../assets/logo.svg';
import { supabase } from '../../services/supabaseClient';
import { DentalCategory, AestheticCategory } from '../../types';
import NewsDashboard from '../News/NewsDashboard';
import CategoryHierarchyView from './CategoryHierarchyViewFixed2';

// Define sort configuration type
type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
};

// Define CategoryHierarchy interface locally since it's missing from types
interface CategoryHierarchy {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  applicable_to: 'dental' | 'aesthetic' | 'both';
  description?: string;
  avg_growth_rate?: number;
  market_size_usd_millions?: number;
  icon_name?: string;
  color_code?: string;
  display_order?: number;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  children?: CategoryHierarchy[];
  level?: number;
  isExpanded?: boolean;
  procedureCount?: number;
}

const Dashboard: React.FC = () => {
  // Responsive menubar and drawer
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navLinks: { label: string; href: string }[] = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Market Data', href: '/market' },
  ];

  const Menubar = (
    <AppBar position="sticky" elevation={3} sx={{
      background: 'linear-gradient(90deg, #0f2027 0%, #2c5364 100%)',
      borderRadius: 3,
      mb: 3,
    }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 1, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box component="img" src={Logo} alt="RepSpheres Logo" sx={{ height: 36, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, color: '#fff' }}>
            RepSpheres
          </Typography>
        </Box>
        {isMobile ? (
          <IconButton edge="end" color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', gap: 3 }}>
            {navLinks.map((link: { label: string; href: string }) => (
              <Button key={link.label} component="a" href={link.href} sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
                {link.label}
              </Button>
            ))}
          </Box>
        )}
      </Toolbar>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220, pt: 4 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {navLinks.map((link: { label: string; href: string }) => (
              <ListItem button key={link.label} component="a" href={link.href}>
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
  // State for procedures and companies
  const [dentalProcedures, setDentalProcedures] = useState<any[]>([]);
  const [aestheticProcedures, setAestheticProcedures] = useState<any[]>([]);
  const [dentalCompanies, setDentalCompanies] = useState<any[]>([]);
  const [aestheticCompanies, setAestheticCompanies] = useState<any[]>([]);
  
  // State for categories - both legacy and new hierarchical system
  const [dentalCategories, setDentalCategories] = useState<DentalCategory[]>([]);
  const [aestheticCategories, setAestheticCategories] = useState<AestheticCategory[]>([]);
  const [categoryHierarchy, setCategoryHierarchy] = useState<CategoryHierarchy[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [companiesLoading, setCompaniesLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [selectedIndustry, setSelectedIndustry] = useState<'dental' | 'aesthetic'>('dental');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc'
  });
  
  // Procedure detail modal state
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Pagination state for procedures
  const [dentalPage, setDentalPage] = useState(0);
  const [dentalRowsPerPage, setDentalRowsPerPage] = useState(10);
  const [aestheticPage, setAestheticPage] = useState(0);
  const [aestheticRowsPerPage, setAestheticRowsPerPage] = useState(10);
  
  // Pagination state for companies
  const [dentalCompanyPage, setDentalCompanyPage] = useState(0);
  const [dentalCompanyRowsPerPage, setDentalCompanyRowsPerPage] = useState(10);
  const [aestheticCompanyPage, setAestheticCompanyPage] = useState(0);
  const [aestheticCompanyRowsPerPage, setAestheticCompanyRowsPerPage] = useState(10);
  
  // Pagination state for categories
  const [dentalCategoryPage, setDentalCategoryPage] = useState(0);
  const [dentalCategoryRowsPerPage, setDentalCategoryRowsPerPage] = useState(5);
  const [aestheticCategoryPage, setAestheticCategoryPage] = useState(0);
  const [aestheticCategoryRowsPerPage, setAestheticCategoryRowsPerPage] = useState(5);

  // Map from category names to hierarchy IDs
  // IMPORTANT: Define all useMemo hooks at the component level, not conditionally
  const dentalCategoryMap = useMemo(() => ({
    'Diagnostic': 1,
    'Preventive': 2,
    'Restorative': 3,
    'Cosmetic': 4,
    'Oral Surgery': 5,
    'Endodontic': 6,
    'Periodontic': 7,
    'Prosthodontic': 8,
    'Orthodontic': 9,
    'Implantology': 10,
    'Sleep Dentistry': 2,
    'Pediatric': 2,
    'Adjunctive': 11
  }), []);

  const aestheticCategoryMap = useMemo(() => ({
    'Facial Aesthetic': 12,
    'Injectables': 13,
    'Body': 14,
    'Skin': 15,
    'Hair': 16,
    'Minimally Invasive': 17,
    'Regenerative': 18,
    'Lasers': 19,
    'Combination': 20,
    'Tech-Enhanced': 17,
    'Face': 12,
    'Breast Procedures': 14
  }), []);

  // Fetch categories from the new hierarchical system
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      // Fetch the complete category hierarchy
      const { data: hierarchyData, error: hierarchyError } = await supabase
        .from('category_hierarchy')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (hierarchyError) throw hierarchyError;
      console.log('Category hierarchy response:', { 
        count: hierarchyData?.length || 0, 
        data: hierarchyData 
      });
      
      setCategoryHierarchy(hierarchyData || []);
      
      // Process the hierarchy data to also populate the legacy category states
      // This ensures backward compatibility with existing code
      const dentalCats = hierarchyData
        ?.filter(cat => cat.applicable_to === 'dental' || cat.applicable_to === 'both')
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          market_size_usd_millions: cat.market_size_usd_millions,
          avg_growth_rate: cat.avg_growth_rate
        })) || [];
      
      const aestheticCats = hierarchyData
        ?.filter(cat => cat.applicable_to === 'aesthetic' || cat.applicable_to === 'both')
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          market_size_usd_millions: cat.market_size_usd_millions,
          avg_growth_rate: cat.avg_growth_rate
        })) || [];
      
      setDentalCategories(dentalCats);
      setAestheticCategories(aestheticCats);
      
    } catch (err: any) {
      console.error('Categories fetch error:', err);
      setError(`Failed to load categories: ${err.message}`);
    } finally {
      setCategoriesLoading(false);
    }
  };

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

  // Fetch all data on component mount
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
        
        // Fetch companies and categories
        await fetchCompanies();
        await fetchCategories();
      } catch (e: any) {
        console.error('Error fetching data:', e);
        setError(`Failed to load procedures: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Function to map procedure category to hierarchy ID
  const mapCategoryToHierarchy = (categoryName: string, industry: 'dental' | 'aesthetic'): number | null => {
    if (!categoryName) return null;
    
    const categoryMap = industry === 'dental' ? dentalCategoryMap : aestheticCategoryMap;
    // Use type assertion to fix the TypeScript error
    return (categoryMap as Record<string, number>)[categoryName] || null;
  };

  // Pagination handlers for procedures
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

  // Pagination handlers for companies
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

  // Pagination handlers for categories
  const handleDentalCategoryChangePage = (_: unknown, newPage: number) => {
    setDentalCategoryPage(newPage);
  };

  const handleDentalCategoryChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDentalCategoryRowsPerPage(parseInt(event.target.value, 10));
    setDentalCategoryPage(0);
  };

  const handleAestheticCategoryChangePage = (_: unknown, newPage: number) => {
    setAestheticCategoryPage(newPage);
  };

  const handleAestheticCategoryChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAestheticCategoryRowsPerPage(parseInt(event.target.value, 10));
    setAestheticCategoryPage(0);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    // Reset pagination when changing category filter
    if (selectedIndustry === 'dental') {
      setDentalPage(0);
    } else {
      setAestheticPage(0);
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort procedures based on sort configuration
  const sortProcedures = <T extends Record<string, any>>(procedures: T[]): T[] => {
    if (!sortConfig.field) return procedures;
    
    return [...procedures].sort((a, b) => {
      let aValue = a[sortConfig.field];
      let bValue = b[sortConfig.field];
      
      // Handle nested fields
      if (sortConfig.field === 'category') {
        aValue = a.category || '';
        bValue = b.category || '';
      } else if (sortConfig.field === 'clinical_category') {
        aValue = a.clinical_category || '';
        bValue = b.clinical_category || '';
      } else if (sortConfig.field === 'market_size') {
        aValue = a.market_size_2025_usd_millions || 0;
        bValue = b.market_size_2025_usd_millions || 0;
      }
      
      // Convert to string if not already
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      // Handle numeric comparisons
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string comparisons
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (aString < bString) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aString > bString) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Safe rendering function for any field
  const safeRender = (value: any, isPercent = false, decimalPlaces = 1) => {
    if (value === null || value === undefined || value === '') return '-';
    if (isPercent) {
      const numValue = parseFloat(String(value));
      return isNaN(numValue) ? '-' : `${numValue.toFixed(decimalPlaces)}%`;
    }
    return String(value);
  };

  // Calculate category distributions for visualization
  const calculateCategoryDistribution = (procedures: any[], categories: any[]) => {
    // Create a map to count procedures by category
    const categoryMap = new Map<number, { count: number, name: string, marketSize: number }>();
    
    // Initialize with all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, { 
        count: 0, 
        name: cat.name, 
        marketSize: cat.market_size_usd_millions || 0 
      });
    });
    
    // Count procedures by category
    procedures.forEach(proc => {
      const catId = proc.category_id || proc.procedure_category_id;
      if (catId && categoryMap.has(catId)) {
        const current = categoryMap.get(catId)!;
        categoryMap.set(catId, { 
          ...current, 
          count: current.count + 1 
        });
      }
    });
    
    // Convert to array and sort by count (descending)
    return Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
      .map(item => ({
        ...item,
        marketSizeFormatted: item.marketSize ? `$${item.marketSize}M` : 'N/A'
      }));
  };

  // Filter procedures based on selected category
  const filteredDentalProcedures = useMemo(() => {
    if (!selectedCategory) return dentalProcedures;
    return dentalProcedures.filter(p => p.category_id === selectedCategory || p.procedure_category_id === selectedCategory);
  }, [dentalProcedures, selectedCategory]);
  
  const filteredAestheticProcedures = useMemo(() => {
    if (!selectedCategory) return aestheticProcedures;
    return aestheticProcedures.filter(p => p.category_id === selectedCategory);
  }, [aestheticProcedures, selectedCategory]);
  
  // Sort the filtered procedures
  const sortedDentalProcedures = useMemo(() => 
    sortProcedures(filteredDentalProcedures),
    [filteredDentalProcedures, sortConfig]
  );
  
  const sortedAestheticProcedures = useMemo(() => 
    sortProcedures(filteredAestheticProcedures),
    [filteredAestheticProcedures, sortConfig]
  );

  // Already defined these at the component level to avoid React hooks order warning
  const currentDentalProcedures = useMemo(() => {
    return sortedDentalProcedures.slice(
      dentalPage * dentalRowsPerPage,
      dentalPage * dentalRowsPerPage + dentalRowsPerPage
    );
  }, [sortedDentalProcedures, dentalPage, dentalRowsPerPage]);

  const currentAestheticProcedures = useMemo(() => {
    return sortedAestheticProcedures.slice(
      aestheticPage * aestheticRowsPerPage,
      aestheticPage * aestheticRowsPerPage + aestheticRowsPerPage
    );
  }, [sortedAestheticProcedures, aestheticPage, aestheticRowsPerPage]);

  // Sortable table header component
  const SortableTableHeader = ({ field, children, align = 'left' }: { field: string; children: React.ReactNode, align?: 'left' | 'right' | 'center' }) => {
    const isSorted = sortConfig.field === field;
    const isAsc = sortConfig.direction === 'asc';
    
    return (
      <TableCell 
        align={align}
        onClick={() => handleSort(field)}
        sx={{ 
          cursor: 'pointer',
          fontWeight: 'bold',
          '&:hover': { 
            backgroundColor: 'action.hover',
          },
          '& > *': {
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: align === 'right' ? 'flex-end' : 
                          align === 'center' ? 'center' : 'flex-start'
          }
        }}
      >
        <Box component="span">
          {children}
          {isSorted ? (
            <Box component="span" sx={{ ml: 1, display: 'inline-flex' }}>
              {isAsc ? '↑' : '↓'}
            </Box>
          ) : (
            <Box component="span" sx={{ ml: 1, opacity: 0.5, display: 'inline-flex' }}>↕</Box>
          )}
        </Box>
      </TableCell>
    );
  };

  // Tab panel component for procedure detail modal
  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  
  const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`procedure-tabpanel-${index}`}
        aria-labelledby={`procedure-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ py: 2 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };
  
  // Modal control functions
  const handleOpenDetailModal = (procedure: any) => {
    setSelectedProcedure(procedure);
    setDetailModalOpen(true);
    setActiveTab(0);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
  };

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Calculate current companies page data
  const currentDentalCompanies = useMemo(() => {
    return dentalCompanies.slice(
      dentalCompanyPage * dentalCompanyRowsPerPage,
      dentalCompanyPage * dentalCompanyRowsPerPage + dentalCompanyRowsPerPage
    );
  }, [dentalCompanies, dentalCompanyPage, dentalCompanyRowsPerPage]);

  const currentAestheticCompanies = useMemo(() => {
    return aestheticCompanies.slice(
      aestheticCompanyPage * aestheticCompanyRowsPerPage,
      aestheticCompanyPage * aestheticCompanyRowsPerPage + aestheticCompanyRowsPerPage
    );
  }, [aestheticCompanies, aestheticCompanyPage, aestheticCompanyRowsPerPage]);

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
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
      pb: { xs: 2, md: 6 }
    }}>
      {Menubar}
      <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 4, md: 8 }, p: { xs: 0.5, sm: 2 }, borderRadius: 3, boxShadow: { xs: 0, md: 4 }, background: '#fff' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#183153', letterSpacing: 1, textAlign: { xs: 'center', md: 'left' }, pt: 2 }}>
            {selectedIndustry === 'dental' ? 'Dental' : 'Aesthetic'} Procedures Dashboard
          </Typography>
        
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 2 }}>
            <Typography component="span" sx={{ mr: 1, fontWeight: 600, color: '#1a3a5d' }}>Dental</Typography>
            <Switch
              checked={selectedIndustry === 'aesthetic'}
              onChange={(e) => {
                setSelectedIndustry(e.target.checked ? 'aesthetic' : 'dental');
                setSelectedCategory(null);
              }}
              color="primary"
              sx={{ transform: { xs: 'scale(1.2)', sm: 'scale(1)' } }}
            />
            <Typography component="span" sx={{ ml: 1, fontWeight: 600, color: '#d72660' }}>Aesthetic</Typography>
          </Box>
      
          {/* Main content grid */}
          <Grid container spacing={3}>
            {/* Left sidebar with categories hierarchy */}
            <Grid item xs={12} md={3}>
              <Box sx={{ height: '100%', background: { xs: 'none', md: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }, borderRadius: 3, p: { xs: 1, md: 2 }, boxShadow: { xs: 0, md: 2 } }}>
                <CategoryHierarchyView
                  categories={categoryHierarchy}
                  selectedIndustry={selectedIndustry}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                  loading={categoriesLoading}
                />
              </Box>
            </Grid>
        
            {/* Main content area */}
            <Grid item xs={12} md={9}>
              <Box sx={{ height: '100%', p: { xs: 0, md: 2 }, borderRadius: 3, background: { xs: 'none', md: 'linear-gradient(135deg, #f8fafc 0%, #e9e9f0 100%)' }, boxShadow: { xs: 0, md: 2 } }}>
                {/* Procedures section */}
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 3, boxShadow: 4, background: 'linear-gradient(120deg, #f8fafc 40%, #e9e9f0 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, gap: 1 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {selectedIndustry === 'dental' ? 'Dental' : 'Aesthetic'} Procedures
                  {selectedCategory && (
                    <> - {categoryHierarchy.find(c => c.id === selectedCategory)?.name || ''}</>
                  )}
                </Typography>
                
                {selectedCategory && (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear Filter
                  </Button>
                )}
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <SortableTableHeader field="name">Procedure Name</SortableTableHeader>
                      <SortableTableHeader field="category">Category</SortableTableHeader>
                      <SortableTableHeader field="average_cost_usd" align="right">Avg. Cost</SortableTableHeader>
                      <SortableTableHeader field="yearly_growth_percentage" align="right">Growth %</SortableTableHeader>
                      <SortableTableHeader field="market_size" align="right">Market Size 2025</SortableTableHeader>
                      {selectedIndustry === 'aesthetic' ? (
                        <SortableTableHeader field="downtime">Downtime</SortableTableHeader>
                      ) : (
                        <>
                          <SortableTableHeader field="clinical_category">Clinical Category</SortableTableHeader>
                          <SortableTableHeader field="cpt_cdt_code">CDT Code</SortableTableHeader>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedIndustry === 'dental' ? currentDentalProcedures : currentAestheticProcedures).map((proc) => (
                      <TableRow 
                        key={proc.id}
                        onClick={() => handleOpenDetailModal(proc)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          }
                        }}   
                      >
                        <TableCell>
                          <Tooltip title={proc.description || 'No description available'}>
                            <Typography variant="body2">{proc.name}</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{proc.category}</TableCell>
                        <TableCell align="right">
                          {typeof proc.average_cost_usd === 'number' 
                            ? `$${proc.average_cost_usd.toLocaleString()}`
                            : safeRender(proc.average_cost_usd)
                          }
                        </TableCell>
                        <TableCell align="right">
                          {safeRender(proc.yearly_growth_percentage, true)}
                        </TableCell>
                        <TableCell align="right">
                          {(() => {
                            // Format large market size numbers more readably
                            if (proc.market_size_2025_usd_millions) {
                              const value = parseFloat(String(proc.market_size_2025_usd_millions));
                              if (value >= 1000) {
                                return `$${(value/1000).toFixed(1)}B`; // Billions with 1 decimal
                              } else {
                                return `$${value.toLocaleString()}M`; // Millions with comma formatting
                              }
                            }
                            return '-';
                          })()}
                        </TableCell>
                        {selectedIndustry === 'aesthetic' && (
                          <TableCell>
                            {(() => {
                              const downtime = (proc as any).downtime;
                              if (!downtime) return '-';
                              
                              // Condense the downtime string for display
                              const condensed = downtime
                                .replace(/(\d+)\s*to\s*(\d+)/g, '$1-$2')  // Convert "X to Y" to "X-Y"
                                .replace(/\s+/g, ' ')  // Collapse multiple spaces
                                .replace(/\.\s+/g, ' • ')  // Replace ". " with " • "
                                .trim();
                              
                              // Show first 30 chars with ellipsis if longer
                              const displayText = condensed.length > 30 
                                ? `${condensed.substring(0, 30)}...` 
                                : condensed;
                              
                              return (
                                <Tooltip title={downtime} arrow>
                                  <span style={{ whiteSpace: 'nowrap' }}>{displayText}</span>
                                </Tooltip>
                              );
                            })()}
                          </TableCell>
                        )}
                        {selectedIndustry === 'dental' && (
                          <>
                            <TableCell>{(proc as any).clinical_category || '-'}</TableCell>
                            <TableCell>{proc.cpt_cdt_code || '-'}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                    
                    {(selectedIndustry === 'dental' ? !currentDentalProcedures.length : !currentAestheticProcedures.length) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No procedures found
                            {selectedCategory ? ' for the selected category' : ''}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={selectedIndustry === 'dental' 
                  ? filteredDentalProcedures.length 
                  : filteredAestheticProcedures.length
                }
                rowsPerPage={selectedIndustry === 'dental' ? dentalRowsPerPage : aestheticRowsPerPage}
                page={selectedIndustry === 'dental' ? dentalPage : aestheticPage}
                onPageChange={selectedIndustry === 'dental' ? handleDentalChangePage : handleAestheticChangePage}
                onRowsPerPageChange={selectedIndustry === 'dental' 
                  ? handleDentalChangeRowsPerPage 
                  : handleAestheticChangeRowsPerPage
                }
              />
            </CardContent>
          </Card>
          
          {/* News section */}
          <Card variant="outlined" sx={{ mt: 4, mb: 4 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Industry News
              </Typography>
              <NewsDashboard />
            </CardContent>
          </Card>
          
          {/* Companies section */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                {selectedIndustry === 'dental' ? 'Dental' : 'Aesthetic'} Companies
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Company Name</TableCell>
                      <TableCell>Headquarters</TableCell>
                      <TableCell align="right">Market Share %</TableCell>
                      <TableCell align="right">Sales ($M)</TableCell>
                      <TableCell align="right">Growth %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedIndustry === 'dental' ? currentDentalCompanies : currentAestheticCompanies).map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <Tooltip title={company.description || 'No description available'}>
                            <Typography variant="body2">{company.name}</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{company.headquarters || '-'}</TableCell>
                        <TableCell align="right">{safeRender(company.market_share_pct, true)}</TableCell>
                        <TableCell align="right">
                          {company.last_year_sales_usd_million 
                            ? `$${company.last_year_sales_usd_million.toLocaleString()}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell align="right">
                          {safeRender(company.projected_growth_pct, true)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {(selectedIndustry === 'dental' ? !currentDentalCompanies.length : !currentAestheticCompanies.length) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No companies found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={selectedIndustry === 'dental' 
                  ? dentalCompanies.length 
                  : aestheticCompanies.length
                }
                rowsPerPage={selectedIndustry === 'dental' 
                  ? dentalCompanyRowsPerPage 
                  : aestheticCompanyRowsPerPage
                }
                page={selectedIndustry === 'dental' ? dentalCompanyPage : aestheticCompanyPage}
                onPageChange={selectedIndustry === 'dental' 
                  ? handleDentalCompanyChangePage 
                  : handleAestheticCompanyChangePage
                }
                onRowsPerPageChange={selectedIndustry === 'dental' 
                  ? handleDentalCompanyChangeRowsPerPage 
                  : handleAestheticCompanyChangeRowsPerPage
                }
              />
            </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>
      {/* Procedure Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        maxWidth="md"
        fullWidth
        aria-labelledby="procedure-detail-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        {selectedProcedure && (
          <>
            <DialogTitle 
              id="procedure-detail-dialog-title" 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #eaeaea'
              }}
            >
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                {selectedProcedure.name || selectedProcedure.procedure_name}
              </Typography>
              <IconButton
                aria-label="close"
                onClick={handleCloseDetailModal}
                sx={{ color: '#94a3b8' }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              {/* Basic info chips at the top */}
              <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  icon={<CategoryIcon />} 
                  label={`Category: ${selectedProcedure.category || 'N/A'}`} 
                  variant="outlined" 
                  sx={{ 
                    bgcolor: 'rgba(25, 118, 210, 0.05)',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                />
                
                {selectedProcedure.yearly_growth_percentage !== null && selectedProcedure.yearly_growth_percentage !== undefined && (
                  <Chip 
                    icon={<TrendingUpIcon />} 
                    label={`Growth: ${selectedProcedure.yearly_growth_percentage.toFixed(1)}%`} 
                    variant="outlined" 
                    sx={{ 
                      bgcolor: selectedProcedure.yearly_growth_percentage > 0 ? 'rgba(46, 125, 50, 0.05)' : 'rgba(211, 47, 47, 0.05)',
                      borderColor: selectedProcedure.yearly_growth_percentage > 0 ? 'success.main' : 'error.main',
                      color: selectedProcedure.yearly_growth_percentage > 0 ? 'success.main' : 'error.main',
                      fontWeight: 500
                    }}
                  />
                )}
                
                {selectedProcedure.average_cost_usd !== null && selectedProcedure.average_cost_usd !== undefined && (
                  <Chip 
                    icon={<AttachMoneyIcon />} 
                    label={`Avg. Cost: $${selectedProcedure.average_cost_usd.toLocaleString()}`} 
                    variant="outlined" 
                    sx={{ 
                      bgcolor: 'rgba(2, 136, 209, 0.05)',
                      borderColor: 'info.main',
                      color: 'info.main',
                      fontWeight: 500
                    }}
                  />
                )}
              </Box>
              
              {/* Tabs for different sections */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  aria-label="procedure detail tabs"
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 500,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                    },
                    '& .Mui-selected': {
                      color: 'primary.main',
                    }
                  }}
                >
                  <Tab label="Overview" id="procedure-tab-0" aria-controls="procedure-tabpanel-0" />
                  <Tab label="Technical Details" id="procedure-tab-1" aria-controls="procedure-tabpanel-1" />
                  <Tab label="Market Data" id="procedure-tab-2" aria-controls="procedure-tabpanel-2" />
                </Tabs>
              </Box>
              
              {/* Overview Tab */}
              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4a5568' }}>
                      {selectedProcedure.description || selectedProcedure.expanded_description || 'No description available.'}
                    </Typography>
                  </Grid>
                  
                  {selectedIndustry === 'aesthetic' && selectedProcedure.body_areas_applicable && (
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Body Areas
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4a5568' }}>
                          {selectedProcedure.body_areas_applicable}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedIndustry === 'aesthetic' && selectedProcedure.downtime && (
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Downtime
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4a5568' }}>
                          {selectedProcedure.downtime}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedIndustry === 'dental' && selectedProcedure.cpt_cdt_code && (
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          CDT Code
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4a5568' }}>
                          {selectedProcedure.cpt_cdt_code}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
              
              {/* Technical Details Tab */}
              <TabPanel value={activeTab} index={1}>
                <Grid container spacing={3}>
                  {selectedProcedure.procedure_duration_min && (
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Procedure Duration
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4a5568' }}>
                          {selectedProcedure.procedure_duration_min} minutes
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedProcedure.recovery_time_days && (
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Recovery Time
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4a5568' }}>
                          {selectedProcedure.recovery_time_days} days
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedProcedure.complexity && (
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Complexity
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4a5568' }}>
                          {selectedProcedure.complexity}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedProcedure.patient_satisfaction_score && (
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Patient Satisfaction
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={selectedProcedure.patient_satisfaction_score * 10} 
                            sx={{ 
                              flexGrow: 1, 
                              mr: 2, 
                              height: 10, 
                              borderRadius: 5,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: 'primary.main',
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {selectedProcedure.patient_satisfaction_score}/10
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedProcedure.risks && (
                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Risks
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4a5568' }}>
                          {selectedProcedure.risks}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedProcedure.contraindications && (
                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Contraindications
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4a5568' }}>
                          {selectedProcedure.contraindications}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
              
              {/* Market Data Tab */}
              <TabPanel value={activeTab} index={2}>
                <Grid container spacing={3}>
                  {selectedProcedure.market_size_2025_usd_millions && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Market Size 2025
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {selectedProcedure.market_size_2025_usd_millions >= 1000 
                            ? `$${(selectedProcedure.market_size_2025_usd_millions/1000).toFixed(1)}B` 
                            : `$${selectedProcedure.market_size_2025_usd_millions.toLocaleString()}M`}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedProcedure.yearly_growth_percentage !== null && selectedProcedure.yearly_growth_percentage !== undefined && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Growth Rate
                        </Typography>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 700, 
                            color: selectedProcedure.yearly_growth_percentage > 0 ? 'success.main' : 'error.main' 
                          }}
                        >
                          {selectedProcedure.yearly_growth_percentage.toFixed(1)}%
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedProcedure.average_cost_usd && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                          Average Cost
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                          ${selectedProcedure.average_cost_usd.toLocaleString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eaeaea' }}>
              <Button 
                onClick={handleCloseDetailModal} 
                variant="contained" 
                disableElevation
                sx={{ 
                  textTransform: 'none', 
                  px: 3,
                  borderRadius: '6px',
                  fontWeight: 500
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;
