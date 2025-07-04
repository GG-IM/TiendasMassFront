import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import axios from 'axios';
import swal from 'sweetalert2';
//import { mockCategories } from '../../data/mockData.jsx';

const URL = "https://tienditamassback-gqaqcfaqg0b7abcj.canadacentral-01.azurewebsites.net";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: true,
    imagen: null // Añadir campo de imagen
  });

  const API_URL = `${URL}/api/categorias`;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        console.log('📦 Categorías recibidas:', res.data);
        setCategories(res.data);
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron obtener las categorías.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = Array.isArray(categories)
    ? categories.filter(category =>
      (category.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion,
      estado: category.estado?.nombre === 'Activo',
      imagen: category.imagen // Cargar la URL de la imagen al editar
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      nombre: '',
      descripcion: '',
      estado: true,
      imagen: null // Iniciar el campo imagen vacío
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre de la categoría es obligatorio',
      });
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append('nombre', formData.nombre);
      form.append('descripcion', formData.descripcion);
      form.append('estado', formData.estado.toString());

      // Si hay una imagen seleccionada, la agregamos al formulario
      if (formData.imagen) {
        form.append('imagen', formData.imagen);
      }

      if (editingCategory) {
        // Actualizar
        const response = await axios.put(`${API_URL}/${editingCategory.id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setCategories(categories.map(c =>
          c.id === editingCategory.id ? response.data : c
        ));

        swal.fire({
          icon: 'success',
          title: 'Actualizada',
          text: 'Categoría actualizada exitosamente',
        });
      } else {
        // Crear
        const res = await axios.post(API_URL, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCategories([res.data, ...categories]);

        swal.fire({
          icon: 'success',
          title: 'Creada',
          text: 'Categoría creada exitosamente',
        });
      }

      setShowModal(false);
    } catch (error) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo guardar la categoría.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await swal.fire({
      title: '¿Está seguro de eliminar esta categoría?',
      text: "Esta acción no se puede deshacer.",
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
        await axios.delete(`${API_URL}/${id}`);
        setCategories(categories.filter(c => c.id !== id));
        swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'La categoría ha sido eliminada.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la categoría.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleActive = async (category) => {
    try {
      setLoading(true);
      const newEstado = category.estado?.nombre === 'Activo' ? false : true;

      const form = new FormData();
      form.append('estado', newEstado.toString());

      const response = await axios.put(`${API_URL}/${category.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCategories(categories.map(c => c.id === category.id ? response.data : c));
    } catch (error) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado de la categoría.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-mass-blue" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="category-manager fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Gestión de Categorías</h1>
          <p className="text-muted">Organiza y administra las categorías de productos</p>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Lista de Categorías</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <button className="btn btn-mass-yellow" onClick={handleAdd} disabled={loading}>
              <Plus size={16} className="me-1" />
              Agregar Categoría
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Productos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td><strong>{category.nombre}</strong></td>
                  <td>{category.descripcion}</td>
                  <td>
                    <span className="badge badge-primary">
                      {category.productos?.length || 0} productos
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge ${category.estado?.nombre === 'Activo' ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleActive(category)}
                      style={{ border: 'none', cursor: 'pointer' }}
                      disabled={loading}
                    >
                      {category.estado?.nombre === 'Activo' ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-action btn-edit me-1"
                      onClick={() => handleEdit(category)}
                      title="Editar"
                      disabled={loading}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(category.id)}
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
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
                    <label className="form-label">Nombre *</label>
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
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="estado"
                      checked={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="estado">
                      Categoría activa
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Imagen (opcional)</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setFormData({ ...formData, imagen: e.target.files[0] })}
                      disabled={loading}
                    />
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
                        {editingCategory ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      editingCategory ? 'Actualizar' : 'Guardar'
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

export default CategoryManager;
