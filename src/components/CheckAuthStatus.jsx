const CheckAuthStatus = async () => {
  try {
    const response = await fetch('http://localhost:3001/admin/users', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      return { isAuthenticated: true, isAdmin: true };
    } else if (response.status === 401) {
      return { isAuthenticated: false, isAdmin: false };
    } else if (response.status === 403) {
      return { isAuthenticated: true, isAdmin: false };
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    // Explicitly return a fallback value
    return { isAuthenticated: false, isAdmin: false };
  }
};

export default CheckAuthStatus;