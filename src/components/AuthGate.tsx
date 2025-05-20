import React from 'react';
import { Box, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Box position="relative">
        <Box sx={{ filter: 'blur(4px)', pointerEvents: 'none' }}>{children}</Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            p: 2,
          }}
        >
          <p>Please log in to view this content.</p>
          <Button variant="contained" href="/login.html">Log In</Button>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
