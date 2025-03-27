import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ThrowAdminError from "./ThrowAdminError";

function AdminEditUser() {
  const navigate = useNavigate();
  const { userId } = useParams(); // Récupère l'ID de l'utilisateur depuis l'URL
  const location = useLocation();
  const userFromState = location.state?.user; // Récupère l'utilisateur depuis l'état de navigation

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Initialiser l'utilisateur depuis l'état ou le récupérer depuis l'API
  useEffect(() => {
    if (userFromState) {
      // Si l'utilisateur est passé via l'état de navigation
      setEditingUser(userFromState);
      fetchUserImage(userFromState.id);
    } else if (userId) {
      // Sinon, récupérer l'utilisateur depuis l'API
      fetchUser(userId);
      fetchUserImage(userId);
    } else {
      // Si pas d'ID, rediriger vers la liste
      setError("Aucun utilisateur sélectionné");
      setTimeout(() => navigate('/admin'), 3000);
    }
  }, [userId, userFromState]);

  const fetchUser = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/admin/users/${id}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 401) {
        setError('Veuillez vous connecter pour accéder à cette page');
        setTimeout(() => navigate('/login'), 3000);
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
      setEditingUser(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération de l\'utilisateur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserImage = async (id) => {
    try {
      setLoadingImage(true);
      const response = await fetch(`http://localhost:3001/admin/images/${id}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        // Si pas d'images trouvées, ce n'est pas une erreur critique
        if (response.status === 404) {
          setUserImage(null);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des images');
      }

      const imagesData = await response.json();
      // On prend seulement la première image (ou null si tableau vide)
      setUserImage(imagesData.length > 0 ? imagesData[0] : null);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération de l\'image: ' + err.message);
      setUserImage(null);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Créer une prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      // Mise à jour des infos utilisateur
      const userResponse = await fetch(`http://localhost:3001/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editingUser),
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        setError(userData.message || "Erreur lors de la mise à jour de l'utilisateur");
        return;
      }

      // Si une nouvelle image a été sélectionnée, gérer le remplacement d'image
      if (imageFile) {
        // D'abord, supprimons l'image existante si elle existe
        if (userImage) {
          try {
            // On essaie de récupérer toutes les images actuelles
            const imagesResponse = await fetch(`http://localhost:3001/admin/images/${editingUser.id}`, {
              method: 'GET',
              credentials: 'include'
            });
            
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              
              // Si l'utilisateur a des images, on les supprime une par une
              for (let i = 0; i < imagesData.length; i++) {
                await fetch(`http://localhost:3001/admin/images/${editingUser.id}/${i}`, {
                  method: 'DELETE',
                  credentials: 'include'
                });
              }
            }
          } catch (error) {
            console.error("Erreur lors de la suppression des images existantes:", error);
            // Même si la suppression échoue, on continue pour essayer d'ajouter la nouvelle image
          }
        }

        // Ensuite, ajoutons la nouvelle image
        const formData = new FormData();
        formData.append('image', imageFile);

        const imageResponse = await fetch(`http://localhost:3001/admin/upload-images/${editingUser.id}`, {
          method: "POST", // Utilisation de POST comme indiqué dans l'API
          credentials: "include",
          body: formData,
        });

        if (!imageResponse.ok) {
          const imageData = await imageResponse.json();
          setError(imageData.message || "Erreur lors de la mise à jour de l'image");
          return;
        }
      }

      // Redirection vers la liste après mise à jour
      navigate('/admin');
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'utilisateur: " + err.message);
    }
  };

  if (error) {
    return <ThrowAdminError error={error} setError={setError} />;
  }

  if (loading || !editingUser) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="admin-edit-section">
      <h2 style={{color:'black'}}>Modifier l'utilisateur</h2>
      <form onSubmit={handleUpdateUser}>
        <div className="form-group">
          <label>Nom:</label>
          <input
            type="text"
            value={editingUser.nom}
            onChange={(e) => setEditingUser({ ...editingUser, nom: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Prénom:</label>
          <input
            type="text"
            value={editingUser.prenom}
            onChange={(e) => setEditingUser({ ...editingUser, prenom: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Rôle:</label>
          <select
            value={editingUser.role}
            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
            required
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Image de profil:</label>
          {loadingImage ? (
            <p>Chargement de l'image...</p>
          ) : (
            <div className="image-upload-container">
              {userImage && (
                <div className="image-preview">
                  <img 
                    src={userImage} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '200px' }} 
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
              />
              <p className="image-help">
                {userImage 
                  ? "Sélectionner une nouvelle image pour remplacer l'actuelle" 
                  : "Sélectionner une image pour cet utilisateur"}
              </p>
            </div>
          )}
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="btn-primary" onClick={() => navigate('/admin')}>
            Enregistrer
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/admin')}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminEditUser;