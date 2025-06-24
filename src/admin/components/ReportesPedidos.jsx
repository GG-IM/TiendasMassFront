import React, { useState } from 'react';
import { Eye, Download, Search, Filter } from 'lucide-react';
import { mockOrders } from '../../data/mockData.jsx';

const OrderReports = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showOrderDetails, setShowOrderDetails] = useState(null);

  const ordersPerPage = 10;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || order.status === selectedStatus;
    const matchesDate = dateFilter === '' || order.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completado':
        return 'badge-success';
      case 'En proceso':
        return 'badge-warning';
      case 'Pendiente':
        return 'badge-primary';
      case 'Cancelado':
        return 'badge-danger';
      default:
        return 'badge-primary';
    }
  };

  const getTotalSales = () => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  };

  const getOrdersByStatus = () => {
    const statusCount = {
      'Pendiente': 0,
      'En proceso': 0,
      'Completado': 0,
      'Cancelado': 0
    };

    filteredOrders.forEach(order => {
      statusCount[order.status]++;
    });

    return statusCount;
  };

  const handleExport = () => {
    const csvContent = [
      ['ID Pedido', 'Cliente', 'Total', 'Estado', 'Artículos', 'Fecha', 'Método de Pago'],
      ...filteredOrders.map(order => [
        order.orderId,
        order.customer,
        order.total.toString(),
        order.status,
        order.items.toString(),
        order.date,
        order.paymentMethod
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const statusCounts = getOrdersByStatus();

  return (
    <div className="order-reports fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Reportes de Pedidos</h1>
          <p className="text-muted">Analiza y gestiona los pedidos del sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stats-card blue">
            <div className="card-header">
              <h5 className="card-title">Total Pedidos</h5>
            </div>
            <h2 className="card-value">{filteredOrders.length}</h2>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stats-card yellow">
            <div className="card-header">
              <h5 className="card-title">Ventas Totales</h5>
            </div>
            <h2 className="card-value">${getTotalSales().toFixed(2)}</h2>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stats-card success">
            <div className="card-header">
              <h5 className="card-title">Completados</h5>
            </div>
            <h2 className="card-value">{statusCounts.Completado}</h2>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="stats-card danger">
            <div className="card-header">
              <h5 className="card-title">Pendientes</h5>
            </div>
            <h2 className="card-value">{statusCounts.Pendiente}</h2>
          </div>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">Lista de Pedidos</h3>
          <div className="table-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={16} />
            </div>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ width: 'auto' }}
            />
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <button className="btn btn-mass-yellow" onClick={handleExport}>
              <Download size={16} className="me-1" />
              Exportar
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Artículos</th>
                <th>Fecha</th>
                <th>Método de Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.orderId}</strong></td>
                  <td>{order.customer}</td>
                  <td><strong>${order.total.toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.items} items</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    <button
                      className="btn-action btn-view"
                      onClick={() => setShowOrderDetails(order)}
                      title="Ver detalles"
                    >
                      <Eye size={14} />
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

      {/* Modal de Detalles */}
      {showOrderDetails && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles del Pedido {showOrderDetails.orderId}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOrderDetails(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Información del Cliente</h6>
                    <p><strong>Nombre:</strong> {showOrderDetails.customer}</p>
                    <p><strong>Fecha del Pedido:</strong> {new Date(showOrderDetails.date).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Información del Pedido</h6>
                    <p><strong>Estado:</strong> 
                      <span className={`badge ${getStatusBadge(showOrderDetails.status)} ms-2`}>
                        {showOrderDetails.status}
                      </span>
                    </p>
                    <p><strong>Método de Pago:</strong> {showOrderDetails.paymentMethod}</p>
                    <p><strong>Total de Artículos:</strong> {showOrderDetails.items}</p>
                    <p><strong>Total a Pagar:</strong> <span className="text-mass-blue fw-bold">${showOrderDetails.total.toFixed(2)}</span></p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOrderDetails(null)}
                >
                  Cerrar
                </button>
                <button type="button" className="btn btn-mass-blue">
                  Imprimir Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderReports;