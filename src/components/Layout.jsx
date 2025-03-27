import Header from './Header';
import Aside from './Asideaa';
import CheckAuthStatus from './CheckAuthStatus';
import { Outlet } from "react-router-dom";
import { useState, useEffect } from 'react';


const Layout = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Vérifier le statut d'authentification au chargement
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Vérifier si l'utilisateur peut accéder à l'API admin
        const response = await fetch('http://localhost:3001/admin/users', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
          setIsAdmin(true);
        } else if (response.status === 401) {
          // Non connecté
          setIsAuthenticated(false);
          setIsAdmin(false);
        } else if (response.status === 403) {
          // Connecté mais pas admin
          setIsAuthenticated(true);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  return (

      <div style={{ flex: 1 }}>
        <Header 
          isAuthenticated={isAuthenticated} 
          isAdmin={isAdmin} 
          setIsAuthenticated={setIsAuthenticated} 
          setIsAdmin={setIsAdmin} 
          setMessage={setMessage}
        />
        <div style={{display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
          <Aside />
          <Outlet />
        </div>
      </div>
  );
};

export default Layout;
