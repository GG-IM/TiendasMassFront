import React, { useState } from 'react';
import { Edit, Trash2, Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { mockOrderStatuses } from '../../data/mockData.jsx';

const StatusManager = () => {
  const [statuses, setStatuses] = useState(mockOrderStatuses);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6c757d',
    active: true,
    order: 1
  });

  const filteredStatuses = statuses
    .filter(status =>
      status.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.order - b.order);

  const handleEdit = (status) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      description: status.description,
      color: status.color,
      active: status.active,
      order: status.order
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingStatus(null);
    setFormData({
      name: '',
      description: '',
      color: '#6c757d',
      active: true,
      order: statuses.length + 1
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingStatus) {
      setStatuses(statuses.map(s =>
        s.id === editingStatus.id
          ? { ...s, ...formData }
          : s
      ));
    } else {
      const newStatus = {
        id: Date.now(),
        ...formData
      };
      setStatuses([...statuses, newStatus]);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este estado?')) {
      setStatuses(statuses.filter(s => s.id !== id));
    }
  };

  const toggleActive = (id) => {
    setStatuses(statuses.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const moveStatus = (id, direction) => {
    const currentStatus = statuses.find(s => s.id === id);
    if (!currentStatus) return;

    const newOrder = direction === 'up' ? currentStatus.order - 1 : currentStatus.order + 1;
    const swapStatus = statuses.find(s => s.order === newOrder);

    if (swapStatus) {
      setStatuses(statuses.map(s => {
        if (s.id === id) return { ...s, order: newOrder };
        if (s.id === swapStatus.id) return { ...s, order: currentStatus.order };
        return s;
      }));
    }
  };

  return (
    <div className="status-manager fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Gestión de Estados</h1>
          <p className="text-muted">Configura los estados de los pedidos y su flujo</p>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Estados de Pedidos</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar estados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <button className="btn btn-mass-yellow" onClick={handleAdd}>
              <Plus size={16} className="me-1" />
              Agregar Estado
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Estado</th>
                <th>Descripción</th>
                <th>Color</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatuses.map((status) => (
                <tr key={status.id}>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => moveStatus(status.id, 'up')}
                        disabled={status.order === 1}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => moveStatus(status.id, 'down')}
                        disabled={status.order === statuses.length}
                      >
                        <ArrowDown size={12} />
                      </button>
                      <span className="align-self-center fw-bold">{status.order}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{ backgroundColor: status.color, color: 'white' }}
                    >
                      {status.name}
                    </span>
                  </td>
                  <td>{status.description}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: status.color,
                          borderRadius: '4px'
                        }}
                      ></div>
                      <span>{status.color}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className={`badge ${status.active ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleActive(status.id)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {status.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-action btn-edit me-1"
                      onClick={() => handleEdit(status)}
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(status.id)}
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

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingStatus ? 'Editar Estado' : 'Agregar Estado'}
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
                    <label className="form-label">Nombre del Estado *</label>
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
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Color *</label>
                        <input
                          type="color"
                          className="form-control"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Orden *</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
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
                      Estado activo
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
                    {editingStatus ? 'Actualizar' : 'Guardar'}
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

export default StatusManager;
