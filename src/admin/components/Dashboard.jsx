import React from 'react';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Productos',
      value: '1,245',
      change: '+12%',
      changeType: 'positive',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Usuarios Activos',
      value: '892',
      change: '+8%',
      changeType: 'positive',
      icon: Users,
      color: 'success'
    },
    {
      title: 'Pedidos Hoy',
      value: '156',
      change: '+24%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'yellow'
    },
    {
      title: 'Ventas del Mes',
      value: '$45,230',
      change: '-3%',
      changeType: 'negative',
      icon: DollarSign,
      color: 'danger'
    }
  ];

  const recentOrders = [
    { id: '#001', customer: 'Juan Pérez', total: '$85.50', status: 'Completado', time: '10:30 AM' },
    { id: '#002', customer: 'María García', total: '$120.00', status: 'En proceso', time: '11:15 AM' },
    { id: '#003', customer: 'Carlos López', total: '$65.75', status: 'Pendiente', time: '11:45 AM' },
    { id: '#004', customer: 'Ana Martínez', total: '$210.25', status: 'Completado', time: '12:20 PM' },
    { id: '#005', customer: 'Pedro Sánchez', total: '$95.00', status: 'Cancelado', time: '12:45 PM' }
  ];

  const topProducts = [
    { name: 'Coca Cola 350ml', sold: 145, revenue: '$435.00' },
    { name: 'Pan Integral', sold: 98, revenue: '$196.00' },
    { name: 'Leche Entera 1L', sold: 87, revenue: '$261.00' },
    { name: 'Arroz 1kg', sold: 76, revenue: '$152.00' },
    { name: 'Aceite Girasol', sold: 65, revenue: '$325.00' }
  ];

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

  return (
    <div className="dashboard fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-mass-blue mb-0">Dashboard</h1>
          <p className="text-muted">Resumen general del sistema</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="col-xl-3 col-md-6 mb-3">
              <div className={`stats-card ${stat.color}`}>
                <div className="card-header">
                  <h5 className="card-title">{stat.title}</h5>
                  <div className={`card-icon ${stat.color}`}>
                    <IconComponent size={20} />
                  </div>
                </div>
                <h2 className="card-value">{stat.value}</h2>
                <p className={`card-change ${stat.changeType}`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {stat.change} desde el mes pasado
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="row">
        {/* Pedidos Recientes */}
        <div className="col-lg-8 mb-4">
          <div className="data-table">
            <div className="table-header">
              <h3 className="table-title">Pedidos Recientes</h3>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td><strong>{order.id}</strong></td>
                      <td>{order.customer}</td>
                      <td><strong>{order.total}</strong></td>
                      <td>
                        <span className={`badge ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Productos Más Vendidos */}
        <div className="col-lg-4 mb-4">
          <div className="data-table">
            <div className="table-header">
              <h3 className="table-title">Top Productos</h3>
            </div>
            <div className="p-3">
              {topProducts.map((product, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <div className="fw-bold text-truncate" style={{maxWidth: '150px'}}>
                      {product.name}
                    </div>
                    <small className="text-muted">{product.sold} vendidos</small>
                  </div>
                  <div className="text-end">
                    <strong className="text-mass-blue">{product.revenue}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;