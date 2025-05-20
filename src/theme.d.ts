import '@mui/material/styles';
import '@mui/material/Button';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    brandGradient: string;
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    brandGradient?: string;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}
