import React from 'react';
import Dashboard from './components/Dashboard/DashboardFixed';
import { OrbContextProvider } from './assets/OrbContextProvider';
import NavBar from './assets/menubar';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrbContextProvider>
          <NavBar />
          <Dashboard />
        </OrbContextProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
