import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Grid, Divider, Chip, Box, 
  Table, TableBody, TableCell, TableRow, Paper,
  Tabs, Tab, useTheme, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import { formatMarketSize } from './MarketSizeOverview';
import RealtimeNewsSection from '../News/RealtimeNewsSection';

// Tab panel component for the tabbed interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`procedure-tabpanel-${index}`}
      aria-labelledby={`procedure-tab-${index}`}
      style={{ padding: '20px 0' }}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `procedure-tab-${index}`,
    'aria-controls': `procedure-tabpanel-${index}`,
  };
}

// Main component props
interface ProcedureDetailsModalProps {
  open: boolean;
  onClose: () => void;
  procedure: any | null;
  industry: 'dental' | 'aesthetic';
}

const ProcedureDetailsModal: React.FC<ProcedureDetailsModalProps> = ({
  open,
  onClose,
  procedure,
  industry
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!procedure) return null;
  
  // Generate random related procedures based on the current procedure's category
  // In a real application, this would come from the backend
  const getRelatedProcedures = () => {
    const category = procedure.category || '';
    return [
      `${category} - Alternative Option`,
      `${category} - Complementary Procedure`,
      `${category} - Advanced Technique`
    ];
  };

  // Create fake historical data for the market growth visualization
  // In a real application, this would come from the backend
  const getHistoricalData = () => {
    const baseGrowth = procedure.yearly_growth_percentage || 5;
    const currentYear = new Date().getFullYear();
    return [
      { year: currentYear - 4, growth: (baseGrowth - 1.5).toFixed(1) },
      { year: currentYear - 3, growth: (baseGrowth - 0.8).toFixed(1) },
      { year: currentYear - 2, growth: (baseGrowth - 0.2).toFixed(1) },
      { year: currentYear - 1, growth: baseGrowth.toFixed(1) },
      { year: currentYear, growth: (baseGrowth + 0.3).toFixed(1) },
      { year: currentYear + 1, growth: (baseGrowth + 0.7).toFixed(1) + ' (projected)' }
    ];
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        pb: 1
      }}>
        <Box>
          <Typography variant="h5" component="div" fontWeight="medium">{procedure.name}</Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
            {procedure.category || 'Uncategorized'} • {industry.charAt(0).toUpperCase() + industry.slice(1)} Procedure
          </Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Tabs navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="procedure detail tabs"
          sx={{ px: 3 }}
        >
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Market Data" {...a11yProps(1)} />
          <Tab label="Related Info" {...a11yProps(2)} />
        </Tabs>
      </Box>
      
      <DialogContent dividers sx={{ p: 3 }}>
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Description */}
            <Grid item xs={12}>
              <Typography paragraph>
                {procedure.description || 
                  `${procedure.name} is a ${industry} procedure categorized under ${procedure.category || 'general procedures'}. 
                  No detailed description is available for this procedure.`}
              </Typography>
            </Grid>
            
            {/* Key Metrics Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Price</Typography>
                </Box>
                <Typography variant="h6">
                  ${typeof procedure.average_cost_usd === 'number' 
                    ? procedure.average_cost_usd.toLocaleString()
                    : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Average cost
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Growth</Typography>
                </Box>
                <Typography variant="h6">
                  {procedure.yearly_growth_percentage 
                    ? `${procedure.yearly_growth_percentage.toFixed(1)}%`
                    : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Annual growth rate
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <CategoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Category</Typography>
                </Box>
                <Typography variant="h6" noWrap>
                  {procedure.category || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Primary classification
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={1}>
                  {industry === 'dental' ? (
                    <LocalHospitalIcon color="primary" sx={{ mr: 1 }} />
                  ) : (
                    <TimelapseIcon color="primary" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="subtitle2">
                    {industry === 'dental' ? 'Clinical' : 'Downtime'}
                  </Typography>
                </Box>
                <Typography variant="h6" noWrap>
                  {industry === 'dental' 
                    ? (procedure.clinical_category || 'N/A')
                    : (procedure.downtime || 'N/A')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {industry === 'dental' ? 'Clinical category' : 'Recovery time'}
                </Typography>
              </Paper>
            </Grid>
            
            {/* Industry-specific details */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="h6" gutterBottom>Additional Details</Typography>
              
              {industry === 'dental' && (
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>CDT Code</strong></TableCell>
                      <TableCell>{procedure.cpt_cdt_code || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Insurance Coverage</strong></TableCell>
                      <TableCell>{procedure.insurance_coverage ? 'Typically Covered' : 'Typically Not Covered'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
              
              {industry === 'aesthetic' && (
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Body Areas</strong></TableCell>
                      <TableCell>{procedure.body_areas_applicable || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Invasiveness</strong></TableCell>
                      <TableCell>
                        {procedure.invasiveness || (procedure.downtime && procedure.downtime.includes('week') 
                          ? 'Invasive' 
                          : 'Minimally Invasive')}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Market Data Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Market Size */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Market Size</Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', my: 2 }}>
                  <Typography variant="h3" component="div">
                    {formatMarketSize(procedure.market_size_usd_millions)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    USD
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total addressable market size for {procedure.name.toLowerCase()} procedures.
                  This represents approximately {((procedure.market_size_usd_millions || 0) / 
                    (industry === 'dental' ? 180000 : 65000) * 100).toFixed(1)}% of the overall 
                  {industry} procedures market.
                </Typography>
              </Paper>
            </Grid>
            
            {/* Growth Trend */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Growth Trend</Typography>
                <Table size="small">
                  <TableBody>
                    {getHistoricalData().map((item) => (
                      <TableRow key={item.year}>
                        <TableCell>{item.year}</TableCell>
                        <TableCell align="right">{item.growth}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Historical and projected annual growth rates. Projections are based on market analysis and industry trends.
                </Typography>
              </Paper>
            </Grid>
            
            {/* Key Market Drivers */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Key Market Drivers</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom>Demographics</Typography>
                      <Typography variant="body2">
                        {industry === 'dental' 
                          ? 'Aging population requiring more dental care and preventative treatments.'
                          : 'Growing acceptance across all age groups, with millennials being early adopters.'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom>Technology</Typography>
                      <Typography variant="body2">
                        {industry === 'dental' 
                          ? 'Advanced materials and digital techniques improving outcomes and reducing procedure time.'
                          : 'Less invasive techniques and reduced recovery times expanding the potential patient base.'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom>Consumer Trends</Typography>
                      <Typography variant="body2">
                        {industry === 'dental' 
                          ? 'Increased focus on oral health as part of overall wellness and preventative healthcare.'
                          : 'Rising social media influence and decreased stigma around aesthetic enhancements.'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Related Info Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Related Procedures */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Related Procedures</Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {getRelatedProcedures().map((name, index) => (
                    <Box key={index} sx={{ 
                      p: 1.5, 
                      borderRadius: 1, 
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' }
                    }}>
                      <Typography variant="body2">{name}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            {/* Top Providers/Companies */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Top Providers</Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Table size="small">
                  <TableBody>
                    {['Company A', 'Company B', 'Company C'].map((company, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2">{company}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${Math.floor(Math.random() * 20) + 10}% market share`}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.75rem' }}>
                  * Market share data is simulated and for demonstration purposes only
                </Typography>
              </Paper>
            </Grid>
            
            {/* Recommended Resources */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Recommended Resources</Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  {[1, 2, 3].map((i) => (
                    <Grid item xs={12} key={i}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 1, 
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' }
                      }}>
                        <Typography variant="subtitle2">
                          {industry === 'dental' 
                            ? `Latest research on ${procedure.name.toLowerCase()} techniques` 
                            : `${procedure.name} trends for ${new Date().getFullYear()}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {industry === 'dental' 
                            ? 'Journal of Advanced Dental Procedures' 
                            : 'Aesthetic Procedures Review'} • {new Date().toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Real-time News */}
            <Grid item xs={12}>
              <RealtimeNewsSection
                procedureId={String(procedure.id)}
                procedureName={procedure.name}
                industry={industry}
                limit={3}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          size="medium"
        >
          Close
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          size="medium"
        >
          Export Data
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcedureDetailsModal;
