import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = "https://tienditamassback-gqaqcfaqg0b7abcj.canadacentral-01.azurewebsites.net";
const StatusManager = () => {
  const [statuses, setStatuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#6c757d',
    activo: true,
    orden: 1
  });

  // Cargar estados desde el backend
  const loadStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/estados`);
      if (!response.ok) {
        throw new Error('Error al cargar estados');
      }
      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los estados'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  const filteredStatuses = statuses
    .filter(status =>
      status.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (status.descripcion && status.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.orden - b.orden);

  const handleEdit = (status) => {
    setEditingStatus(status);
    setFormData({
      nombre: status.nombre,
      descripcion: status.descripcion || '',
      color: status.color,
      activo: status.activo,
      orden: status.orden
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingStatus(null);
    setFormData({
      nombre: '',
      descripcion: '',
      color: '#6c757d',
      activo: true,
      orden: statuses.length + 1
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const url = editingStatus 
        ? `${API_URL}/api/estados/${editingStatus.id}`
        : `${API_URL}/api/estados`;
      
      const method = editingStatus ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la operación');
      }

      const result = await response.json();
      
      if (editingStatus) {
        setStatuses(statuses.map(s =>
          s.id === editingStatus.id ? result : s
        ));
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Estado actualizado correctamente'
        });
      } else {
        setStatuses([...statuses, result]);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Estado creado correctamente'
        });
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error en la operación'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/estados/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar');
        }

        setStatuses(statuses.filter(s => s.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Estado eliminado correctamente'
        });
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al eliminar estado'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleActive = async (id) => {
    try {
      const status = statuses.find(s => s.id === id);
      if (!status) return;

      const response = await fetch(`${API_URL}/api/estados/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...status,
          activo: !status.activo
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado');
      }

      const updatedStatus = await response.json();
      setStatuses(statuses.map(s =>
        s.id === id ? updatedStatus : s
      ));
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cambiar el estado'
      });
    }
  };

  const moveStatus = async (id, direction) => {
    try {
      const currentStatus = statuses.find(s => s.id === id);
      if (!currentStatus) return;

      const newOrder = direction === 'up' ? currentStatus.orden - 1 : currentStatus.orden + 1;
      const swapStatus = statuses.find(s => s.orden === newOrder);

      if (swapStatus) {
        // Actualizar ambos estados
        const response = await fetch(`${API_URL}/api/estados/orden/actualizar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estados: [
              { id: id, orden: newOrder },
              { id: swapStatus.id, orden: currentStatus.orden }
            ]
          }),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar el orden');
        }

        const updatedStatuses = await response.json();
        setStatuses(updatedStatuses);
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cambiar el orden'
      });
    }
  };

  if (loading && statuses.length === 0) {
    return (
      <div className="status-manager fade-in">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="text-mass-blue mb-0">Gestión de Estados</h1>
            <p className="text-muted">Configura los estados de los pedidos y su flujo</p>
          </div>
        </div>
        <div className="text-center py-5">
          <div className="spinner-border text-mass-blue" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando estados...</p>
        </div>
      </div>
    );
  }

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
            <button className="btn btn-mass-yellow" onClick={handleAdd} disabled={loading}>
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
                        disabled={status.orden === 1 || loading}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => moveStatus(status.id, 'down')}
                        disabled={status.orden === statuses.length || loading}
                      >
                        <ArrowDown size={12} />
                      </button>
                      <span className="align-self-center fw-bold">{status.orden}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{ backgroundColor: status.color, color: 'white' }}
                    >
                      {status.nombre}
                    </span>
                  </td>
                  <td>{status.descripcion || 'Sin descripción'}</td>
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
                      className={`badge ${status.activo ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleActive(status.id)}
                      style={{ border: 'none', cursor: 'pointer' }}
                      disabled={loading}
                    >
                      {status.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-action btn-edit me-1"
                      onClick={() => handleEdit(status)}
                      title="Editar"
                      disabled={loading}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(status.id)}
                      title="Eliminar"
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStatuses.length === 0 && !loading && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron estados</p>
            </div>
          )}
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
                  disabled={loading}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Nombre del Estado *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      disabled={loading}
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
                          disabled={loading}
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
                          value={formData.orden}
                          onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="activo">
                      Estado activo
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-mass-blue" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {editingStatus ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      editingStatus ? 'Actualizar' : 'Guardar'
                    )}
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
