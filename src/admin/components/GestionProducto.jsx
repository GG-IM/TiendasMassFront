import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Plus, Search } from 'lucide-react';
import axios from 'axios';
import swal from 'sweetalert2';
//import { mockProducts, mockCategories } from '../../data/mockData.jsx';
const URL = "https://tienditamassback-gqaqcfaqg0b7abcj.canadacentral-01.azurewebsites.net";
const ProductManager = () => {

  const API_URL = `${URL}/api/products`;
  const CATEGORY_URL = `${URL}/api/categorias`;

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productosRes, categoriasRes] = await Promise.all([
          axios.get(API_URL),
          axios.get(CATEGORY_URL),
          
        ]);

        setProducts(productosRes.data);
        console.log('📦 Productos recibidos:', productosRes.data);
        setCategorias(categoriasRes.data);
        setError('');
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los datos. Por favor, recarga la página.',
        });
        setError('Error al cargar los datos. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoriaId: '',
    stock: '',
    marca: '',
    imagen: null,
    estado: true,
  });


  const productsPerPage = 10;

  const filteredProducts = products.filter(product => {
    const nombre = product.nombre || '';
    const descripcion = product.descripcion || '';

    const matchesSearch =
      nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === '' ||
      product.categoria?.id?.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  });


  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      : product..toString(),
      stock: product.stock.toString(),
      marca: product.marca || '',
      imagen: null,
      categoriaId: product.categoria?.id?.toString() || '',
      estado: product.estado?.nombre === 'Activo',
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      : '',
      categoriaId: '',
      stock: '',
      marca: '',
      imagen: null,
      estado: true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!formData.nombre || !formData. || !formData.stock || !formData.categoriaId) {
      swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor completa todos los campos requeridos',
      });
      return;
    }

    // Validar que el  y stock sean números positivos
    if (parseFloat(formData.) <= 0 || parseInt(formData.stock) < 0) {
      swal.fire({
        icon: 'warning',
        title: 'Datos inválidos',
        text: 'El  debe ser mayor a 0 y el stock no puede ser negativo',
      });
      return;
    }

    const form = new FormData();
    form.append('nombre', formData.nombre);
    form.append('descripcion', formData.descripcion);
    form.append('precio', formData.precio);
    form.append('stock', formData.stock);
    form.append('marca', formData.marca || '');
    form.append('categoria_id', formData.categoriaId); // Corregido: usar categoria_id
    form.append('estado', formData.estado.toString());

    if (formData.imagen) {
      console.log('📸 Archivo seleccionado:', formData.imagen);
      form.append('imagen', formData.imagen);
    }

    // Debug: ver qué datos se están enviando
    console.log('📤 Datos a enviar:');
    for (let [key, value] of form.entries()) {
      console.log(key, value);
    }

    try {
      setLoading(true);
      if (editingProduct) {
        const response = await axios.put(`${API_URL}/${editingProduct.id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // Actualizar la lista de productos
        setProducts(products.map(p => p.id === editingProduct.id ? response.data : p));
        swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Producto actualizado exitosamente',
        });
      } else {
        const res = await axios.post(API_URL, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProducts([res.data, ...products]);
        swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Producto creado exitosamente',
        });
      }
      setShowModal(false);
      setError('');
    } catch (error) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al guardar el producto. Por favor, intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    const result = await swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de eliminar este producto?',
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
        setProducts(products.filter(p => p.id !== id));
        swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Producto eliminado exitosamente',
        });
        setError('');
      } catch (error) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar el producto. Por favor, intenta de nuevo.',
        });
      } finally {
        setLoading(false);
      }
    }
  };


  const toggleActive = async (product) => {
    try {
      setLoading(true);
      const newEstado = product.estado?.nombre === 'Activo' ? false : true;
      
      const form = new FormData();
      form.append('estado', newEstado.toString());
      
      const response = await axios.put(`${API_URL}/${product.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setProducts(products.map(p => p.id === product.id ? response.data : p));
      setError('');
    } catch (error) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cambiar el estado del producto',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        swal.fire({
          icon: 'warning',
          title: 'Tipo de archivo inválido',
          text: 'Por favor selecciona solo archivos de imagen',
        });
        return;
      }
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        swal.fire({
          icon: 'warning',
          title: 'Archivo muy grande',
          text: 'La imagen no puede ser mayor a 5MB',
        });
        return;
      }
      setFormData({ ...formData, imagen: file });
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-mass-blue" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="product-manager fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Gestión de Productos</h1>
          <p className="text-muted">Administra el catálogo de productos del minimarket</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Lista de Productos</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>

            <button className="btn btn-mass-yellow" onClick={handleAdd} disabled={loading}>
              <Plus size={16} className="me-1" />
              Agregar Producto
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.imagen ? `${URL}/${product.imagen}` : '/placeholder-image.jpg'}
                      alt={product.nombre}
                      className="rounded"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />

                  </td>
                  <td>
                    <div>
                      <strong>{product.nombre}</strong>
                      <br />
                      <small className="text-muted">{product.descripcion}</small>
                      {product.marca && (
                        <>
                          <br />
                          <small className="text-info">Marca: {product.marca}</small>
                        </>
                      )}
                    </div>
                  </td>
                  <td>{product.categoria ? product.categoria.nombre : 'Sin categoría'}</td>
                  <td><strong>S/.{Number(product.precio).toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${product.stock > 20 ? 'badge-success' : product.stock > 5 ? 'badge-warning' : 'badge-danger'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge ${product.estado?.nombre === 'Activo' ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleActive(product)}
                      style={{ border: 'none', cursor: 'pointer' }}
                      disabled={loading}
                    >
                      {product.estado?.nombre === 'Activo' ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <button className="btn-action btn-view me-1" title="Ver">
                      <Eye size={14} />
                    </button>
                    <button
                      className="btn-action btn-edit me-1"
                      onClick={() => handleEdit(product)}
                      title="Editar"
                      disabled={loading}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(product.id)}
                      title="Eliminar"
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
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
                  <div className="row">
                    <div className="col-md-6">
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
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Categoría *</label>
                        <select
                          className="form-select"
                          value={formData.categoriaId}
                          onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                          required
                          disabled={loading}
                        >
                          <option value="">Seleccionar categoría</option>
                          {categorias.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label className="form-label">Marca</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.marca}
                          onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                          placeholder="Ej: La Favorita, Nestlé, etc."
                          disabled={loading}
                        />
                      </div>
                    </div>
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
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Precio *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          value={formData.precio}
                          onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Stock *</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Imagen</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={handleImageChange}
                          disabled={loading}
                        />
                        <small className="text-muted">Máximo 5MB. Formatos: JPG, PNG, GIF</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="estadoCheck"
                        checked={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="estadoCheck">
                        Producto activo
                      </label>
                    </div>
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
                        {editingProduct ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      editingProduct ? 'Actualizar' : 'Guardar'
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

export default ProductManager;
