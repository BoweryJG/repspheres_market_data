import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  Alert,
  Link,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Science as ScienceIcon,
  Article as ArticleIcon,
  LocalHospital as HospitalIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Search as SearchIcon,
  OpenInNew as OpenInNewIcon,
  AutoAwesome as AIIcon,
  Biotech as BiotechIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { search as braveSearch } from '../../services/braveSearchService';

interface ProcedureDetailsModalProps {
  open: boolean;
  onClose: () => void;
  procedure: any;
  industry: 'dental' | 'aesthetic';
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const ProcedureDetailsModal: React.FC<ProcedureDetailsModalProps> = ({
  open,
  onClose,
  procedure,
  industry,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && procedure && tabValue === 1) {
      fetchProcedureInsights();
    }
  }, [open, procedure, tabValue]);

  const fetchProcedureInsights = async () => {
    if (!procedure) return;

    setLoading(true);
    setError(null);

    try {
      const procedureName = procedure.name || procedure.procedure_name;
      const searchQuery = `${procedureName} ${industry} procedure latest research innovations 2025`;

      const results = await braveSearch(searchQuery, 10);
      setSearchResults(results);
    } catch (err) {
      console.error('Error fetching procedure insights:', err);
      setError('Failed to fetch latest insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!procedure) return null;

  const procedureName = procedure.name || procedure.procedure_name || 'Unknown Procedure';
  const description = procedure.description || procedure.expanded_description || 'No description available';
  const averageCost = procedure.average_cost_usd;
  const growthRate = procedure.yearly_growth_percentage;
  const marketSize = procedure.market_size_2025_usd_millions;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      {/* Header with gradient background */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
          color: 'white',
          p: 3,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <HospitalIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {procedureName}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {procedure.category || procedure.clinical_category || industry} Procedure
            </Typography>
          </Box>
        </Box>

        {/* Key metrics */}
        <Grid container spacing={2}>
          {averageCost && (
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Average Cost
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ${averageCost.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          {growthRate && (
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Growth Rate
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {growthRate > 0 ? '+' : ''}{growthRate}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          {marketSize && (
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon />
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Market Size
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ${marketSize >= 1000 ? `${(marketSize / 1000).toFixed(1)}B` : `${marketSize}M`}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      <DialogContent sx={{ backgroundColor: '#0f172a', color: 'white' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 2,
          }}
        >
          <Tab label="Overview" icon={<HospitalIcon />} iconPosition="start" />
          <Tab label="Latest Research" icon={<AIIcon />} iconPosition="start" />
          <Tab label="Clinical Details" icon={<BiotechIcon />} iconPosition="start" />
          <Tab label="Market Analysis" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={0} sx={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#06B6D4' }}>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {industry === 'dental' && procedure.procedure_duration_min && (
              <Grid item xs={12} sm={6}>
                <Card elevation={0} sx={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TimerIcon sx={{ color: '#06B6D4' }} />
                      <Typography variant="h6" sx={{ color: 'white' }}>Procedure Duration</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ color: '#06B6D4' }}>
                      {procedure.procedure_duration_min} min
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {procedure.patient_satisfaction_score && (
              <Grid item xs={12} sm={6}>
                <Card elevation={0} sx={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckIcon sx={{ color: '#10B981' }} />
                      <Typography variant="h6" sx={{ color: 'white' }}>Patient Satisfaction</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h4" sx={{ color: '#10B981' }}>
                        {procedure.patient_satisfaction_score}/5
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(procedure.patient_satisfaction_score / 5) * 100}
                        sx={{ 
                          flexGrow: 1, 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#10B981'
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {procedure.risks && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Risks & Considerations
                  </Typography>
                  <Typography variant="body2">{procedure.risks}</Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Latest Research Tab */}
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : searchResults && searchResults.web && searchResults.web.results ? (
            <List>
              {searchResults.web.results.map((result: any, index: number) => (
                <Paper key={index} elevation={0} sx={{ 
                  mb: 2, 
                  p: 2, 
                  backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <ListItem alignItems="flex-start" disablePadding>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <ArticleIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Link
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 600,
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {result.title}
                          <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
                        </Link>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" paragraph sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {result.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {new URL(result.url).hostname}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Typography>No research results available</Typography>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={fetchProcedureInsights}
              disabled={loading}
            >
              Refresh Research
            </Button>
          </Box>
        </TabPanel>

        {/* Clinical Details Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {industry === 'dental' && (
              <>
                {procedure.cpt_cdt_code && (
                  <Grid item xs={12} sm={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          CDT Code
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                          {procedure.cpt_cdt_code}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {procedure.complexity && (
                  <Grid item xs={12} sm={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Complexity Level
                        </Typography>
                        <Chip
                          label={procedure.complexity}
                          sx={{ 
                            fontSize: '1.1rem', 
                            padding: '6px 16px',
                            backgroundColor: procedure.complexity === 'High' ? '#EF4444' :
                                           procedure.complexity === 'Medium' ? '#F59E0B' : '#10B981',
                            color: 'white'
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {procedure.recovery_time_days && (
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Recovery Time
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                          {procedure.recovery_time_days} days
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </>
            )}

            {industry === 'aesthetic' && (
              <>
                {procedure.downtime && (
                  <Grid item xs={12} sm={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Downtime
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white' }}>{procedure.downtime}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {procedure.number_of_sessions && (
                  <Grid item xs={12} sm={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Number of Sessions
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                          {procedure.number_of_sessions}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {procedure.results_duration && (
                  <Grid item xs={12} sm={6}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Results Duration
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'white' }}>{procedure.results_duration}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                {procedure.body_areas_applicable && (
                  <Grid item xs={12}>
                    <Card elevation={0} sx={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Applicable Body Areas
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>{procedure.body_areas_applicable}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </>
            )}

            {procedure.contraindications && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Contraindications
                  </Typography>
                  <Typography variant="body2">{procedure.contraindications}</Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Market Analysis Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={0} sx={{ 
                backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                border: '1px solid rgba(6, 182, 212, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PsychologyIcon sx={{ color: '#06B6D4' }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>AI Market Insights</Typography>
                  </Box>
                  <Typography variant="body1" paragraph sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Based on current market trends, {procedureName} shows {growthRate > 5 ? 'strong' : 'moderate'} growth
                    potential with an annual growth rate of {growthRate}%.
                  </Typography>
                  {marketSize && (
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      The current market size is estimated at ${marketSize >= 1000 ? `${(marketSize / 1000).toFixed(1)} billion` : `${marketSize} million`},
                      making it a {marketSize >= 500 ? 'significant' : 'growing'} segment in the {industry} industry.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                    Market Drivers
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon sx={{ color: '#10B981' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Increasing patient awareness" 
                        primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon sx={{ color: '#10B981' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Technological advancements" 
                        primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon sx={{ color: '#10B981' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Growing disposable income" 
                        primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                    Future Outlook
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    The {procedureName} market is expected to continue its growth trajectory,
                    driven by technological innovations and increasing demand for
                    {industry === 'aesthetic' ? ' minimally invasive procedures' : ' preventive dental care'}.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: '#0f172a', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<AIIcon />}
          onClick={() => {
            // Could trigger more detailed analysis or export
            console.log('Generate detailed report for:', procedureName);
          }}
        >
          Generate Full Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcedureDetailsModal;
