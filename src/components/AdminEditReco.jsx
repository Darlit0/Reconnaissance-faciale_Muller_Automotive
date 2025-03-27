import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Cette constante est maintenue comme valeur par défaut au cas où la récupération échoue
const DEFAULT_SEUIL = 60;

function AdminEditReco() {
  const navigate = useNavigate();
  const [seuil, setSeuil] = useState(DEFAULT_SEUIL);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Récupération du seuil actuel au chargement du composant
  useEffect(() => {
    const fetchCurrentSeuil = async () => {
      try {
        setIsInitializing(true);
        const response = await fetch("http://localhost:3001/admin/getSeuil");
        
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du seuil actuel.");
        }
        
        const data = await response.json();
        // Mise à jour du seuil avec la valeur récupérée
        setSeuil(data.seuil);
      } catch (error) {
        console.error("Erreur:", error);
        // En cas d'erreur, on garde la valeur par défaut
      } finally {
        setIsInitializing(false);
      }
    };

    fetchCurrentSeuil();
  }, []);

  const handleUpdateSeuil = async (e) => {
    e.preventDefault();
    if (seuil >= 1 && seuil <= 100) {
      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:3001/admin/changeSeuil", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ seuil }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la mise à jour du seuil.");
        }

        // Si la requête réussit, naviguer vers la page précédente
        navigate(-1);
      } catch (error) {
        console.error("Erreur:", error);
        alert("Une erreur s'est produite lors de la mise à jour du seuil.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Veuillez entrer un nombre entre 1 et 100.");
    }
  };

  return (
    <div className="admin-section">
      <h2>Modifier le seuil</h2>
      {isInitializing ? (
        <p>Chargement du seuil actuel...</p>
      ) : (
        <form onSubmit={handleUpdateSeuil}>
          <div className="form-group">
            <label>Seuil (entre 1 et 100):</label>
            <input
              type="number"
              value={seuil}
              onChange={(e) => setSeuil(Number(e.target.value))}
              min="1"
              max="100"
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Valider"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AdminEditReco;