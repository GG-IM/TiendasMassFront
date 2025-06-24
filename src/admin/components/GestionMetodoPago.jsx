import React, { useState } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { mockPaymentMethods } from '../../data/mockData.jsx';

const PaymentMethodManager = () => {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
    commission: 0
  });

  const filteredMethods = paymentMethods.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    method.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      description: method.description,
      active: method.active,
      commission: method.commission
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      description: '',
      active: true,
      commission: 0
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingMethod) {
      setPaymentMethods(paymentMethods.map(m =>
        m.id === editingMethod.id
          ? { ...m, ...formData }
          : m
      ));
    } else {
      const newMethod = {
        id: Date.now(),
        ...formData
      };
      setPaymentMethods([newMethod, ...paymentMethods]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este método de pago?')) {
      setPaymentMethods(paymentMethods.filter(m => m.id !== id));
    }
  };

  const toggleActive = (id) => {
    setPaymentMethods(paymentMethods.map(m =>
      m.id === id ? { ...m, active: !m.active } : m
    ));
  };

  return (
    <div className="payment-method-manager fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Métodos de Pago</h1>
          <p className="text-muted">Gestiona los métodos de pago disponibles en el sistema</p>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Métodos de Pago</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar métodos de pago..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <button className="btn btn-mass-yellow" onClick={handleAdd}>
              <Plus size={16} className="me-1" />
              Agregar Método
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Método</th>
                <th>Descripción</th>
                <th>Comisión</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMethods.map((method) => (
                <tr key={method.id}>
                  <td><strong>{method.name}</strong></td>
                  <td>{method.description}</td>
                  <td>
                    <span className={`badge ${method.commission === 0 ? 'badge-success' : 'badge-warning'}`}>
                      {method.commission}%
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge ${method.active ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleActive(method.id)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {method.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-action btn-edit me-1"
                      onClick={() => handleEdit(method)}
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(method.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMethod ? 'Editar Método de Pago' : 'Agregar Método de Pago'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Nombre del Método *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comisión (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="form-control"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 0 })}
                    />
                    <small className="text-muted">Porcentaje de comisión aplicado a las transacciones</small>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="active">
                      Método activo
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-mass-blue">
                    {editingMethod ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManager;