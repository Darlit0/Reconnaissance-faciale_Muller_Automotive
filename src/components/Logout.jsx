import { useNavigate } from 'react-router-dom';
import Button from './Button';

function Logout({ setIsAuthenticated, setIsAdmin, setMessage, addclass }) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      // Appel à l'API de déconnexion
      const response = await fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important pour les cookies
      });
      
      // Traitement de la réponse
      const data = await response.text();
      setMessage(data);
      
      // Réinitialisation de l'état côté client
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      // Redirection vers la page de connexion
      navigate('/');
    } catch (error) {
      setMessage(`Erreur lors de la déconnexion: ${error.message}`);
      console.error('Erreur de déconnexion:', error);
    }
  };
  
  return (
    <button class="btn-logout" onClick={handleLogout} style={{marginRight: "10px", backgroundColor:'#bd1717'}}>
      Deconnexion
    </button>
  );
}

export default Logout;