import { useNavigate } from "react-router-dom";

const Error404 = () => {
  const navigate = useNavigate();
  return (
    <div style={{display: 'flex', height: '100%', flex: '1', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <h1> Erreur 404 </h1>
        <h3> La page n'existe pas </h3>
        <button type="button" className="btn-primary" onClick={() => navigate('/')}>
          Retourner a la page d'accueil
        </button>
    </div>
  );
};

export default Error404;