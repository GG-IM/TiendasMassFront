import React from 'react';
import { Edit3, Trash2, Plus, CreditCard } from 'lucide-react';
import './styleperfil.css';

const Payments = ({ paymentMethods }) => {
  return (
    <div className="payments-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Métodos de Pago</h2>
          <p>Gestiona tus tarjetas y métodos de pago</p>
        </div>
        <button className="add-btn">
          <Plus size={16} />
          Agregar Tarjeta
        </button>
      </div>

      <div className="payments-grid">
        {paymentMethods.map((payment) => (
          <div key={payment.id} className="payment-card">
            <div className="payment-header">
              <div className="payment-brand">
                <div className={`card-icon ${payment.type.toLowerCase()}`}>
                  <CreditCard size={20} />
                </div>
                <div className="payment-info">
                  <span className="payment-type">{payment.type}</span>
                  <span className="payment-number">•••• •••• •••• {payment.last4}</span>
                </div>
              </div>
              {payment.isDefault && <span className="default-badge">Principal</span>}
            </div>
            <div className="payment-details">
              <div className="payment-expiry">Expira {payment.expiry}</div>
            </div>
            <div className="payment-actions">
              <button className="action-btn edit-action" title="Editar">
                <Edit3 size={14} />
              </button>
              <button className="action-btn delete-action" title="Eliminar">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payments;
