import React from "react";
import AdminListUsers from "./AdminListUsers";
import { useNavigate } from "react-router-dom";

const Aside = () => {

  const navigate = useNavigate(); // Move useNavigate to the top level

  const handleCreate = () => {
    navigate('/add'); // Use the navigate function here
  };

  return (
    <aside style={{ width: "200px", background: "#ddd", padding: "10px", display:'flex', flexDirection:'column', alignItems:'center' }} className="sidebar">
      <div style={{display: 'flex', flexDirection: 'row', alignItems:'center', justifyContent:'flex-end', gap:'10px', width: '100%'}}>
      <h2>Ajouter un utilisateur</h2>
        <button className="btn-primary btn-action" onClick={handleCreate}>
          <svg style={{width: '25px', height:'fit-content'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
            <path fill="#ffffff" d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM504 312l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/>
          </svg>
        </button>
      </div>

      <AdminListUsers/>
      
    </aside>
  );
};

export default Aside;