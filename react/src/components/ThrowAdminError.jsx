function ThrowAdminError({ error, setError }) {
  return (
    <div className="admin-error">
      <h2>Erreur</h2>
      <div className="error-message">{error}</div>
      <button onClick={() => setError(null)} className="btn-primary">OK</button>
    </div>
  );
}

export default ThrowAdminError;