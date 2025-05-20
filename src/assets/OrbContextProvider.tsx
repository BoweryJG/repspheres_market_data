import React, { createContext, useContext, useState, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { ORB_GRADIENT } from '../context/ThemeContext';

// Define the type for the orb context
interface OrbContextType {
  gradientColors: {
    start: string;
    end: string;
  };
}

// Define the type for the color mode context
interface ColorModeContextType {
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
}

// Create the Orb context
const OrbContext = createContext<OrbContextType>({
  gradientColors: ORB_GRADIENT
});

// Create the color mode context
const ColorModeContext = createContext<ColorModeContextType>({
  colorMode: 'dark',
  toggleColorMode: () => {}
});

export const OrbContextProvider = ({ children }: { children: React.ReactNode }) => {
  // State for color mode
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const theme = useTheme();
  
  // Color mode toggle function
  const colorMode = useMemo(
    () => ({
      colorMode: mode,
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode],
  );

  // Orb context values pulled from the theme
  const orbValues = {
    gradientColors: (theme as any).customGradients?.orb || ORB_GRADIENT
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <OrbContext.Provider value={orbValues}>
        {children}
      </OrbContext.Provider>
    </ColorModeContext.Provider>
  );
};

export const useOrbContext = () => useContext(OrbContext);
export const useColorMode = () => useContext(ColorModeContext);
