import React, { createContext, useContext } from 'react';

// Minimal context to satisfy menubar usage
const OrbContext = createContext({
  gradientColors: { start: '#00ffc6', end: '#7B42F6' }
});

export const OrbContextProvider = ({ children }: { children: React.ReactNode }) => (
  <OrbContext.Provider value={{ gradientColors: { start: '#00ffc6', end: '#7B42F6' } }}>
    {children}
  </OrbContext.Provider>
);

export const useOrbContext = () => useContext(OrbContext);
