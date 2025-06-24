import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Folder, Users, ShoppingCart, Settings, CreditCard } from 'lucide-react';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation(); // Detectar ruta activa

  const menuItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { to: '/admin/productos', label: 'Productos', icon: Package },
    { to: '/admin/categorias', label: 'Categorías', icon: Folder },
    { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { to: '/admin/reportes', label: 'Pedidos', icon: ShoppingCart },
    { to: '/admin/estados', label: 'Estados', icon: Settings },
    { to: '/admin/metodos-pago', label: 'Métodos de Pago', icon: CreditCard },
  ];

  return (
    <nav className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">M</div>
          {!collapsed && <div className="logo-text">Mass Admin</div>}
        </div>
      </div>

      <ul className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <li key={item.to} className="nav-item">
              <Link
                to={item.to}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <IconComponent className="nav-icon" />
                {!collapsed && <span className="nav-text">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
