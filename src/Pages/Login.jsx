import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import checkAuthStatus from "/src/components/CheckAuthStatus";
import Image from "/src/components/Image";
import UploadImage from "/src/components/UploadImage";
import Button from "/src/components/Button";

import "/src/App.css";

function Login({ setIsAuthenticated, setIsAdmin, setMessage, message }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setMessage('Aucun fichier sélectionné.');
      return;
    }

    const file = acceptedFiles[0];
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setMessage('Type de fichier non valide. Veuillez sélectionner une image.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.text();
      setMessage(data);

      if (!response.ok) {
        throw new Error('Échec de la connexion');
      }

      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus.isAuthenticated);
      setIsAdmin(authStatus.isAdmin);

      if (authStatus.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [setIsAuthenticated, setIsAdmin, setMessage, navigate]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg'],
    },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div className="login-container">
      <h2>Connexion par image</h2>
      {message && (
        <div 
          style={{
            padding: '10px',
            margin: '10px 0',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
          }}
        >
          {message}
        </div>
      )}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          cursor: loading ? "not-allowed" : "pointer",
          borderRadius: '1000px'
        }}
      >
        <input {...getInputProps()} />
        {loading ? (
          <p>Connexion en cours...</p>
        ) : (
          <>
            <Image src="/src/assets/images/IcoOutline.svg" height="125px" width="125px" />
            <p>Glissez-déposez votre image d'authentification ici,<br /> ou cliquez pour sélectionner un fichier</p>
          </>
        )}
      </div>
    </div>
  );
}
function Title(props) {
  return (
    <h1>{props.text}</h1>
  )
}

export default function Components() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus.isAuthenticated);
      setIsAdmin(authStatus.isAdmin);
      setLoading(false);
    };
  
    fetchAuthStatus();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate('/');
  };

  const handleLogin = async () => {
    const authStatus = await checkAuthStatus();
    setIsAuthenticated(authStatus.isAuthenticated);
    setIsAdmin(authStatus.isAdmin);

    if (authStatus.isAdmin) {
      navigate('/admin');
    } else if (authStatus.isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center' }}>

      <Image src="/src/assets/images/MA.jpg" />
      <Title text="Connectez-vous !" />
      
      <Button addclass="connection" width="500px" height="500px">
        <Login
        setIsAuthenticated={setIsAuthenticated}
        setIsAdmin={setIsAdmin}
        setMessage={setMessage}
        message={message}
      />
      </Button>
    </div>
  );
}