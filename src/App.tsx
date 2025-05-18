import React from 'react';
import Dashboard from './components/Dashboard/DashboardFixed';
import { OrbContextProvider } from './assets/OrbContextProvider';
import NavBar from './assets/menubar';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <OrbContextProvider>
        <NavBar />
        <Dashboard />
      </OrbContextProvider>
    </ThemeProvider>
  );
};

export default App;
