import React from 'react';
import { Edit3, Trash2, Plus } from 'lucide-react';
import './styleperfil.css';

const Addresses = ({ addresses }) => {
  return (
    <div className="addresses-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Mis Direcciones</h2>
          <p>Administra tus direcciones de envío</p>
        </div>
        <button className="add-btn">
          <Plus size={16} />
          Nueva Dirección
        </button>
      </div>

      <div className="addresses-grid">
        {addresses.map((address) => (
          <div key={address.id} className="address-card">
            <div className="address-header">
              <div className="address-type-container">
                <span className="address-type">{address.type}</span>
                {address.isDefault && <span className="default-badge">Principal</span>}
              </div>
              <div className="address-actions">
                <button className="action-btn edit-action" title="Editar">
                  <Edit3 size={14} />
                </button>
                <button className="action-btn delete-action" title="Eliminar">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="address-details">
              <div className="address-line">{address.street}</div>
              <div className="address-line">
                {address.city}, {address.zipCode}
              </div>
              <div className="address-line">{address.country}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Addresses;
