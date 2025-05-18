import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import InsightsIcon from '@mui/icons-material/Insights';
import AppsIcon from '@mui/icons-material/Apps';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import LanguageIcon from '@mui/icons-material/Language';
import LoginIcon from '@mui/icons-material/Login';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardIcon from '@mui/icons-material/Dashboard'; // For Workspace
import MemoryIcon from '@mui/icons-material/Memory'; // For Sphere OS
// Explicitly import with type information to resolve module not found error
import { useOrbContext } from './OrbContextProvider';
import ThemeToggle from '../components/ThemeToggle'; // Import ThemeToggle component

// Fallback type definition in case import fails
type OrbContextType = {
  gradientColors: {
    start: string;
    end: string;
  };
};
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ACCENT_COLOR = '#00ffc6';
const navLinks = [
  { label: 'RepSpheres Home', href: 'https://repspheres.com', emphasize: false, icon: <AppsIcon sx={{ mr: 1, fontSize: 24, color: ACCENT_COLOR }} /> },
  { label: 'Market Insights', href: 'https://insights.repspheres.com/dashboard', emphasize: false, icon: <InsightsIcon sx={{ mr: 1, fontSize: 24, color: ACCENT_COLOR }} />, fire: true },
  { label: 'Workspace', href: 'https://workspace.repspheres.com/', emphasize: false, icon: <DashboardIcon sx={{ mr: 1, fontSize: 24, color: ACCENT_COLOR }} /> },
  { label: 'Linguistics', href: 'https://linguistics.repspheres.com/', emphasize: false, icon: <LanguageIcon sx={{ mr: 1, fontSize: 24, color: ACCENT_COLOR }} /> },
  { label: 'Sphere OS', href: 'https://crm.repspheres.com/', emphasize: false, icon: <MemoryIcon sx={{ mr: 1, fontSize: 24, color: ACCENT_COLOR }} /> },
  { label: 'Podcast', href: '/podcast.html', emphasize: true, icon: <PodcastsIcon sx={{ mr: 1, fontSize: 24, color: ACCENT_COLOR }} /> },
];

// Animated fire underline keyframes
const fireUnderlineAnim = {
  '@keyframes fireUnderline': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
};


export default function NavBar() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get current URL to determine which page we're on
  const currentUrl = window.location.href;
  
  // Get the gradient colors from context
  const { gradientColors } = useOrbContext();

  // Orb SVG for brand - now using the shared gradient colors
  const orb = (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ marginRight: 10, filter: 'drop-shadow(0 0 6px #7B42F6AA)' }}>
      <defs>
        <radialGradient id="orbGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={gradientColors.start} />
          <stop offset="100%" stopColor={gradientColors.end} />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#orbGrad)" opacity="0.85" />
      <circle cx="16" cy="16" r="8" fill="#fff" opacity="0.08" />
    </svg>
  );

  const navButtonStyle = {
    fontWeight: 400,
    letterSpacing: '0.04em',
    fontSize: '1.04rem',
    px: 1.2,
    py: 0,
    borderRadius: 0,
    background: 'none',
    boxShadow: 'none',
    transition: 'color 0.2s, border-bottom 0.2s',
    borderBottom: '2px solid transparent',
    '&:hover': {
      color: '#3a86ff',
      background: 'none',
      borderBottom: '2px solid #3a86ff',
      boxShadow: 'none',
    },
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{
      background: 'rgba(24,24,43,0.52)',
      WebkitBackdropFilter: 'blur(18px) saturate(130%)',
      boxShadow: '0 8px 32px 0 rgba(123,66,246,0.17)',
      border: '1.5px solid rgba(123,66,246,0.13)',
      transition: 'background 0.24s',
      backdropFilter: 'blur(22px)',
      borderBottom: '1.5px solid rgba(123,66,246,0.10)',
      zIndex: 1200,
      borderRadius: { xs: '0 0 18px 18px', md: '0 0 32px 32px' },
      mx: { xs: 1, md: 3 },
      mt: { xs: 1, md: 2 },
      width: { xs: 'calc(100% - 8px)', md: 'calc(100% - 48px)' },
      fontFamily: 'Montserrat, DM Sans, Arial, sans-serif',
      fontWeight: 700,
      color: '#fff',
      marginLeft: 6,
      letterSpacing: '0.01em',
      display: 'flex',
      alignItems: 'center',
    }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 900, fontSize: { xs: '1.35rem', md: '1.10rem' }, letterSpacing: '0.09em', color: '#fff', userSelect: 'none' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {/* Responsive orb logo size */}
            <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 2 }}>
              <span style={{ width: 32, height: 32, display: 'inline-block' }}>
                <span style={{ display: 'none' }}>{/* for SSR safety */}</span>
                <span style={{ width: 26, height: 26, display: 'none' }}></span>
                <span style={{ display: 'inline-block', width: '100%', height: '100%' }}>{orb}</span>
              </span>
            </span>
            <span style={{ fontWeight: 800, letterSpacing: '0.09em', marginRight: 2 }}>Rep</span>
            <span style={{
              background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              letterSpacing: '0.09em',
              transition: 'background 0.4s',
            }}>
              Spheres
            </span>
          </span>
          {/* Desktop divider and spacing */}
          {!isMobile && (
            <>
              <Box sx={{ width: 24 }} />
              <Box sx={{ height: 36, display: 'flex', alignItems: 'center', mx: 1 }}>
                <span style={{
                  borderLeft: '2px solid rgba(255,255,255,0.13)',
                  height: 28,
                  margin: '0 16px',
                  display: 'inline-block',
                }} />
              </Box>
              <Box sx={{ width: 16 }} />
            </>
          )}
        </Box>
        {isMobile ? (
          // Mobile: add More menu and RepSpheres Home link
          <>
            <IconButton edge="end" color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon sx={{ fontSize: 32 }} />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{
                sx: {
                  background: 'rgba(20,14,38,0.96)',
                  borderLeft: '2.5px solid',
                  borderImage: 'linear-gradient(180deg, #7B42F6 0%, #00ffc6 100%) 1',
                  minWidth: 260,
                  borderTopLeftRadius: 26,
                  borderBottomLeftRadius: 26,
                  boxShadow: '0 8px 48px 4px #7B42F633',
                  p: 1,
                }
              }}
            >
              <List sx={{ mt: 4 }}>
                {navLinks
                  // Filter out Market Insights link if we're already on that page
                  .filter(link => !(link.label === 'Market Insights' && 
                    (currentUrl.includes('/dashboard') || currentUrl.includes('insights.repspheres.com'))))
                  .map((link) => (
                  <ListItem key={link.label} disablePadding>
                    <ListItemButton
                      component="a"
                      href={link.href}
                      sx={{
                        ...navButtonStyle,
                        opacity: link.emphasize ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '1.09rem',
                        mb: 1,
                        color: '#fff',
                      }}
                    >
                      {link.icon}{link.label}
                    </ListItemButton>
                  </ListItem>
                ))}
                {/* More Menu in Drawer */}
                <ListItem disablePadding>
                  <MenuItem component="a" href="https://repspheres.com/about" sx={{ color: '#fff' }}>About RepSpheres</MenuItem>
                </ListItem>
                <ListItem disablePadding>
                  <MenuItem component="a" href="https://repspheres.com/contact" sx={{ color: '#fff' }}>Contact</MenuItem>
                </ListItem>
                <ListItem disablePadding>
                  <MenuItem component="a" href="https://repspheres.com/careers" sx={{ color: '#fff' }}>Careers</MenuItem>
                </ListItem>
                <ListItem disablePadding>
                  <MenuItem component="a" href="https://repspheres.com/legal" sx={{ color: '#fff' }}>Legal</MenuItem>
                </ListItem>
                {/* Theme Toggle in Mobile Menu */}
                <ListItem disablePadding>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', px: 2, py: 1 }}>
                    <span style={{ color: '#fff' }}>Toggle Theme</span>
                    <ThemeToggle />
                  </Box>
                </ListItem>
                <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', my: 1, mx: 2 }} />
                {/* End More Menu */}
                <ListItem disablePadding>
                  <ListItemButton component="a" href="/login.html" sx={{
                    ...navButtonStyle,
                    border: '1.5px solid #fff',
                    color: '#fff',
                    mt: 2,
                    mb: 1,
                  }}>
                    <ListItemText primary="Log In" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component="a" href="/signup.html" sx={{
                    ...navButtonStyle,
                    mt: 2,
                    background: 'linear-gradient(135deg, #7B42F6 0%, #00ffc6 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(123,66,246,0.20)',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    borderRadius: '32px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5B3CFF 0%, #00ffc6 100%)',
                      color: '#fff',
                      transform: 'scale(1.04)'
                    }
                  }}>
                    <ListItemText primary="Sign Up" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Drawer>
          </>
        ) : (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            justifyContent: 'center',
            width: '100%',
          }}>
            {navLinks
              // Filter out Market Insights link if we're already on that page
              .filter(link => !(link.label === 'Market Insights' && 
                (currentUrl.includes('/dashboard') || currentUrl.includes('insights.repspheres.com'))))
              .map((link) => (
              <Box key={link.label} sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Button
                  href={link.href}
                  sx={{
                    ...navButtonStyle,
                    opacity: link.emphasize ? 0.7 : 1,
                    color: '#fff',
                    fontWeight: 400,
                    fontSize: '1.04rem',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 0,
                    px: 1.8,
                    mx: 0.5,
                    background: 'none',
                    boxShadow: 'none',
                    position: 'relative',
                    zIndex: 2,
                    ...(link.fire ? fireUnderlineAnim : {}),
                  }}
                  disableRipple
                >
                  {link.icon}{link.label}
                  <Box
                    className="nav-underline"
                    sx={{
                      position: 'absolute',
                      left: '10%',
                      bottom: 6,
                      height: 3,
                      width: 0,
                      borderRadius: 2,
                      opacity: 0,
                      background: 'linear-gradient(90deg, #7B42F6 0%, #00ffc6 100%)',
                      transition: 'width 0.32s cubic-bezier(.8,.2,.2,1), opacity 0.22s',
                      zIndex: 1,
                    }}
                  />
                </Button>
              </Box>
            ))}
            {/* More dropdown menu for desktop */}
            <React.Fragment>
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={event => setMenuAnchorEl(event.currentTarget)}
                sx={{ color: '#fff', ml: 1 }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={() => setMenuAnchorEl(null)}
                PaperProps={{
                  style: {
                    background: 'rgba(30, 20, 60, 0.96)',
                    color: '#fff',
                    borderRadius: 12,
                  },
                }}
              >
                {/* Theme Toggle in Menu */}
                <MenuItem onClick={() => setMenuAnchorEl(null)} sx={{ color: '#fff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>Toggle Theme</span>
                    <ThemeToggle />
                  </Box>
                </MenuItem>
                <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', my: 1 }} />
                <MenuItem component="a" href="https://repspheres.com/about" onClick={() => setMenuAnchorEl(null)} sx={{ color: '#fff' }}>About RepSpheres</MenuItem>
                <MenuItem component="a" href="https://repspheres.com/contact" onClick={() => setMenuAnchorEl(null)} sx={{ color: '#fff' }}>Contact</MenuItem>
                <MenuItem component="a" href="https://repspheres.com/careers" onClick={() => setMenuAnchorEl(null)} sx={{ color: '#fff' }}>Careers</MenuItem>
                <MenuItem component="a" href="https://repspheres.com/legal" onClick={() => setMenuAnchorEl(null)} sx={{ color: '#fff' }}>Legal</MenuItem>
              </Menu>
            </React.Fragment>
            <Button
              href="/login.html"
              variant="outlined"
              startIcon={<LoginIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...navButtonStyle,
                border: '1.5px solid #fff',
                color: '#fff',
                ml: 2,
                fontWeight: 500,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(6px)',
                borderRadius: '18px',
                px: 2.2,
                fontSize: '1.04rem',
                letterSpacing: '0.04em',
                boxShadow: '0 1px 6px rgba(58,134,255,0.10)',
                transition: 'all 0.18s',
                '&:hover': {
                  background: 'rgba(58,134,255,0.18)',
                  color: '#3a86ff',
                  borderColor: '#3a86ff',
                }
              }}
            >
              Log In
            </Button>
            <Button
              href="/signup.html"
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 20 }} />}
              sx={{
                ...navButtonStyle,
                background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
                color: '#fff',
                fontWeight: 700,
                ml: 2,
                px: 2.8,
                borderRadius: '24px',
                fontSize: '1.09rem',
                letterSpacing: '0.04em',
                boxShadow: '0 2px 18px 0 rgba(123,66,246,0.13)',
                transition: 'all 0.22s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #5B3CFF 0%, #00ffc6 100%)',
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
