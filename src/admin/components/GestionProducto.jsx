
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Plus, Search } from 'lucide-react';
import axios from 'axios';
//import { mockProducts, mockCategories } from '../../data/mockData.jsx';

const ProductManager = () => {

  const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;
  const CATEGORY_URL = `${import.meta.env.VITE_API_URL}/api/categorias`;


  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosRes, categoriasRes, estadosRes] = await Promise.all([
          axios.get(API_URL),
          axios.get(CATEGORY_URL),
        ]);

        setProducts(productosRes.data);
        console.log('📦 Productos recibidos:', productosRes.data);
        setCategorias(categoriasRes.data);
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
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
    imagen: '',
    estadoId: '',
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
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      marca: product.marca || '',
      imagen: product.imagen || '',
      categoriaId: product.categoria?.id || '',
      estadoId: product.estado?.id || '',
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: '',
      active: true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('nombre', formData.nombre);
    form.append('descripcion', formData.descripcion);
    form.append('precio', formData.precio);
    form.append('stock', formData.stock);
    form.append('marca', formData.marca || '');
    form.append('categoriaId', formData.categoriaId);
    form.append('estadoId', formData.estadoId);

    if (formData.imagen) {
      console.log('📸 Archivo seleccionado:', formData.imagen);

      form.append('imagen', formData.imagen); // este es el archivo
    }

    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/${editingProduct.id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const res = await axios.post(API_URL, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProducts([res.data, ...products]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('❌ Error al guardar producto:', error);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
      }
    }
  };


  const toggleActive = (id) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  return (
    <div className="product-manager fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Gestión de Productos</h1>
          <p className="text-muted">Administra el catálogo de productos del minimarket</p>
        </div>
      </div>

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
              value={formData.categoriaId}
              onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>

            <button className="btn btn-mass-yellow" onClick={handleAdd}>
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
                      src={product.imagen ? `${import.meta.env.VITE_API_URL}/${product.imagen}` : '/placeholder-image.jpg'}
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
                    </div>
                  </td>
                  <td>{product.categoria ? product.categoria.nombre : 'Sin categoría'}</td>
                  <td><strong>${product.precio.toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${product.stock > 20 ? 'badge-success' : product.stock > 5 ? 'badge-warning' : 'badge-danger'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge ${product.active ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleActive(product.id)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {product.active ? 'Activo' : 'Inactivo'}
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
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(product.id)}
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

        {/* Pagination */}
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
                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Precio *</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.precio}
                          onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">Stock *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">URL Imagen</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={(e) => setFormData({ ...formData, imagen: e.target.files[0] })}
                        />

                      </div>
                    </div>
                  </div>
                  {/* Puedes agregar aquí el checkbox de activo si tu modelo lo requiere */}
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
                    {editingProduct ? 'Actualizar' : 'Guardar'}
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