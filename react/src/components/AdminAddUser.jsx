import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import ThrowAdminError from "./ThrowAdminError";
import Image from "./Image";
import Button from '/src/components/Button';
import { Link } from "react-router-dom";

function AdminAddUser() {
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState({ nom: '', prenom: '', role: 'user'});
  const [error, setError] = useState(null);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageError, setImageError] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setError('Aucun fichier sélectionné.');
      setImageError(true);
      return;
    }

    const file = acceptedFiles[0];
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Type de fichier non valide. Veuillez sélectionner une image.');
      setImageError(true);
      return;
    }
    setImageUpload(file);
    setImageError(false);
    setError(null);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif'],
    },
    maxFiles: 1,
  });

  // Modification de la fonction handleCreateUser dans le composant AdminAddUser

const handleCreateUser = async (e) => {
  e.preventDefault();
  
  // Vérifier si une image a été téléchargée
  if (!imageUpload) {
    setError('Veuillez télécharger une image. L\'image est obligatoire.');
    setImageError(true);
    return;
  }
  
  try {
    // Créer l'utilisateur d'abord
    const response = await fetch('http://localhost:3001/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(newUser)
    });
    
    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Erreur lors de la création de l\'utilisateur');
      return;
    }
    
    // Récupérer le dernier utilisateur créé pour obtenir son ID
    const lastUserResponse = await fetch('http://localhost:3001/admin/last-user', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (lastUserResponse.ok && imageUpload) {
      const lastUser = await lastUserResponse.json();
      
      if (lastUser.id) {
        const imageFormData = new FormData();
        
        // Renommer le fichier pour éviter les problèmes avec certains caractères spéciaux
        const fileName = imageUpload.name.replace(/[^\w\s.-]/gi, '');
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const newFile = new File(
          [imageUpload], 
          `user_${lastUser.id}.${fileExtension}`, 
          { type: imageUpload.type }
        );
        
        imageFormData.append('image', newFile);
        
        // Afficher le contenu FormData pour débogage
        console.log("FormData créé pour l'upload d'image");
        
        const imageResponse = await fetch(`http://localhost:3001/admin/upload-images/${lastUser.id}`, {
          method: 'POST',
          credentials: 'include',
          body: imageFormData
        });
        
        if (!imageResponse.ok) {
          const imageError = await imageResponse.json();
          setError('Erreur lors du téléchargement de l\'image: ' + (imageError.message || 'Erreur inconnue'));
          return;
        }
      }
    }
    
    // Réinitialiser le formulaire après création réussie
    setNewUser({ nom: '', prenom: '', role: 'user'});
    setImageUpload(null);
    setError(null);
    
    // Redirection vers la page admin après création réussie
    navigate('/admin');
    
  } catch (err) {
    console.error("Erreur complète:", err);
    setError('Erreur lors de la création de l\'utilisateur: ' + err.message);
  }
};

const handleReturn = async () => {
  navigate('/admin');
}
  
  if (error && error !== 'Veuillez télécharger une image. L\'image est obligatoire.') {
    return <ThrowAdminError error={error} setError={setError} />;
  }

  return (
    <div className="admin-section">
      <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <h2>Ajouter un utilisateur</h2>
        <div style={{display: 'flex', flexDirection: 'column', alignItems:'flex-end', marginBottom: '15px'}}>
          <div className="form-group">
            <label>Nom: </label>
            <input
              style={{borderRadius:"12px", marginBottom:"10px"}}
              type="text"
              value={newUser.nom}
              onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Prénom: </label>
            <input
              style={{borderRadius:"12px"}}
              type="text"
              value={newUser.prenom}
              onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Image: <span className="required-field">*</span></label>
          <div
            {...getRootProps()}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: imageError ? "2px dashed #ff0000" : "2px dashed #CD121D",
              background: imageError ? "#ffeeee" : "#f0f0f0",
              padding: "20px",
              cursor: "pointer",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <input {...getInputProps()} />
            {imageUpload ? (
              <>
                <Image src={URL.createObjectURL(imageUpload)} height="328px" width="328px" />
                <p>Fichier sélectionné : {imageUpload.name}</p>
              </>
            ) : (
              <>
                <Image src="/src/assets/images/IcoOutline.svg" height="328px" width="328px" />
                <p>Glissez-déposez une image ici, ou cliquez pour sélectionner un fichier</p>
                {imageError && <p style={{ color: 'red', fontWeight: 'bold' }}>L'image est obligatoire</p>}
              </>
            )}
          </div>
          {error === 'Veuillez télécharger une image. L\'image est obligatoire.' && 
            <p style={{ color: 'red', margin: '5px 0' }}>{error}</p>
          }
        </div>
        <div className="form-group" style={{marginTop: '20px'}}>
          <label>Rôle:</label>
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            required
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '75%', marginTop: '20px'}}>
          <button  type="submit" className="btn-primary">Valider</button>
          <button className="btn-secondary" onClick={handleReturn}> Annuler </button>
        </div>
      </form>
    </div>
  );
}

export default AdminAddUser;