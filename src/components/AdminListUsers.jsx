import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThrowAdminError from "./ThrowAdminError";
import { Link } from "react-router-dom";

function AdminListUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [userImages, setUserImages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Appel fetchUsers au montage ET lorsque l'URL change (retour de /Edit à /admin)
  useEffect(() => {
    fetchUsers();
  }, [location.pathname]);

  const fetchUserImages = async (userId) => {
    try {
      setLoadingImages(true);
      setSelectedUserId(userId);
  
      const response = await fetch(`http://localhost:3001/admin/images/${userId}`, {
        method: 'GET',
        credentials: 'include'
      });
  
      if (!response.ok) {
        // Si pas d'images trouvées, ce n'est pas une erreur critique
        if (response.status === 404) {
          setUserImages([]);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des images');
      }
  
      const imagesData = await response.json();
      setUserImages(imagesData);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des images: ' + err.message);
      setUserImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/admin/users', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 401) {
        setError('Veuillez vous connecter pour accéder à cette page');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (response.status === 403) {
        setError('Accès réservé aux administrateurs');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des utilisateurs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
    
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3001/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Erreur lors de la suppression de l\'utilisateur');
        return;
      }

      fetchUsers(); // Refresh users list
      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression de l\'utilisateur: ' + err.message);
    }
  };

  const handleEditUser = (user) => {
    // Naviguer vers la page d'édition avec l'ID de l'utilisateur
    navigate(`/Edit/${user.id}`, { state: { user } });
  };

  if (error) {
    return <ThrowAdminError error={error} setError={setError} />
  }

  return (
    
    <>
      
      {/* List of users */}
      <div className="admin-section" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <h2>Liste des utilisateurs</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <table style={{width: '75%'}}>
            <thead  >
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Role</th>
                <th>Modifier</th>
                <th>Supprimer</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nom}</td>
                  <td>{user.prenom}</td>
                  <td>{user.role}</td>
                  <td style={{}}>
                    <button className="btn-primary btn-action" onClick={() => handleEditUser(user)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width={"25px"} height={"25px"} fill="white"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l293.1 0c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7l40.3-40.3c-32.1-31-75.7-50.1-123.9-50.1l-91.4 0zm435.5-68.3c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM375.9 417c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L576.1 358.7l-71-71L375.9 417z"/></svg></button>
                  </td>
                  <td style={{}}>
                    <button className="btn-primary btn-action" onClick={() => handleDeleteUser(user.id)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width={"25px"} height={"25px"} fill="white"><path d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM471 143c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg></button>
                  </td>
                  <td style={{alignItems: 'center'}}>
                    <button className="btn-primary btn-action" onClick={() => fetchUserImages(user.id)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width={"25px"} height={"25px"} fill="white"><path d="M384 64c0-35.3-28.7-64-64-64L64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-384zM128 192a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM80 356.6c0-37.9 30.7-68.6 68.6-68.6l86.9 0c37.9 0 68.6 30.7 68.6 68.6c0 15.1-12.3 27.4-27.4 27.4l-169.1 0C92.3 384 80 371.7 80 356.6z"/></svg></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Display selected user images if any */}
      {selectedUserId && (
        <div className="user-images-section">
          <h3>Images de l'utilisateur #{selectedUserId}</h3>
          {loadingImages ? (
            <p>Chargement des images...</p>
          ) : userImages.length > 0 ? (
            <div className="image-gallery">
              {userImages.map((imageData, index) => (
                <div key={index} className="image-item">
                  <img style={{width: '100%'}} src={imageData} alt={`User ${selectedUserId} image ${index}`} />
                </div>
              ))}
            </div>
          ) : (
            <p>Aucune image pour cet utilisateur</p>
          )}
        </div>
      )}
    </>
  );
}
  
export default AdminListUsers;