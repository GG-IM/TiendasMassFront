// CompanyLogo.jsx
import React from 'react';
import './AuthStyles.css';

function CompanyLogo() {
  return (
    <div className="logo-container">
      <div className="logo-placeholder">
        {
        <img 
          src="frontend/src/assets/logo.png" 
          alt="Logo de la empresa" 
          className="company-logo" 
        />
        }
      </div>
    </div>
  );
}

export default CompanyLogo;