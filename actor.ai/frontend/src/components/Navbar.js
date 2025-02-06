import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          <RouterLink to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Actor Search
          </RouterLink>
        </Typography>
        {isAuthenticated ? (
          <>
            {isAdmin && (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/admin"
                style={{ marginRight: '1rem' }}
              >
                Admin Dashboard
              </Button>
            )}
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="inherit" component={RouterLink} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 