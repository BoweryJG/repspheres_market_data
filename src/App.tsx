import React from 'react';
import EnhancedDashboard from './components/Dashboard/EnhancedDashboard';
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
          <EnhancedDashboard />
        </OrbContextProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
