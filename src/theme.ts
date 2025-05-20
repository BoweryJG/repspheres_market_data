import { createTheme, PaletteMode } from '@mui/material/styles';

export const ACCENT_COLOR = '#00ffc6';
export const BRAND_GRADIENT = 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)';

export const getTheme = (mode: PaletteMode = 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
      },
      secondary: {
        main: mode === 'light' ? '#dc004e' : '#f48fb1',
      },
      accent: {
        main: ACCENT_COLOR,
        contrastText: '#000',
      },
      brandGradient: BRAND_GRADIENT,
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.25rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.1rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
          },
          containedAccent: {
            background: BRAND_GRADIENT,
            color: '#000',
            '&:hover': {
              background: 'linear-gradient(90deg, #7B42F6 0%, #00ffc6 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottomColor:
              mode === 'dark' ? 'rgba(255,255,255,0.12)' : undefined,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor:
                mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.04)',
            },
          },
        },
      },
    },
  });
