import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
//import { mockCategories } from '../../data/mockData.jsx';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    active: true
  });

  const API_URL = 'http://localhost:3000/api/categorias';

  useEffect(() => {
    axios.get(API_URL)
      .then((res) => {
        console.log('📦 Datos recibidos desde backend:', res.data);
        setCategories(res.data);
      })
      .catch((err) => {
        import('sweetalert2').then((Swal) => {
          Swal.default.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron obtener las categorías.',
          });
        });
      });
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
      active: category.active
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      nombre: '',
      descripcion: '',
      active: true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        // Actualizar
        await axios.put(`${API_URL}/${editingCategory.id}`, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          active: formData.active,
        });

        setCategories(categories.map(c =>
          c.id === editingCategory.id
            ? { ...c, ...formData }
            : c
        ));
      } else {
        // Crear
        const res = await axios.post(API_URL, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          active: formData.active,
        });
        setCategories([res.data, ...categories]);
      }

      setShowModal(false);
    } catch (error) {
        Swal.default.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la categoría.',
        });
      
    }
  };


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Está seguro de eliminar esta categoría?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setCategories(categories.filter(c => c.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La categoría ha sido eliminada.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la categoría.',
        });
      }
    }
  };


  const toggleActive = async (id) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    try {
      await axios.put(`${API_URL}/${id}`, {
        nombre: category.nombre,
        descripcion: category.descripcion,
        active: !category.active,
      });

      setCategories(categories.map(c =>
        c.id === id ? { ...c, active: !c.active } : c
      ));
    } catch (error) {
      Swal.default.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado de la categoría.',
      });
    }
  };


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
            <button className="btn btn-mass-yellow" onClick={handleAdd}>
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
                      {category.productsCount} productos
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge ${category.activo ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleActive(category.id)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {category.activo ? 'Activa' : 'Inactiva'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-action btn-edit me-1"
                      onClick={() => handleEdit(category)}
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(category.id)}
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
                  {editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
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
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    ></textarea>
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
                      Categoría activa
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
                    {editingCategory ? 'Actualizar' : 'Guardar'}
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
