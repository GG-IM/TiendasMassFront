import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Plus, Search, Eye } from 'lucide-react';

const GestionUsuario = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: '',
    direccion: '',
    telefono: '',
    ciudad: '',
    codigoPostal: '',
    estadoId: 1,
    active: true,
  });

  const API_URL = 'https://tienditamassback-gqaqcfaqg0b7abcj.canadacentral-01.azurewebsites.net';

  // Mapeo de roles de BD a nombres para mostrar
  const rolMapping = {
    'admin': 'Administrador',
    'cliente': 'Cliente'
  };

  // Mapeo inverso para enviar a la BD
  const rolMappingReverse = {
    'Administrador': 'admin',
    'Cliente': 'cliente'
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get( `${API_URL}/api/roles`);  
      setRoles(response.data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/usuarios`);
      const formatted = response.data.map(user => ({
        ...user,
        rol: rolMapping[user.rol?.nombre] || user.rol?.nombre || 'Cliente',
        lastLogin: new Date().toISOString(),
        active: true,
      }));
      setUsers(formatted);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()); // ✅ Cambiar correo por email
    const matchRole = selectedRole === '' || user.rol.id.toString() === selectedRole; // ✅ Comparar IDs
    return matchSearch && matchRole;
  });
  const handleEdit = user => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol?.id?.toString() || user.rolId?.toString() || '2',
      direccion: user.direccion || '',
      telefono: user.telefono || '',
      ciudad: user.ciudad || '',
      codigoPostal: user.codigoPostal || '',
      estadoId: user.estadoId || user.estado?.id || 1,
      active: user.active ?? true,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: '2',
      direccion: '',
      telefono: '',
      ciudad: '',
      codigoPostal: '',
      estadoId: 1,
      active: true,
    });
    setShowModal(true);
  };



  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const dataToSend = {
        nombre: formData.nombre,
        email: formData.email,
        direccion: formData.direccion,
        estadoId: formData.estadoId,
        telefono: formData.telefono,
        ciudad: formData.ciudad,
        codigoPostal: formData.codigoPostal,
        rolId: parseInt(formData.rol)
      };

      // Agregar password solo si es un nuevo usuario o si se especificó
      if (!editingUser || formData.password) {
        dataToSend.password = formData.password;
      }

      if (editingUser) {
        await axios.put(`${API_URL}/api/usuarios/update/${editingUser.id}`, dataToSend);
      } else {
        await axios.post(`${API_URL}/api/usuarios/register`, dataToSend);
      }

      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async id => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await axios.delete(`${API_URL}/api/usuarios/delete/${id}`);
        fetchUsers(); // Recargar la lista después de eliminar
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar usuario: ' + (error.response?.data?.message || error.message));
      }
    }
  };


  const toggleActive = id => {
    setUsers(users.map(u => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const getRoleBadge = rol => {
    switch (rol) {
      case 'Administrador':
        return 'badge-danger';
      case 'Vendedor':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  return (
    <div className="user-manager fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Gestión de Usuarios</h1>
          <p className="text-muted">Administra usuarios del sistema</p>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Lista de Usuarios</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <select
              className="form-select"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              <option value="">Todos los roles</option>
              {/* ✅ NUEVO - Dinámico */}
              {roles.map(rol => (
                <option key={rol.id} value={rol.id.toString()}>
                  {rol.nombre === 'admin' ? 'Administrador' :
                    rol.nombre === 'cliente' ? 'Cliente' : rol.nombre}
                </option>
              ))}
            </select>
            <button className="btn btn-mass-yellow" onClick={handleAdd}>
              <Plus size={16} className="me-1" />
              Agregar Usuario
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Último Acceso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.nombre}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${getRoleBadge(user.rol)}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td>{new Date(user.lastLogin).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`badge ${user.active ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleActive(user.id)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {user.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    {/* <button className="btn-action btn-view me-1" title="Ver">
                      <Eye size={14} />
                    </button> */}
                    <button
                      className="btn-action btn-edit me-1"
                      onClick={() => handleEdit(user)}
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(user.id)}
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
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser ? 'Editar Usuario' : 'Agregar Usuario'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Correo *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contraseña *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>

                  <div className="form-group">
                    <label>Rol *</label>
                    <select
                      className="form-select"
                      value={formData.rol}
                      onChange={e => setFormData({ ...formData, rol: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      {/* ✅ NUEVO - Mapeo dinámico desde la BD */}
                      {roles.map(rol => (
                        <option key={rol.id} value={rol.id.toString()}>
                          {rol.nombre === 'admin' ? 'Administrador' :
                            rol.nombre === 'cliente' ? 'Cliente' : rol.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Dirección</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.direccion}
                      onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Ciudad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.ciudad}
                      onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.telefono}
                      onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Código Postal</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.codigoPostal}
                      onChange={e => setFormData({ ...formData, codigoPostal: e.target.value })}
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="active"
                      checked={formData.active}
                      onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="active">
                      Usuario activo
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-mass-blue">
                    {editingUser ? 'Actualizar' : 'Guardar'}
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

export default GestionUsuario;
