import React, { useState } from 'react';
import MAIcon from '/src/assets/images/MA.jpg';
import '/src/App.css';

import InputField from './InputField';
import Logout from './Logout';

// Composant Title
const Title = ({ text }) => {
  return <h1>{text}</h1>;
};

// Composant Image
const Image = ({ src, height }) => {
  return <img src={src} alt="Logo" style={{ height: height }} />;
};



// Composant Header
function Header( { isAuthenticated, isAdmin, setIsAuthenticated, setIsAdmin, setMessage } ) {
  const [title, setTitle] = useState("Muller");

  return (
    <header>
      <div style={{display: 'flex', flex: 1, height: 'inherit', flexDirection: 'row', alignItems: 'center'}}>
        
        <div>
          <h1 style={{marginLeft: "30px", color:'#cacfd2'}}>Muller Automotive</h1>
        </div>

        <div style={{display: 'flex', flex: 1, height: 'inherit', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', margin: "30px"}}>
          <div>
              {isAuthenticated && isAdmin && (
                <button 
                  style={{marginRight: "10px"}}
                  className="btn-reco" 
                  onClick={() => window.location.href = '/seuil'}
                >
                  Modifier taux de reconnaissance
                </button>
              )}
              
            </div>

            <div>
            {isAuthenticated && (
              <>
                <Logout 
                  setIsAuthenticated={setIsAuthenticated} 
                  setIsAdmin={setIsAdmin} 
                  setMessage={setMessage}
                />
              </>
            )}
            </div>
            
            <Image src={ MAIcon } height="75px"  />
          </div>

      </div>
    </header>
  );
};

export default Header;