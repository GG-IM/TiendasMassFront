import React, { useEffect, useState } from 'react';
import { Edit3, Trash2, Plus, Star } from 'lucide-react';
import './styleperfil.css';
import Swal from 'sweetalert2';
import { useUsuario } from '../../context/userContext';

const initialForm = {
  id: null,
  nombre: '',
  calle: '',
  ciudad: '',
  codigoPostal: '',
  pais: 'Perú',
  referencia: '',
  esPrincipal: false,
};

const Addresses = () => {
  const { usuario, getAuthHeaders } = useUsuario();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);

  // Cargar direcciones del usuario
  const fetchAddresses = async () => {
    if (!usuario?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/direcciones/usuario/${usuario.id}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setAddresses(data);
    } catch (err) {
      Swal.fire('Error', 'No se pudieron cargar las direcciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line
  }, [usuario?.id]);

  // Abrir modal para nueva dirección
  const handleAdd = () => {
    setForm(initialForm);
    setIsEditing(false);
    setShowModal(true);
  };

  // Abrir modal para editar dirección
  const handleEdit = (address) => {
    setForm({ ...address });
    setIsEditing(true);
    setShowModal(true);
  };

  // Eliminar dirección
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar dirección?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/direcciones/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      Swal.fire('Eliminado', 'Dirección eliminada', 'success');
      fetchAddresses();
    } catch {
      Swal.fire('Error', 'No se pudo eliminar', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Guardar dirección (crear o editar)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.calle || !form.ciudad || !form.codigoPostal) {
      Swal.fire('Campos requeridos', 'Completa todos los campos obligatorios', 'warning');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        usuarioId: usuario.id,
        esPrincipal: !!form.esPrincipal,
      };
      let res;
      if (isEditing) {
        res = await fetch(`http://localhost:3000/api/direcciones/${form.id}`, {
          method: 'PUT',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('http://localhost:3000/api/direcciones', {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error();
      setShowModal(false);
      Swal.fire('Éxito', `Dirección ${isEditing ? 'actualizada' : 'creada'} correctamente`, 'success');
      fetchAddresses();
    } catch {
      Swal.fire('Error', 'No se pudo guardar la dirección', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Establecer como principal
  const handleSetPrincipal = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/direcciones/${id}/principal`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      Swal.fire('Éxito', 'Dirección principal actualizada', 'success');
      fetchAddresses();
    } catch {
      Swal.fire('Error', 'No se pudo actualizar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addresses-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Mis Direcciones</h2>
          <p>Administra tus direcciones de envío</p>
        </div>
        <button className="add-btn" onClick={handleAdd} disabled={loading}>
          <Plus size={16} /> Nueva Dirección
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      <div className="addresses-grid">
        {addresses.length === 0 && !loading && <p>No tienes direcciones registradas.</p>}
        {addresses.map((address) => (
          <div key={address.id} className="address-card">
            <div className="address-header">
              <div className="address-type-container">
                <span className="address-type">{address.nombre}</span>
                {address.esPrincipal && <span className="default-badge">Principal <Star size={12} /></span>}
              </div>
              <div className="address-actions">
                {!address.esPrincipal && (
                  <button className="action-btn" title="Hacer principal" onClick={() => handleSetPrincipal(address.id)}>
                    <Star size={14} />
                  </button>
                )}
                <button className="action-btn edit-action" title="Editar" onClick={() => handleEdit(address)}>
                  <Edit3 size={14} />
                </button>
                <button className="action-btn delete-action" title="Eliminar" onClick={() => handleDelete(address.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="address-details">
              <div className="address-line">{address.calle}</div>
              <div className="address-line">{address.ciudad}, {address.codigoPostal}</div>
              <div className="address-line">{address.pais}</div>
              {address.referencia && <div className="address-line"><small>Referencia: {address.referencia}</small></div>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para agregar/editar dirección */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? 'Editar Dirección' : 'Nueva Dirección'}</h3>
            <form onSubmit={handleSave} className="address-form">
              <label>
                Nombre (Casa, Trabajo, etc.)*
                <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </label>
              <label>
                Calle*
                <input type="text" value={form.calle} onChange={e => setForm({ ...form, calle: e.target.value })} required />
              </label>
              <label>
                Ciudad*
                <input type="text" value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} required />
              </label>
              <label>
                Código Postal*
                <input type="text" value={form.codigoPostal} onChange={e => setForm({ ...form, codigoPostal: e.target.value })} required />
              </label>
              <label>
                País
                <input type="text" value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })} />
              </label>
              <label>
                Referencia
                <input type="text" value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} />
              </label>
              <label className="principal-checkbox">
                <input type="checkbox" checked={form.esPrincipal} onChange={e => setForm({ ...form, esPrincipal: e.target.checked })} />
                Hacer principal
              </label>
              <div className="modal-actions">
                <button type="submit" className="save-btn" disabled={loading}>{isEditing ? 'Guardar Cambios' : 'Agregar Dirección'}</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)} disabled={loading}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
